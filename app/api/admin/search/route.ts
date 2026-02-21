import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, requireAdminAuthResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const ok = await isAdminRequest();
  if (!ok) return requireAdminAuthResponse();

  const email = request.nextUrl.searchParams.get("email");
  if (!email?.includes("@")) {
    return NextResponse.json({ error: "E-Mail erforderlich." }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("waitlist_users")
    .select("email, status, referral_count, created_at, confirmed_at")
    .ilike("email", email.trim())
    .maybeSingle();

  type Row = { email: string; status: string; referral_count: number; created_at: string; confirmed_at: string | null };
  const user = data as Row | null;

  if (!user) {
    return NextResponse.json({ found: false });
  }
  return NextResponse.json({
    found: true,
    email: user.email,
    status: user.status,
    referral_count: user.referral_count,
    created_at: user.created_at,
    confirmed_at: user.confirmed_at,
  });
}
