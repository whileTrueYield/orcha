import http from "http";
import url from "url";

export function parseRequest(req: http.IncomingMessage) {
  const parsedUrl = url.parse(req.url || "", true);
  // the first / in the URL should be ignored
  const [, tableName, id] = (parsedUrl.pathname || "").split("/");

  return {
    tableName,
    id,
    query: parsedUrl.query,
  };
}

export async function waitFor(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Check if the provided origin should be allowed for CORS
// using if it's either localhost / 127.0.0.1 or in the
// provided list of allowed origins
export const corsCheckOrigin = (allowedOrigins: string[]) => {
  const isLocalhost = /^(http|ws):\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  return (
    origin: string | undefined,
    callback: (error: Error | null, origin?: string) => void
  ) => {
    if (!origin) {
      return callback(null, origin);
    }

    if (isLocalhost.test(origin)) {
      return callback(null, origin);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }

    callback(new Error("Unallowed origin"));
  };
};
