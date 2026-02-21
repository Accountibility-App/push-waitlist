import { z } from "zod";

const CONSENT_VERSION = "1.0";

export const waitlistSignupSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  platforms: z
    .array(z.enum(["web", "ios", "android"]))
    .min(0)
    .max(3)
    .default([]),
  interest: z.string().max(100).optional(),
  ref: z.string().max(32).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Du musst Datenschutz und E-Mail-Kommunikation zustimmen." }),
  }),
  consent_version: z.string().optional().default(CONSENT_VERSION),
  /** Honeypot – must stay empty */
  website: z.string().max(0).optional(),
});

export type WaitlistSignupInput = z.infer<typeof waitlistSignupSchema>;
export { CONSENT_VERSION };
