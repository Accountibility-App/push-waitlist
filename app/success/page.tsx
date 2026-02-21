"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copy, Check, Mail, MessageCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const pending = searchParams.get("pending") === "1";
  const confirmed = searchParams.get("confirmed") === "1";
  const already = searchParams.get("already") === "1";
  const error = searchParams.get("error");
  const refCode = searchParams.get("ref");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = refCode ? `${baseUrl}?ref=${refCode}` : "";

  const [copied, setCopied] = useState(false);
  const copyLink = useCallback(() => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [referralLink]);

  if (pending) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">E-Mail prüfen</h1>
        <p className="text-muted-foreground">
          Wir haben dir einen Bestätigungslink geschickt. Klicke darauf, um deinen Platz auf der
          Warteliste zu sichern.
        </p>
        <p className="text-sm text-muted-foreground">
          Keine E-Mail? Prüfe den Spam-Ordner oder{" "}
          <Link href="/" className="underline">
            erneut anmelden
          </Link>
          .
        </p>
      </div>
    );
  }

  if (already) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Bereits bestätigt</h1>
        <p className="text-muted-foreground">
          Deine E-Mail ist bereits bestätigt. Du bist auf der Warteliste.
        </p>
        <Link href="/">
          <Button>Zur Startseite</Button>
        </Link>
      </div>
    );
  }

  if (error === "expired") {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Link abgelaufen</h1>
        <p className="text-muted-foreground">
          Der Bestätigungslink ist abgelaufen. Bitte melde dich erneut an.
        </p>
        <Link href="/">
          <Button>Erneut anmelden</Button>
        </Link>
      </div>
    );
  }

  if (error === "invalid") {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Ungültiger Link</h1>
        <p className="text-muted-foreground">
          Der Bestätigungslink ist ungültig oder wurde bereits verwendet.
        </p>
        <Link href="/">
          <Button>Zur Startseite</Button>
        </Link>
      </div>
    );
  }

  if (confirmed && referralLink) {
    const shareMail = `mailto:?subject=Join%20the%20Push%20waitlist&body=${encodeURIComponent(`Schau dir Push an und trag dich in die Warteliste ein: ${referralLink}`)}`;
    const shareWhatsApp = `https://wa.me/?text=${encodeURIComponent(`Trag dich in die Push-Warteliste ein: ${referralLink}`)}`;
    const shareTelegram = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join the Push waitlist")}`;

    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">You&apos;re in!</h1>
        <p className="text-muted-foreground">
          Du bist auf der Warteliste. Wir melden uns bei dir. Lade Freunde ein und rücke weiter
          nach vorne.
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-left">
          <p className="mb-2 text-sm font-medium">Dein Referral-Link</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button variant="secondary" size="icon" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={shareMail}>
              <Mail className="mr-1 h-4 w-4" />
              E-Mail
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={shareWhatsApp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-1 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={shareTelegram} target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
          </Button>
        </div>
        <Link href="/">
          <Button variant="ghost">Zur Startseite</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Status</h1>
      <p className="text-muted-foreground">
        Du bist auf der Warteliste. Bei Fragen schau in die FAQ oder kontaktiere uns.
      </p>
      <Link href="/">
        <Button>Zur Startseite</Button>
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Suspense fallback={<div className="py-16 text-center">Laden …</div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
