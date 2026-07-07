export const ROLES = {
  USER: "user",
  CREATOR: "creator",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
