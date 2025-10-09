import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, Transporter } from "nodemailer";
import { render } from "@react-email/render";
import { promises as fs } from "fs";
import { join, resolve } from "path";
import React from "react";
import { OrderConfirmationEmail } from "@emails/order-confirmation";
import { TicketCreatedEmail } from "@emails/ticket-created";
import { TicketUpdatedEmail } from "@emails/ticket-updated";
import { EmailVerificationEmail } from "@emails/email-verification";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailerService {
  private readonly outputDir: string;
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    const output = this.config.get<string>("app.email.outputDir") ?? "./tmp/emails";
    this.outputDir = resolve(output);
    this.transporter = createTransport({
      streamTransport: true,
      buffer: true,
      newline: "unix",
    });
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async sendOrderConfirmation(data: { to: string; customerName: string; orderNumber: string }) {
    const html = render(React.createElement(OrderConfirmationEmail, { customerName: data.customerName, orderNumber: data.orderNumber }));
    await this.send({ to: data.to, subject: `Your order ${data.orderNumber}`, html });
  }

  async sendTicketCreated(data: { to: string; title: string; number: string }) {
    const html = render(React.createElement(TicketCreatedEmail, { ticketNumber: data.number }));
    await this.send({ to: data.to, subject: `Ticket ${data.number} created`, html });
  }

  async sendTicketUpdated(data: { to: string; title: string; number: string; status: string }) {
    const html = render(React.createElement(TicketUpdatedEmail, { ticketNumber: data.number, status: data.status }));
    await this.send({ to: data.to, subject: `Ticket ${data.number} updated`, html });
  }

  async sendEmailVerification(data: { to: string; name: string; verificationUrl: string }) {
    const html = render(React.createElement(EmailVerificationEmail, { name: data.name, verificationUrl: data.verificationUrl }));
    await this.send({ to: data.to, subject: "Verify your email for Chien's Treats", html });
  }

  private async send(options: SendEmailOptions) {
    const message = await this.transporter.sendMail({
      from: "dev@chiens.treats",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    const emlPath = join(this.outputDir, `${Date.now()}-${Math.random().toString(16).slice(2)}.eml`);
    await fs.writeFile(emlPath, message.message!);
  }

  async listDevEmails() {
    const files = await fs.readdir(this.outputDir);
    return files
      .filter((file) => file.endsWith(".eml"))
      .map((file) => ({
        file,
        path: join(this.outputDir, file),
      }));
  }
}
