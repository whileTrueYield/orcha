export interface TipTapCollabProps {
  accessToken: string;
  documentId: string | number;
  documentType: "projectText" | "ticketText" | "documentationText";
  readonly?: boolean;
  placeholder?: string;
}
