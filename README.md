# Push Waitlist

Moderne, DSGVO-orientierte Wartelisten-Landing mit Referral-System.  
Tech-Stack: **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase**, **Brevo** (E-Mail).

## Features

- **Landing Page**: Hero, Value Props, Referral-Teaser, FAQ, Footer
- **Waitlist-Signup**: E-Mail, Plattform (Web/iOS/Android), Interesse, Consent-Checkbox, Honeypot
- **Double-Opt-In**: Bestätigungsmail mit Token, Bestätigungsseite mit Referral-Link & Share
- **Referral-System**: `?ref=CODE` in URL, Referrer-Count nur nach DOI-Bestätigung, Ranking (confirmed_at + referral_count)
- **Rechtlich**: Impressum & Datenschutz (Platzhalter – bitte juristisch prüfen)
- **Admin** (`/admin`): Basic Auth, Stats, Suche, CSV-Export (nur bestätigte Nutzer)
- **Rate Limiting**: In-Memory (für Produktion optional Upstash/Vercel KV)
- **DSGVO**: Consent-Version + Timestamp + IP/User-Agent gehasht, keine Klar-IP

## Setup

### 1. Abhängigkeiten

```bash
npm install
```

### 2. Umgebungsvariablen

Kopie von `.env.example` nach `.env.local` und Werte eintragen:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` – von Supabase Dashboard
- `BREVO_API_KEY`, `FROM_EMAIL` – für E-Mails (Brevo unterstützt Gmail ohne eigene Domain)
- `NEXT_PUBLIC_BASE_URL` – z. B. `https://push.yourdomain.com`
- `ADMIN_USER`, `ADMIN_PASSWORD` – für `/admin` (Basic Auth)

### 3. Supabase

Migration ausführen (Supabase SQL Editor oder CLI):

```bash
# Inhalt von supabase/migrations/001_initial_schema.sql im Supabase SQL Editor ausführen
```

### 4. Entwicklung

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).  
Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (Browser fragt nach Basic Auth).

### 5. Deployment (Vercel)

- Repo mit Vercel verbinden
- Env-Variablen setzen (wie oben)
- `NEXT_PUBLIC_BASE_URL` auf die Vercel-URL setzen (z. B. `https://push-xxx.vercel.app`)

## Ordnerstruktur (Auszug)

```
app/
  page.tsx              # Landing
  success/page.tsx      # Nach DOI / Pending
  impressum/            # Impressum
  datenschutz/          # Datenschutz
  admin/                # Admin (Basic Auth)
  api/
    waitlist/signup/    # POST Signup
    waitlist/confirm/   # GET DOI-Bestätigung
    waitlist/status/    # GET Status (optional)
    admin/export/       # GET CSV
components/             # UI, Form, Sektionen
lib/                    # Supabase, E-Mail, Rate-Limit, Validation
content/                # Markdown für Impressum/Datenschutz
supabase/migrations/    # SQL-Schema
```

## Hinweise

- **Impressum & Datenschutz**: Platzhaltertexte – bitte durch rechtlich geprüfte Fassungen ersetzen.
- **E-Mail**: Brevo-API-Key unter [app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api); Absender (z. B. Gmail) in Brevo verifizieren. Ohne `BREVO_API_KEY` schlägt der Versand still fehl (Log-Warnung).
- **Rate Limit**: Standard 5 Anfragen/Minute pro IP; für Skalierung Upstash Redis oder Vercel KV einbinden.
- **RLS**: Supabase RLS ist aktiv; alle Schreibzugriffe nur über Service Role (serverseitig).

## Skripte

- `npm run dev` – Entwicklung mit Turbopack
- `npm run build` – Production-Build
- `npm run start` – Production-Server
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript-Check
