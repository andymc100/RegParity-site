export interface Env {
  TO_EMAIL: string;
  FROM_EMAIL: string;
}

function response(message: string, status: number): Response {
  return new Response(message, { status });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ct = request.headers.get("content-type") || "";
  const isForm =
    ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");

  if (!isForm) return response("Unsupported content type", 415);

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const itEmail = String(form.get("it_email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (!email) return response("Email is required", 400);

  const subject = `RegParity request from ${email}`;
  const text = [
    `Name: ${name || "(not provided)"}`,
    `Email: ${email}`,
    `Company: ${company || "(not provided)"}`,
    `IT Email: ${itEmail || "(not provided)"}`,
    "",
    message || "(no message)",
  ].join("\n");

  const payload = {
    personalizations: [{ to: [{ email: env.TO_EMAIL }] }],
    from: { email: env.FROM_EMAIL, name: "RegParity site" },
    reply_to: { email },
    subject,
    content: [{ type: "text/plain", value: text }],
  };

  const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return response(`Failed to send email: ${res.status} ${body}`, 502);
  }

  return Response.redirect(new URL("/download?sent=1#request", request.url).toString(), 303);
};
