/**
 * Email provider interface.
 *
 * Defines the contract that all email providers (SMTP, Resend, etc.) must
 * implement. The provider is responsible for delivering the email; template
 * rendering and skip-logic live in the calling `sendEmail()` function.
 *
 * Exports: EmailEnvelope, EmailProvider
 */

/** The fully-rendered email payload handed to a provider for delivery. */
export interface EmailEnvelope {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}

/** A provider only needs to know how to deliver a rendered email. */
export interface EmailProvider {
  sendEmail(envelope: EmailEnvelope): Promise<void>;
}
