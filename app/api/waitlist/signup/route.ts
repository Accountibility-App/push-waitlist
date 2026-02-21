import { NextRequest, NextResponse } from "next/server";
import { waitlistSignupSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/utils";
import { hashForConsent, maskEmail } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendDoiEmail } from "@/lib/email";
import { generateDoiToken, getDoiExpiry } from "@/lib/doi";

const CONSENT_SALT = process.env.CONSENT_HASH_SALT ?? "push-waitlist-consent-v1";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const rateKey = `signup:${ip}`;
    const { allowed } = checkRateLimit(rateKey);
    if (!allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = waitlistSignupSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Ungültige Eingabe.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email, platforms, interest, ref, consent_version } = parsed.data;
    const userAgent = request.headers.get("user-agent") ?? "";
    const consentIpHash = await hashForConsent(ip, CONSENT_SALT);
    const consentUserAgentHash = userAgent
      ? await hashForConsent(userAgent, CONSENT_SALT)
      : null;

    let referredByUserId: string | null = null;
    if (ref) {
      const { data: referrer } = await supabaseAdmin
        .from("waitlist_users")
        .select("id")
        .eq("referral_code", ref.trim().toUpperCase())
        .eq("status", "confirmed")
        .single();
      referredByUserId = referrer?.id ?? null;
    }

    const referralCode = generateReferralCode();
    const { data: existing } = await supabaseAdmin
      .from("waitlist_users")
      .select("id, status")
      .ilike("email", email)
      .single();

    let userId: string;
    const platformsArray = platforms.length ? platforms : null;

    if (existing) {
      if (existing.status === "confirmed") {
        return NextResponse.json(
          { error: "Diese E-Mail ist bereits bestätigt. Prüfe dein Postfach für deinen Link." },
          { status: 409 }
        );
      }
      await supabaseAdmin
        .from("waitlist_users")
        .update({
          platforms: platformsArray,
          interest: interest || null,
          referred_by_user_id: referredByUserId,
          status: "pending",
          consent_text_version: consent_version,
          consent_at: new Date().toISOString(),
          consent_ip_hash: consentIpHash,
          consent_user_agent_hash: consentUserAgentHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      userId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("waitlist_users")
        .insert({
          email: email.toLowerCase(),
          platforms: platformsArray,
          interest: interest || null,
          status: "pending",
          referral_code: referralCode,
          referred_by_user_id: referredByUserId,
          consent_text_version: consent_version,
          consent_at: new Date().toISOString(),
          consent_ip_hash: consentIpHash,
          consent_user_agent_hash: consentUserAgentHash,
        })
        .select("id")
        .single();
      if (insertError) {
        console.error("Insert waitlist_users error:", insertError.message);
        return NextResponse.json(
          { error: "Registrierung fehlgeschlagen. Bitte später erneut versuchen." },
          { status: 500 }
        );
      }
      userId = inserted!.id;
    }

    const { raw: rawToken, hash: tokenHash } = generateDoiToken();
    const expiresAt = getDoiExpiry();
    const { error: tokenError } = await supabaseAdmin.from("doi_tokens").insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });
    if (tokenError) {
      console.error("Insert doi_tokens error:", tokenError.message);
      return NextResponse.json(
        { error: "E-Mail konnte nicht versendet werden. Bitte später erneut versuchen." },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;
    const confirmUrl = `${baseUrl}/api/waitlist/confirm?token=${encodeURIComponent(rawToken)}`;
    const sent = await sendDoiEmail(email, confirmUrl);
    if (!sent) {
      return NextResponse.json(
        { error: "E-Mail-Versand fehlgeschlagen. Bitte später erneut versuchen." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      email: maskEmail(email),
    });
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
