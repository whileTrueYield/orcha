/**
 * SMTP email provider backed by nodemailer.
 *
 * Reads connection details from the config object (which mirrors SMTP_HOST,
 * SMTP_PORT, SMTP_USER, SMTP_PASS env vars). The transport is created once
 * at init time and reused for the lifetime of the process.
 *
 * Exports: createSmtpProvider
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { EmailEnvelope, EmailProvider } from "./types";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

/**
 * @param smtpConfig  SMTP connection details.
 * @param transport   Optional pre-built transport (used in tests to inject a
 *                    stub without fighting non-configurable module exports).
 */
export const createSmtpProvider = (
  smtpConfig: SmtpConfig,
  transport?: Transporter
): EmailProvider => {
  const t: Transporter =
    transport ??
    nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      // Use STARTTLS for port 587, direct TLS for 465, plain for others.
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

  return {
    async sendEmail(envelope: EmailEnvelope): Promise<void> {
      await t.sendMail({
        from: envelope.from,
        to: envelope.to,
        subject: envelope.subject,
        html: envelope.html,
        text: envelope.text,
      });
    },
  };
};
