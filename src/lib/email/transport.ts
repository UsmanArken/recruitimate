import {
  emailFromAddress,
  isSmtpConfigured,
  resolveEmailProviderId,
} from "./config";
import type { EmailMessage, EmailSendResult } from "./types";

async function sendViaSmtp(message: EmailMessage): Promise<EmailSendResult> {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }

  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transport.sendMail({
    from: emailFromAddress(),
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return { provider: "smtp", messageId: info.messageId };
}

export async function deliverEmail(message: EmailMessage): Promise<EmailSendResult> {
  const provider = resolveEmailProviderId();

  if (provider === "smtp") {
    return sendViaSmtp(message);
  }

  if (process.env.NODE_ENV !== "test") {
    console.info(`[email:log] to=${message.to} subject=${message.subject}`);
  }

  return { provider: "log" };
}
