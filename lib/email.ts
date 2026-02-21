import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Push <noreply@example.com>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://push.example.com";

export async function sendDoiEmail(email: string, confirmUrl: string): Promise<boolean> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping DOI email");
    return false;
  }
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Bestätige deinen Platz auf der Push-Warteliste",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 1.25rem;">Bestätige deine E-Mail</h1>
        <p>Klicke auf den Button, um deinen Platz auf der Push-Warteliste zu bestätigen:</p>
        <p style="margin: 1.5rem 0;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 0.75rem 1.5rem; background: #0a0a0a; color: #fff; text-decoration: none; border-radius: 0.5rem;">Jetzt bestätigen</a>
        </p>
        <p style="color: #666; font-size: 0.875rem;">Der Link ist 24 Stunden gültig. Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail.</p>
        <p style="color: #666; font-size: 0.75rem; margin-top: 2rem;">Push · Warteliste</p>
      </div>
    `,
  });
  if (error) {
    console.error("Resend DOI error:", error);
    return false;
  }
  return true;
}

export async function sendWelcomeEmail(
  email: string,
  referralLink: string,
  rank: number
): Promise<boolean> {
  if (!resend) return false;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Du bist auf der Push-Warteliste",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 1.25rem;">Du bist dabei!</h1>
        <p>Dein Rang: <strong>#${rank}</strong></p>
        <p>Lade Freunde ein und rücke weiter nach vorne. Teile deinen Link:</p>
        <p style="margin: 1rem 0; word-break: break-all;"><a href="${referralLink}">${referralLink}</a></p>
        <p style="color: #666; font-size: 0.875rem;">Wir melden uns, sobald Push für dich bereit ist.</p>
        <p style="color: #666; font-size: 0.75rem; margin-top: 2rem;">Push · Warteliste</p>
      </div>
    `,
  });
  if (error) {
    console.error("Resend welcome error:", error);
    return false;
  }
  return true;
}
