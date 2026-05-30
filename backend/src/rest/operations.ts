/**
 * REST endpoint GraphQL operations — the single, marked place where the REST
 * API's dependency on the GraphQL schema lives.
 *
 * Every `/v1` endpoint executes one of these documents through the in-process
 * executor (see executor.ts) rather than reaching into resolvers directly. The
 * point of gathering them here is failure localisation: a field rename in the
 * schema breaks the matching operation in THIS file — a single, obvious place
 * to update — instead of silently changing the JSON contract clients depend
 * on. Treat each operation as the wire contract for its endpoint.
 *
 * Exports: ME_OPERATION.
 */

// GET /v1/me — the token's Role, the User behind it, and the Organization it
// belongs to. Field selection here IS the response shape clients receive.
export const ME_OPERATION = /* GraphQL */ `
  query MeRestEndpoint {
    me {
      status
      role {
        id
        name
        type
      }
      user {
        id
        email
      }
      organization {
        id
        name
      }
    }
  }
`;
