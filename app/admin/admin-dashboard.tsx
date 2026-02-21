"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  total: number;
  pending: number;
  confirmed: number;
  topReferrers: { email: string; referral_count: number }[];
  searchResult?: { found: boolean; email?: string; status?: string; referral_count?: number } | null;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  return `${local.slice(0, 2)}***@${domain}`;
}

export function AdminDashboard({
  total,
  pending,
  confirmed,
  topReferrers,
  searchResult: initialSearchResult,
}: AdminDashboardProps) {
  const router = useRouter();
  const [searchEmail, setSearchEmail] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    router.push(`/admin?email=${encodeURIComponent(searchEmail.trim())}`);
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ausstehend (DOI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bestätigt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{confirmed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Referrer</CardTitle>
        </CardHeader>
        <CardContent>
          {topReferrers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Referrals.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {topReferrers.map((r, i) => (
                <li key={i}>
                  {maskEmail(r.email)} – {r.referral_count} Referral(s)
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suche (E-Mail)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit">Suchen</Button>
          </form>
          {initialSearchResult && (
            <p className="mt-2 text-sm text-muted-foreground">
              {initialSearchResult.found
                ? `Gefunden: Status ${initialSearchResult.status ?? "–"}, Referrals: ${initialSearchResult.referral_count ?? 0}`
                : "Nicht gefunden."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            CSV (nur bestätigte Nutzer). Klick lädt mit deiner Admin-Anmeldung herunter.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/api/admin/export">CSV herunterladen</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
