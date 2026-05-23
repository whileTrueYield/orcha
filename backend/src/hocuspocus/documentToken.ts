export interface DocumentToken {
  documentType: "ticketText" | "projectText" | "documentationText";
  documentId: number;
  roleId: number;
  orgId: number;
  mode: "read" | "write";
}
