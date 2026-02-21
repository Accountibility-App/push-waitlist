import { headers } from "next/headers";
import { isAdminRequest, requireAdminAuthResponse } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ email?: string }>;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ok = await isAdminRequest();
  if (!ok) {
    return requireAdminAuthResponse();
  }

  const params = await searchParams;
  const searchEmail = params.email?.trim();
  let searchResult: { found: boolean; email?: string; status?: string; referral_count?: number } | null = null;
  if (searchEmail?.includes("@")) {
    const { data } = await supabaseAdmin
      .from("waitlist_users")
      .select("email, status, referral_count")
      .ilike("email", searchEmail)
      .maybeSingle();
    const row = data as { email: string; status: string; referral_count: number } | null;
    searchResult = row
      ? { found: true, email: row.email, status: row.status, referral_count: row.referral_count }
      : { found: false };
  }

  const [
    { count: total },
    { count: pending },
    { count: confirmed },
    { data: topReferrers },
  ] = await Promise.all([
    supabaseAdmin.from("waitlist_users").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
    supabaseAdmin
      .from("waitlist_users")
      .select("email, referral_count")
      .eq("status", "confirmed")
      .order("referral_count", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold">Admin – Push Warteliste</h1>
        <AdminDashboard
          total={total ?? 0}
          pending={pending ?? 0}
          confirmed={confirmed ?? 0}
          topReferrers={topReferrers ?? []}
          searchResult={searchResult}
        />
      </div>
    </div>
  );
}
