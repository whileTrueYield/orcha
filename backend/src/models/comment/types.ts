export enum CommentStatus {
  draft = "draft",
  active = "active",
  deprecated = "deprecated",
}

export interface IComment {
  id: number;

  body: string;

  createdAt: Date;

  updatedAt: Date;
}
