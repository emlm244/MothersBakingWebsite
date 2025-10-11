import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { ContactFormInput } from "./forms/contact";
import { siteConfig } from "./config";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_INBOX,
  CONTACT_FROM,
} = process.env;

const transportOptions: SMTPTransport.Options | null =
  SMTP_HOST && SMTP_PORT
    ? {
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === "true",
        auth:
          SMTP_USER && SMTP_PASS
            ? {
                user: SMTP_USER,
                pass: SMTP_PASS,
              }
            : undefined,
      }
    : null;

const transporter = transportOptions ? nodemailer.createTransport(transportOptions) : null;

export const canSendEmail = Boolean(transporter);

const recipient = CONTACT_INBOX || siteConfig.salesEmail;
const fromAddress = CONTACT_FROM || `Coral Hosts Intake <no-reply@${siteConfig.baseUrl.replace(/^https?:\/\//, "")}>`;

export async function sendContactNotification(payload: ContactFormInput) {
  if (!transporter) {
    console.info("[contact] Email transporter not configured. Submission logged instead.", payload);
    return;
  }

  const subject = `New Coral Hosts inquiry — ${payload.company}`;
  const lines = [
    `Name: ${payload.name}`,
    `Company: ${payload.company}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    `Project type: ${payload.projectType}`,
    `Budget: ${payload.budget}`,
    `Timeline: ${payload.timeline}`,
    payload.utmSource ? `UTM Source: ${payload.utmSource}` : null,
    payload.utmCampaign ? `UTM Campaign: ${payload.utmCampaign}` : null,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: fromAddress,
    to: recipient,
    subject,
    text: lines,
  });
}
