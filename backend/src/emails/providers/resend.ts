/**
 * Resend email provider.
 *
 * Uses the official `resend` npm package. Requires a single env var
 * (RESEND_API_KEY) surfaced through config.
 *
 * Exports: createResendProvider
 */

import { Resend } from "resend";
import type { EmailEnvelope, EmailProvider } from "./types";

/** Minimal subset of the Resend client used by this provider. */
export interface ResendClient {
  emails: {
    send: (payload: {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text: string;
    }) => Promise<{ data: unknown; error: { name: string; message: string } | null }>;
  };
}

/**
 * @param apiKey  Resend API key.
 * @param client  Optional pre-built client (used in tests to inject a stub
 *                without fighting non-configurable module exports).
 */
export const createResendProvider = (
  apiKey: string,
  client?: ResendClient
): EmailProvider => {
  const c: ResendClient = client ?? new Resend(apiKey);

  return {
    async sendEmail(envelope: EmailEnvelope): Promise<void> {
      const { error } = await c.emails.send({
        from: envelope.from,
        to: envelope.to,
        subject: envelope.subject,
        html: envelope.html,
        text: envelope.text,
      });

      if (error) {
        throw new Error(
          `Resend API error: ${error.message} (name=${error.name})`
        );
      }
    },
  };
};
