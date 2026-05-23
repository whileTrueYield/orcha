import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { SendEmailCommand, SendEmailRequest } from "@aws-sdk/client-ses";
import { config } from "../config";
import { resolve } from "path";
import { ses } from "./ses";
import { every, some } from "lodash";
import { logger } from "../logger";
import { redis } from "../redis";

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

export interface SendEmailArgs {
  ToAddresses: string[];
  html: string;
  text: string;
  subject: string;
}

export const areEmailAllowed = (emailAddresses: string[]): boolean => {
  if (config.isTest) {
    return true;
  }

  // are all emails address or their domain part of our allow list?
  return every(emailAddresses, (emailAddress) => {
    emailAddress = emailAddress.toLowerCase();
    const emailDomain = emailAddress.split("@")[1];
    const allowedEmail = config.allowedEmails.indexOf(emailAddress) > -1;
    const allowedDomain = config.allowedEmailDomains.indexOf(emailDomain) > -1;
    return allowedDomain || allowedEmail;
  });
};

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

  const emailParams: SendEmailRequest = {
    Destination: {
      ToAddresses: ToAddresses,
    },
    Source: `"Orcha" <${config.email.noReplyAddress}>`,
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
    },
  };

  await ses.send(new SendEmailCommand(emailParams));
  return true;
};
