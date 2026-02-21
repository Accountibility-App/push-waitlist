/**
 * E-Mail-Versand via Brevo (ehem. Sendinblue).
 * Brevo erlaubt verifizierte Absender wie Gmail ohne eigene Domain.
 * API-Dokumentation: https://developers.brevo.com/reference/sendtransacemail
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function parseFromEmail(from: string): { name: string; email: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1]!.trim(), email: match[2]!.trim() };
  }
  return { name: "PUSH", email: from.trim() };
}

async function sendBrevoEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set, skipping email");
    return false;
  }
  const fromRaw = (process.env.FROM_EMAIL ?? "PUSH <noreplyandinfo.push@gmail.com>").trim();
  const sender = parseFromEmail(fromRaw);

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: sender.name, email: sender.email },
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Brevo API error:", res.status, err);
    return false;
  }
  return true;
}

export async function sendDoiEmail(email: string, confirmUrl: string): Promise<boolean> {
  return sendBrevoEmail({
    to: email,
    subject: "Bestätige deinen Platz auf der PUSH-Warteliste",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 1.25rem;">Bestätige deine E-Mail</h1>
        <p>Klicke auf den Button, um deinen Platz auf der PUSH-Warteliste zu bestätigen:</p>
        <p style="margin: 1.5rem 0;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 0.75rem 1.5rem; background: #0a0a0a; color: #fff; text-decoration: none; border-radius: 0.5rem;">Jetzt bestätigen</a>
        </p>
        <p style="color: #666; font-size: 0.875rem;">Der Link ist 24 Stunden gültig. Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail.</p>
        <p style="color: #666; font-size: 0.75rem; margin-top: 2rem;">PUSH – Disziplin die sichtbar wird</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(
  email: string,
  referralLink: string,
  rank: number
): Promise<boolean> {
  return sendBrevoEmail({
    to: email,
    subject: "Du bist auf der PUSH-Warteliste",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 1.25rem;">Du bist dabei!</h1>
        <p>Dein Rang: <strong>#${rank}</strong></p>
        <p>Lade Freunde ein und rücke weiter nach vorne. Teile deinen Link:</p>
        <p style="margin: 1rem 0; word-break: break-all;"><a href="${referralLink}">${referralLink}</a></p>
        <p style="color: #666; font-size: 0.875rem;">Wir melden uns, sobald PUSH für dich bereit ist.</p>
        <p style="color: #666; font-size: 0.75rem; margin-top: 2rem;">PUSH – Disziplin die sichtbar wird</p>
      </div>
    `,
  });
}
