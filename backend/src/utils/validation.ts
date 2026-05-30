/**
 * Lightweight input validation for GraphQL mutation arguments.
 *
 * Public API:
 *  - assertLength(value, min, max, field): throws unless the string length is
 *    within [min, max].
 *  - assertEmail(value, field): throws unless the string looks like an email.
 *  - ArgumentValidationError: the GraphQLError thrown on any failure.
 *
 * Why this exists:
 *  The TypeGraphQL stack validated inputs with class-validator decorators
 *  (`@Length`, `@IsEmail`, …) and surfaced failures as a single
 *  "Argument Validation Error". The Pothos migration dropped that layer
 *  entirely, so empty bodies / malformed emails silently reached the database.
 *  These helpers restore validation at the resolver boundary without pulling
 *  in a new dependency. The thrown message is kept identical to the legacy
 *  behaviour so clients (and tests) see the same contract.
 */

import { GraphQLError } from "graphql";

// Matches the message TypeGraphQL produced when class-validator rejected an
// argument. Kept verbatim so existing clients keep recognising it.
const ARGUMENT_VALIDATION_ERROR = "Argument Validation Error";

export function ArgumentValidationError(detail: string): GraphQLError {
  return new GraphQLError(ARGUMENT_VALIDATION_ERROR, {
    extensions: { code: "BAD_USER_INPUT", detail },
  });
}

/**
 * Mirror of class-validator's `@Length(min, max)`: the value must be a string
 * whose length falls within the inclusive range.
 */
export function assertLength(
  value: string | null | undefined,
  min: number,
  max: number,
  field: string,
): void {
  const length = (value ?? "").length;
  if (length < min || length > max) {
    throw ArgumentValidationError(
      `${field} must be between ${min} and ${max} characters`,
    );
  }
}

// Pragmatic email shape check matching class-validator's default `@IsEmail`
// well enough for our inputs: a local part, an "@", and a dotted domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirror of class-validator's `@IsEmail()`. */
export function assertEmail(
  value: string | null | undefined,
  field: string,
): void {
  if (!value || !EMAIL_PATTERN.test(value)) {
    throw ArgumentValidationError(`${field} must be a valid email`);
  }
}
