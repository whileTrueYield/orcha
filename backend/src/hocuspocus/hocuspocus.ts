import { Server } from "@hocuspocus/server";
import { Throttle } from "@hocuspocus/extension-throttle";
import { logger } from "../logger";
import jwt from "jsonwebtoken";
import { config } from "./config";
import { DocumentToken } from "./documentToken";
import { Database } from "@hocuspocus/extension-database";
import { Redis } from "@hocuspocus/extension-redis";
import { Logger } from "@hocuspocus/extension-logger";

import { fetchDocumentationText } from "./documentationText/fetchDocumentationText";
import { storeDocumentationText } from "./documentationText/storeDocumentationText";

import { storeProjectText } from "./projectText/storeProjectText";
import { fetchProjectText } from "./projectText/fetchProjectText";

import { fetchTicketText } from "./ticketText/fetchTicketText";
import { storeTicketText } from "./ticketText/storeTicketText";

/**
 * Setup the Hocuspocus server.
 *
 * Hocuspocus is a collaboration service based on Yjs used to sync and
 * merge changes from clients in real-time (or even offline).
 */
export const hocusPocus = Server.configure({
  name: config.instanceId,
  port: config.apiWsPort,

  // connection healthcheck interval in milliseconds.
  timeout: 30000,

  // Debounces the call of the onStoreDocument hook for the given amount
  // of time in ms. Otherwise every single update would be persisted.
  debounce: 5000,

  // Makes sure to call onStoreDocument at least in the given amount
  // of time (ms).
  maxDebounce: 30000,

  extensions: [
    // This extension throttles connection attempts and
    // bans ip-addresses if it crosses the configured threshold.
    new Throttle({ throttle: 200, banTime: 5 }),

    // Hocuspocus doesn’t log anything. Thanks to this simple extension it will.
    new Logger({
      log: (message) => logger.info(message),
      onLoadDocument: true,
      onChange: false,
      onConnect: true,
      onDisconnect: true,
      onUpgrade: true,
      onRequest: true,
      onDestroy: true,
      onConfigure: true,
    }),

    new Redis({
      host: process.env.REDIS_HOSTNAME || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    }),

    // hocuspocus uses a Database instance as CRUD access, you can define
    // how you store and and retrieve the document you store here.
    // This instance of Database will handle all document, for project
    // and documentation.
    new Database({
      fetch: async ({ context }: { context: { auth: DocumentToken } }) => {
        logger.info(`loading ${context.auth.documentType}`);
        switch (context.auth.documentType) {
          case "projectText":
            return fetchProjectText(context.auth);
          case "ticketText":
            return fetchTicketText(context.auth);
          case "documentationText":
            return fetchDocumentationText(context.auth);
          default:
            logger.error(
              `Unrecognized document type ${context.auth.documentType}`
            );
            return null;
        }
      },

      store: async ({
        state,
        context,
      }: {
        context: { auth: DocumentToken };
        state: Buffer;
      }): Promise<void> => {
        logger.info(`storing ${context.auth.documentType}`);
        switch (context.auth.documentType) {
          case "projectText":
            storeProjectText(context.auth, state);
            break;
          case "ticketText":
            storeTicketText(context.auth, state);
            break;
          case "documentationText":
            storeDocumentationText(context.auth, state);
            break;
          default:
            logger.error(
              "Unrecognized document type",
              context.auth.documentType
            );
        }
      },
    }),
  ],

  // hocuspocus is not associated with Express, as such we cannot use
  // the encrypted session from Express. Instead, we generate a JSON Web
  // Token (JWT) that is then used by the frontend to access and modify the
  // documents.
  //
  // We generate one token per document, on the project resolver (projectAccessToken)
  // or documentationPage resolver  (documentationPageAccessToken).
  //
  // These token are short live (15 minutes) but the frontend renews it if you stay
  // on the document's page.
  async onAuthenticate(data) {
    try {
      const token = jwt.verify(
        data.token,
        config.sessionSecret
      ) as DocumentToken;
      if (token) {
        logger.info("HocusPocus access granted!");

        if (token.mode === "read") {
          data.connection.readOnly = true;
        }

        return {
          auth: {
            documentType: token.documentType,
            documentId: token.documentId,
            roleId: token.roleId,
            orgId: token.orgId,
            mode: token.mode,
          },
        };
      }
    } catch (error) {
      logger.warn("HocusPocus access denied!");
      logger.error(error.stack);
    }
    throw new Error("Not authorized!");
  },
});
