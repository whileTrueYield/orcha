/**
 * Email sending and template rendering.
 *
 * Loads Handlebars templates from disk, renders them with provided data, and
 * delivers the result via the configured email provider (SMTP or Resend).
 * Dev / test / demo modes short-circuit before touching the provider.
 *
 * Exports: loadTemplate, sendEmail, SendEmailArgs, EmailTemplates
 *
 * Assumptions:
 *   - Templates live in `backend/assets/emails/` as .html / .txt pairs.
 *   - The email provider is configured via env vars (see providers/index.ts).
 *   - Redis is available for the @example.com integration-test stash.
 */

import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { config } from "../config";
import { resolve } from "path";
import { emailProvider } from "./providers";
import { some } from "lodash";
import { logger } from "../logger";
import { redis } from "../redis";

// ---------------------------------------------------------------------------
// Template types — one per email template file
// ---------------------------------------------------------------------------

interface ConfirmEmailTemplate {
  template: "email_confirm";
  data: {
    email: string;
    emailConfirmUri: string;
  };
}

interface PasswordLostTemplate {
  template: "password_lost";
  data: {
    email: string;
    passwordLostUri: string;
  };
}

interface NewIssueTemplate {
  template: "new_issue";
  data: {
    email: string;
    name: string;
    url: string;
    description: string[];
  };
}

interface NewIssueMessageTemplate {
  template: "new_issue_message";
  data: {
    email: string;
    name: string;
    url: string;
    message: string[];
    description: string[];
  };
}

interface InviteTemplate {
  template: "invite";
  data: {
    email: string;
    name: string;
    fromName: string;
    organizationName: string;
    acceptInviteUri: string;
  };
}

interface WorkDayTemplate {
  template: "work_day";
  data: {
    email: string;
    name: string;
    organizationName: string;
    availableTickets: Array<{ title: string; url: string; state: string }>;
    upcomingTickets: Array<{ title: string; url: string; state: string }>;
    notifications: Array<{ avatarUrl: string; title: string; url: string }>;
    unfinishedTickets: Array<{ title: string; url: string; state: string }>;
    ticketsToEstimate: Array<{ title: string; url: string }>;
    today: string;
    avatarUrl: string;
    homeUrl: string;
  };
}

interface NewContactRequest {
  template: "new_contact_request";
  data: {
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    countryCode: string;
    phoneNumber: string;
    topic: string;
    companySize: string;
    department: string;
    description: string[];
  };
}

type EmailTemplates =
  | ConfirmEmailTemplate
  | PasswordLostTemplate
  | InviteTemplate
  | WorkDayTemplate
  | NewIssueTemplate
  | NewIssueMessageTemplate
  | NewContactRequest;

// ---------------------------------------------------------------------------
// Template loading
// ---------------------------------------------------------------------------

export const loadTemplate = async (template: EmailTemplates) => {
  const htmlFilename = resolve(
    config.assetRoot,
    "emails",
    template.template + ".html"
  );

  const txtFilename = resolve(
    config.assetRoot,
    "emails",
    template.template + ".txt"
  );

  const htmlTemplate = await readFileSync(htmlFilename);
  const txtTemplate = await readFileSync(txtFilename);

  Handlebars.registerHelper("ifIsUniq", (conditional, options) => {
    if (conditional && conditional.length === 1) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  const html = Handlebars.compile(htmlTemplate.toString());
  const text = Handlebars.compile(txtTemplate.toString());

  const data = {
    ...template.data,
    unsubscribeUri: `${
      config.email.unsubscribeUri
    }?token=${"unsubscribe-token"}`,
    wwwUri: config.wwwUri,
    apiUri: config.apiUri,
    webAppUri: config.webAppUri,
    noReplyAddress: config.email.noReplyAddress,
  };

  return {
    html: html(data),
    text: text(data),
  };
};

// ---------------------------------------------------------------------------
// Email sending
// ---------------------------------------------------------------------------

export interface SendEmailArgs {
  ToAddresses: string[];
  html: string;
  text: string;
  subject: string;
}

export const sendEmail = async ({
  ToAddresses,
  html,
  text,
  subject,
}: SendEmailArgs): Promise<boolean> => {
  // for testing purpose, we do not send and store emails ending with @example.com
  // in redis with an expiration time of 10 seconds.
  if (ToAddresses.length === 1 && ToAddresses[0].endsWith("@example.com")) {
    logger.info("sendEmail(): @example.com email, put in redis for 10 seconds");
    redis.set(
      `email:${ToAddresses[0]}`,
      JSON.stringify({ subject, text }),
      "EX",
      10
    );
    return false;
  }

  // TODO: need to add bounce check here

  if (config.isDev) {
    logger.info(`sendEmail(): in dev mode, do not send email \n${text}`);
    return false;
  }

  if (config.isDemo) {
    logger.info(`sendEmail(): in demo mode, do not send email \n${text}`);
    return false;
  }

  if (config.isTest) {
    // logger.info(`sendEmail(): in test mode, do not send email \n${text}`);
    return false;
  }

  // if the provided domain is @example.com, we are not sending the email
  // since there cannot be an address at this domain
  if (
    some(ToAddresses, (emailAddress) =>
      emailAddress.toLowerCase().endsWith("@example.com")
    )
  ) {
    logger.info(`sendEmail(): email not sent to @example.com domain \n${text}`);
    return false;
  }

  await emailProvider.sendEmail({
    from: `"Orcha" <${config.email.noReplyAddress}>`,
    to: ToAddresses,
    subject,
    html,
    text,
  });

  return true;
};
