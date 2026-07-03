export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const form = await request.formData();
    const name = clean(form.get("name"));
    const email = clean(form.get("email"));
    const message = clean(form.get("message"));
    const website = clean(form.get("website"));

    if (website) {
      return json({ ok: true });
    }

    if (!name || !email || !message) {
      return json({ ok: false, error: "Please fill in every field." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Please enter a valid email address." }, 400);
    }

    if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
      return json({ ok: false, error: "Contact form is not configured yet." }, 500);
    }

    const subject = `Melopal contact form: ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject,
        text
      })
    });

    if (!response.ok) {
      return json({ ok: false, error: "Could not send the message right now." }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: "Could not send the message right now." }, 500);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}

function clean(value) {
  return String(value || "").trim().slice(0, 5000);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
