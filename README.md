This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Konfigurator: Storage + Datenbank

Der Konfigurator kann fertig konfigurierte Ansichten abschicken.
Dabei werden die gerenderten Bilder in Supabase Storage hochgeladen und die Anfrage in einer Tabelle gespeichert.

Ablauf im Frontend:
- Im Konfigurator klickt der Nutzer auf "Zum Kontaktformular".
- Die Konfigurations-Snapshots werden als Draft im Browser gespeichert.
- Auf der Startseite wird nur das Haupt-Kontaktformular verwendet und sendet den Draft mit.

### Benoetigte Umgebungsvariablen

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_KONFIGURATOR_BUCKET=konfigurator-anfragen
SUPABASE_REQUESTS_SCHEMA=public
SUPABASE_REQUESTS_TABLE=konfigurator_requests
SUPABASE_SIGNED_URL_EXPIRES_IN=604800

SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-pass>
CONTACT_EMAIL=<empfangs-email>
```

Hinweis:
- Bei privaten Buckets werden signierte Links per E-Mail versendet.
- `SUPABASE_SIGNED_URL_EXPIRES_IN` ist in Sekunden (Standard: 604800 = 7 Tage).

### Beispiel SQL fuer die Anfrage-Tabelle

```sql
create table if not exists public.konfigurator_requests (
	id bigserial primary key,
	request_id uuid not null unique,
	name text not null,
	email text not null,
	phone text,
	message text,
	active_workwear_index integer not null,
	configuration_json jsonb not null,
	snapshot_urls text[] not null default '{}',
	source text,
	created_at timestamptz not null default now()
);
```

### Storage Bucket

Lege den Bucket `konfigurator-anfragen` (oder den Wert aus `SUPABASE_KONFIGURATOR_BUCKET`) an.
Die API speichert Snapshots unter `/<request_id>/view-<index>.jpg`.
