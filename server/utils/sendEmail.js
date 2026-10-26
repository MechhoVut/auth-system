const nodemailer = require("nodemailer");

// Live (HTTPS API, works on Render free)
const sendWithBrevo = async ({ to, subject, text, html }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Auth System", email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
  }
};

// Local (Gmail SMTP)
const sendWithSmtp = async ({ to, subject, text, html }) => {
  const port = Number(process.env.SMTP_PORT);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000, // fail fast instead of hanging
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: `"Auth System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

// picks the method automatically
module.exports = async (options) => {
  if (process.env.BREVO_API_KEY) return sendWithBrevo(options);
  return sendWithSmtp(options);
};