"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { waitlistSignupSchema, type WaitlistSignupInput } from "@/lib/validation";
import { cn } from "@/lib/utils";

const INTEREST_OPTIONS = [
  { value: "", label: "Bitte wählen (optional)" },
  { value: "abnehmen", label: "Abnehmen" },
  { value: "muskelaufbau", label: "Muskelaufbau" },
  { value: "ausdauer", label: "Ausdauer" },
  { value: "accountability", label: "Accountability / Dranbleiben" },
  { value: "teams", label: "Teams / Gemeinsam trainieren" },
  { value: "sonstiges", label: "Sonstiges" },
];

const PLATFORMS = [
  { value: "web", label: "Web" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
] as const;

interface WaitlistFormProps {
  refCode?: string | null;
  className?: string;
}

export function WaitlistForm({ refCode, className }: WaitlistFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [interest, setInterest] = useState<string>("");
  const [consentChecked, setConsentChecked] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const websiteRaw = (formData.get("website") as string) ?? "";
    const raw = {
      email: formData.get("email") as string,
      platforms: platforms.length ? platforms : [],
      interest: interest?.trim() || undefined,
      ref: refCode ?? formData.get("ref") ?? undefined,
      consent: consentChecked,
      consent_version: formData.get("consent_version") as string | undefined,
      website: websiteRaw.trim() ? undefined : websiteRaw,
    };
    const parsed = waitlistSignupSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Ungültige Eingabe.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Etwas ist schiefgelaufen.");
        return;
      }
      router.push("/success?pending=1");
    } catch {
      setError("Netzwerkfehler. Bitte später erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {refCode && (
        <input type="hidden" name="ref" value={refCode} readOnly />
      )}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden
      />
      <input type="hidden" name="consent_version" value="1.0" />

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="deine@email.de"
          autoComplete="email"
          disabled={loading}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Plattform (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <label
              key={p.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                checked={platforms.includes(p.value)}
                onChange={(e) => {
                  if (e.target.checked) setPlatforms((prev) => [...prev, p.value]);
                  else setPlatforms((prev) => prev.filter((x) => x !== p.value));
                }}
                className="sr-only"
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interest">Interesse (optional)</Label>
        <Select value={interest} onValueChange={setInterest}>
          <SelectTrigger id="interest">
            <SelectValue placeholder="Bitte wählen" />
          </SelectTrigger>
          <SelectContent>
            {INTEREST_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "empty"} value={opt.value || " "}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="consent"
          checked={consentChecked}
          onCheckedChange={(v) => setConsentChecked(v === true)}
          required
          disabled={loading}
          className="mt-0.5"
        />
        <Label htmlFor="consent" className="cursor-pointer text-sm leading-tight">
          Ich habe die{" "}
          <a href="/datenschutz" className="underline hover:no-underline">
            Datenschutzerklärung
          </a>{" "}
          gelesen und stimme der Verarbeitung meiner Daten sowie dem Erhalt von E-Mails zu Push zu.
        </Label>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Wird angemeldet …" : "Join the waitlist"}
      </Button>
    </form>
  );
}
