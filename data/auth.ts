import type { DummyUser } from "@/types/auth";

export const dummyUsers: DummyUser[] = [
  { id: "u1", name: "Jabed", email: "ceo@enmasco.local", password: "admin123", role: "CEO", department: "Executive" },
  { id: "u2", name: "Admin User", email: "admin@enmasco.local", password: "admin123", role: "ADMIN", department: "Operations" },
  { id: "u3", name: "Marketing Manager", email: "manager@enmasco.local", password: "admin123", role: "MARKETING_MANAGER", department: "Marketing" },
  { id: "u4", name: "Marketing Team", email: "marketing@enmasco.local", password: "admin123", role: "MARKETING_TEAM", department: "Marketing" },
  { id: "u5", name: "Content Creator", email: "creator@enmasco.local", password: "admin123", role: "CONTENT_CREATOR", department: "Content" },
  { id: "u6", name: "Analyst", email: "analyst@enmasco.local", password: "admin123", role: "ANALYST", department: "Analytics" },
  { id: "u7", name: "Viewer", email: "viewer@enmasco.local", password: "admin123", role: "VIEWER", department: "Operations" },
];
