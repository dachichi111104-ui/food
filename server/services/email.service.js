const nodemailer = require("nodemailer");

/**
 * Creates nodemailer transport instance based on environment variables
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.warn("[EmailService] SMTP configuration missing in .env (EMAIL_HOST, EMAIL_USER, EMAIL_PASS)");
  }

  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports (587)
    auth: {
      user: user || "",
      pass: pass || "",
    },
  });
};

/**
 * Send HTML email wrapper
 */
const sendMail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || `"FoodGo Platform" <${process.env.EMAIL_USER || "noreply@foodgo.com"}>`;

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`[EmailService] Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${to}:`, err.message);
    // Don't crash application if email fails, return null
    return null;
  }
};

module.exports = { sendMail };
