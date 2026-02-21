import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, requireAdminAuthResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const ok = await isAdminRequest();
  if (!ok) return requireAdminAuthResponse();

  const { data } = await supabaseAdmin
    .from("waitlist_users")
    .select("email, platforms, interest, status, referral_count, created_at, confirmed_at")
    .eq("status", "confirmed")
    .order("referral_count", { ascending: false })
    .order("confirmed_at", { ascending: true });

  type Row = { email: string; platforms: string[] | null; interest: string | null; referral_count: number; created_at: string; confirmed_at: string | null };
  const rows = (data ?? []) as Row[];

  const headers = ["email", "platforms", "interest", "referral_count", "created_at", "confirmed_at"];
  const csvLines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        `"${(r.email ?? "").replace(/"/g, '""')}"`,
        `"${(r.platforms ?? []).join(";")}"`,
        `"${(r.interest ?? "").replace(/"/g, '""')}"`,
        r.referral_count,
        r.created_at ?? "",
        r.confirmed_at ?? "",
      ].join(",")
    ),
  ];
  const csv = csvLines.join("\n");
  const bom = "\uFEFF";
  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=PUSH-waitlist.csv",
    },
  });
}
