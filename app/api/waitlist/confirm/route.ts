import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { hashDoiToken } from "@/lib/doi";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;
  const successUrl = `${baseUrl}/success`;

  if (!token || token.length < 10) {
    return NextResponse.redirect(`${successUrl}?error=invalid`);
  }

  const tokenHash = hashDoiToken(token);
  const { data: doiData, error: doiError } = await supabaseAdmin
    .from("doi_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .single();

  type DoiRow = { id: string; user_id: string; expires_at: string; used_at: string | null };
  const doiRow = doiData as DoiRow | null;

  if (doiError || !doiRow) {
    return NextResponse.redirect(`${successUrl}?error=invalid`);
  }
  if (doiRow.used_at) {
    return NextResponse.redirect(`${successUrl}?already=1`);
  }
  if (new Date(doiRow.expires_at) < new Date()) {
    return NextResponse.redirect(`${successUrl}?error=expired`);
  }

  const userId = doiRow.user_id;
  const { data: userData, error: userError } = await supabaseAdmin
    .from("waitlist_users")
    .select("id, email, referral_code, referred_by_user_id")
    .eq("id", userId)
    .single();

  type UserRow = { id: string; email: string; referral_code: string; referred_by_user_id: string | null };
  const user = userData as UserRow | null;

  if (userError || !user) {
    return NextResponse.redirect(`${successUrl}?error=invalid`);
  }

  await supabaseAdmin.from("doi_tokens").update({ used_at: new Date().toISOString() }).eq("id", doiRow.id);
  await supabaseAdmin
    .from("waitlist_users")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", userId);

  const referrerId = user.referred_by_user_id;
  if (referrerId) {
    const { data: referrerData } = await supabaseAdmin
      .from("waitlist_users")
      .select("referral_count")
      .eq("id", referrerId)
      .maybeSingle();
    const referrer = referrerData as { referral_count: number } | null;
    const newCount = (referrer?.referral_count ?? 0) + 1;
    await supabaseAdmin
      .from("waitlist_users")
      .update({ referral_count: newCount })
      .eq("id", referrerId);
    await supabaseAdmin.from("referral_events").insert({
      referrer_user_id: referrerId,
      referred_user_id: userId,
    });
  }

  const confirmedAt = new Date().toISOString();
  const userReferralCount = 0;
  const [countAheadByReferrals, countAheadByDate] = await Promise.all([
    supabaseAdmin
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed")
      .gt("referral_count", userReferralCount),
    supabaseAdmin
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed")
      .eq("referral_count", userReferralCount)
      .lt("confirmed_at", confirmedAt),
  ]);
  const rank = (countAheadByReferrals.count ?? 0) + (countAheadByDate.count ?? 0) + 1;

  const referralLink = `${baseUrl}?ref=${user.referral_code}`;
  await sendWelcomeEmail(user.email, referralLink, rank);

  return NextResponse.redirect(`${successUrl}?confirmed=1&ref=${user.referral_code}`);
}
