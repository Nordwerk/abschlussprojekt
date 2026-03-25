import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
};

type SnapshotPayload = {
  imageIndex: number;
  imageUrl: string;
  dataUrl: string;
};

type SubmitPayload = {
  contact: ContactPayload;
  activeWorkwearIndex: number;
  workwearStateByIndex: Record<string, unknown>;
  snapshots: SnapshotPayload[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|jpg));base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    throw new Error("Ungueltiges Bildformat im Snapshot.");
  }

  const mime = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const extension = mime === "image/png" ? "png" : "jpg";
  const bytes = Buffer.from(match[2], "base64");

  return { mime, extension, bytes };
}

async function uploadSnapshotToStorage(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
  requestId: string,
  snapshot: SnapshotPayload,
) {
  const { mime, extension, bytes } = parseDataUrl(snapshot.dataUrl);
  const objectPath = `${requestId}/view-${snapshot.imageIndex + 1}.${extension}`;

  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": mime,
        "x-upsert": "false",
      },
      body: bytes,
    },
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text().catch(() => "");
    throw new Error(
      `Snapshot Upload fehlgeschlagen (Bild ${snapshot.imageIndex + 1}): ${errorText || uploadResponse.statusText}`,
    );
  }

  return objectPath;
}

async function createSignedSnapshotUrl(
  supabaseUrl: string,
  serviceRoleKey: string,
  bucket: string,
  objectPath: string,
  expiresInSeconds: number,
) {
  const signResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/sign/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    },
  );

  if (!signResponse.ok) {
    const errorText = await signResponse.text().catch(() => "");
    throw new Error(
      `Signed URL Erstellung fehlgeschlagen (${objectPath}): ${errorText || signResponse.statusText}`,
    );
  }

  const data = (await signResponse.json().catch(() => ({}))) as {
    signedURL?: string;
    signedUrl?: string;
  };

  const relativePath = data.signedURL || data.signedUrl;
  if (!relativePath) {
    throw new Error(`Signed URL Antwort unvollstaendig (${objectPath}).`);
  }

  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }

  if (relativePath.startsWith("/")) {
    return `${supabaseUrl}/storage/v1${relativePath}`;
  }

  return `${supabaseUrl}/storage/v1/${relativePath}`;
}

async function insertConfiguratorRequest(
  supabaseUrl: string,
  serviceRoleKey: string,
  schema: string,
  table: string,
  row: Record<string, unknown>,
) {
  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "Content-Profile": schema,
      "Accept-Profile": schema,
    },
    body: JSON.stringify(row),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text().catch(() => "");
    throw new Error(`DB Insert fehlgeschlagen: ${errorText || insertResponse.statusText}`);
  }

  return insertResponse.json().catch(() => null);
}

async function sendNotificationMail(
  requestId: string,
  contact: ContactPayload,
  snapshotUrls: string[],
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const safeMessage = escapeHtml(contact.message || "").replace(/\n/g, "<br />");
  const linksHtml = snapshotUrls.length
    ? `<ul>${snapshotUrls
        .map((url) => `<li><a href="${url}">${url}</a></li>`)
        .join("")}</ul>`
    : "<p>Keine Snapshot-Links vorhanden.</p>";

  await transporter.sendMail({
    from: `"Nordwerk Konfigurator" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || "a.knoth@k-k-solutions.de",
    replyTo: contact.email,
    subject: `Neue Konfigurator-Anfrage ${requestId}`,
    html: `
      <h2>Neue Konfigurator-Anfrage</h2>
      <p><strong>Anfrage-ID:</strong> ${escapeHtml(requestId)}</p>
      <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
      <p><strong>E-Mail:</strong> ${escapeHtml(contact.email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(contact.phone || "Nicht angegeben")}</p>
      <hr />
      <p><strong>Nachricht:</strong></p>
      <p>${safeMessage || "Keine Nachricht"}</p>
      <hr />
      <p><strong>Snapshot-Links:</strong></p>
      ${linksHtml}
    `,
  });
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_KONFIGURATOR_BUCKET || "konfigurator-anfragen";
    const requestsSchema = process.env.SUPABASE_REQUESTS_SCHEMA || "public";
    const requestsTable = process.env.SUPABASE_REQUESTS_TABLE || "konfigurator_requests";
    const signedUrlExpiresInSeconds = Number(
      process.env.SUPABASE_SIGNED_URL_EXPIRES_IN || "604800",
    );

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase ist nicht konfiguriert (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)." },
        { status: 500 },
      );
    }

    const body: SubmitPayload = await req.json();

    const name = body.contact?.name?.trim();
    const email = body.contact?.email?.trim();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name und E-Mail sind Pflichtfelder." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.snapshots) || body.snapshots.length === 0) {
      return NextResponse.json(
        { error: "Mindestens ein konfiguriertes Bild ist erforderlich." },
        { status: 400 },
      );
    }

    const requestId = crypto.randomUUID();

    const snapshotStoragePaths: string[] = [];
    const signedSnapshotUrls: string[] = [];
    for (const snapshot of body.snapshots) {
      const objectPath = await uploadSnapshotToStorage(
        supabaseUrl,
        serviceRoleKey,
        bucket,
        requestId,
        snapshot,
      );

      const signedUrl = await createSignedSnapshotUrl(
        supabaseUrl,
        serviceRoleKey,
        bucket,
        objectPath,
        signedUrlExpiresInSeconds,
      );

      snapshotStoragePaths.push(`${bucket}/${objectPath}`);
      signedSnapshotUrls.push(signedUrl);
    }

    const row = {
      request_id: requestId,
      name,
      email,
      phone: body.contact.phone?.trim() || null,
      message: body.contact.message?.trim() || null,
      active_workwear_index: body.activeWorkwearIndex,
      configuration_json: body.workwearStateByIndex,
      snapshot_urls: snapshotStoragePaths,
      source: "web-konfigurator",
    };

    await insertConfiguratorRequest(
      supabaseUrl,
      serviceRoleKey,
      requestsSchema,
      requestsTable,
      row,
    );

    await sendNotificationMail(requestId, body.contact, signedSnapshotUrls);

    return NextResponse.json({
      success: true,
      requestId,
      snapshotCount: signedSnapshotUrls.length,
    });
  } catch (error) {
    console.error("Konfigurator Submit Fehler:", error);
    return NextResponse.json(
      { error: "Beim Abschicken der Konfiguration ist ein Fehler aufgetreten." },
      { status: 500 },
    );
  }
}
