export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const payload = await readPayload(request);
    const email = clean(payload.email).toLowerCase();
    const sourcePath = clean(payload.sourcePath, 500);
    const sourceUrl = clean(payload.sourceUrl, 1000);
    const website = clean(payload.website, 500);
    const consentText = clean(payload.consentText, 500);

    if (website) {
      return json({ ok: true });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Please enter a valid email address." }, 400);
    }

    if (!env.EMAIL_SIGNUPS_DB) {
      return json({ ok: false, error: "Email signup storage is not configured yet." }, 500);
    }

    const now = new Date().toISOString();
    await ensureSchema(env.EMAIL_SIGNUPS_DB);
    await env.EMAIL_SIGNUPS_DB.prepare(`
      INSERT INTO email_subscribers (
        email,
        status,
        created_at,
        updated_at,
        source_path,
        source_url,
        referrer,
        country,
        user_agent,
        consent_text
      )
      VALUES (?, 'subscribed', ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        status = 'subscribed',
        updated_at = excluded.updated_at,
        source_path = excluded.source_path,
        source_url = excluded.source_url,
        referrer = excluded.referrer,
        country = excluded.country,
        user_agent = excluded.user_agent,
        consent_text = excluded.consent_text
    `).bind(
      email,
      now,
      now,
      sourcePath,
      sourceUrl,
      clean(request.headers.get("referer"), 1000),
      clean(request.cf && request.cf.country, 20),
      clean(request.headers.get("user-agent"), 500),
      consentText || "Send me occasional Melopal updates."
    ).run();

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: "Could not save your email right now." }, 500);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}

async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }

  const form = await request.formData();
  const payload = {};
  form.forEach((value, key) => {
    payload[key] = value;
  });
  return payload;
}

async function ensureSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS email_subscribers (
      email TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'subscribed',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      source_path TEXT,
      source_url TEXT,
      referrer TEXT,
      country TEXT,
      user_agent TEXT,
      consent_text TEXT,
      marketing_platform TEXT,
      marketing_exported_at TEXT,
      export_error TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_email_subscribers_status_updated
      ON email_subscribers(status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_email_subscribers_exported
      ON email_subscribers(marketing_exported_at);
  `);
}

function clean(value, limit = 254) {
  return String(value || "").trim().slice(0, limit);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
