/**
 * Email provider factory.
 *
 * Selects the concrete email provider based on available env-var config.
 * Priority: SMTP (when SMTP_HOST is set) > Resend (when RESEND_API_KEY is set).
 * In production, crashes with a clear message if neither is configured.
 * In dev/test/demo modes the provider is never reached so a missing config is
 * tolerated -- a no-op stub is returned instead.
 *
 * Exports: getEmailProvider
 *
 * Assumptions: Called after config is initialised (import-time is fine because
 * config.ts runs its own env checks on import).
 */

import { config } from "../../config";
import { createSmtpProvider } from "./smtp";
import { createResendProvider } from "./resend";
import type { EmailProvider } from "./types";

export type { EmailProvider, EmailEnvelope } from "./types";

const buildProvider = (): EmailProvider => {
  // SMTP takes precedence when its host is configured.
  if (config.email.smtp) {
    return createSmtpProvider(config.email.smtp);
  }

  if (config.email.resendApiKey) {
    return createResendProvider(config.email.resendApiKey);
  }

  // In non-production modes the send path is short-circuited before the
  // provider is ever called, so a missing provider is harmless.
  if (!config.isProd) {
    return {
      async sendEmail(): Promise<void> {
        throw new Error(
          "Email provider called in non-production mode. " +
            "This should never happen — the dev/test/demo guard in " +
            "sendEmail() should have returned early."
        );
      },
    };
  }

  throw new Error(
    "No email provider configured. " +
      "Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS for SMTP, " +
      "or RESEND_API_KEY for Resend."
  );
};

/** Singleton provider instance, created once on first import. */
export const emailProvider: EmailProvider = buildProvider();
