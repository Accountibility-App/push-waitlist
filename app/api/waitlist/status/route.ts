import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/waitlist/status?email=...
 * Returns rank, referral_count, referral_link only for confirmed users.
 * Anti-enumeration: same response when not found or not confirmed.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "E-Mail erforderlich." }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from("waitlist_users")
    .select("id, status, referral_code, referral_count, confirmed_at")
    .ilike("email", email.trim())
    .single();

  if (!user || user.status !== "confirmed") {
    return NextResponse.json({
      found: false,
      message: "Kein bestätigter Eintrag gefunden.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;
  const referralLink = `${baseUrl}?ref=${user.referral_code}`;

  const { count } = await supabaseAdmin
    .from("waitlist_users")
    .select("id", { count: "exact", head: true })
    .eq("status", "confirmed")
    .lt("confirmed_at", user.confirmed_at);

  const rank = (count ?? 0) + 1;

  return NextResponse.json({
    found: true,
    rank,
    referral_count: user.referral_count,
    referral_link: referralLink,
  });
}
