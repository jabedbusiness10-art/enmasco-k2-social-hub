import type { CompanyAccount, ActivityEntry, PermissionEntry } from "@/types/account-manager";

export const companyAccounts: CompanyAccount[] = [
  {
    id: "fb",
    platform: "facebook",
    accountName: "ENMASCO Security Trading Co.",
    pageId: "FB-ENMASCO-001",
    status: "CONNECTED",
    connectedDate: "2026-01-10",
    followers: 21500,
    lastSync: "2026-07-08 03:00",
    nextSync: "2026-07-08 06:00",
    tokenStatus: "Valid",
    apiVersion: "v18.0",
    lastUpdated: "2026-07-08",
  },
  {
    id: "ig",
    platform: "instagram",
    accountName: "@enmasco",
    pageId: "IG-ENMASCO-001",
    status: "CONNECTED",
    connectedDate: "2026-02-05",
    followers: 13900,
    lastSync: "2026-07-08 02:45",
    nextSync: "2026-07-08 05:45",
    tokenStatus: "Valid",
    apiVersion: "v18.0",
    lastUpdated: "2026-07-08",
  },
  {
    id: "li",
    platform: "linkedin",
    accountName: "ENMASCO Security Trading Co.",
    pageId: "LI-ENMASCO-001",
    status: "WARNING",
    connectedDate: "2026-03-01",
    followers: 8420,
    lastSync: "2026-07-07 11:20",
    nextSync: "2026-07-08 11:20",
    tokenStatus: "Expires Soon",
    apiVersion: "v2",
    lastUpdated: "2026-07-07",
  },
  {
    id: "yt",
    platform: "youtube",
    accountName: "ENMASCO TV",
    pageId: "YT-ENMASCO-001",
    status: "DISCONNECTED",
    connectedDate: "—",
    lastSync: "Never",
    tokenStatus: "N/A",
    apiVersion: "v3",
    lastUpdated: "—",
  },
];

export const activityTimeline: ActivityEntry[] = [
  { id: "a1", time: "09:15 AM", message: "Facebook Sync Completed" },
  { id: "a2", time: "10:30 AM", message: "Instagram Token Refreshed" },
  { id: "a3", time: "11:20 AM", message: "LinkedIn Connected" },
  { id: "a4", time: "01:00 PM", message: "Company Website Updated" },
  { id: "a5", time: "02:15 PM", message: "YouTube Disconnected by Admin" },
];

export const permissions: PermissionEntry[] = [
  { role: "CEO", access: "Full Access" },
  { role: "Admin", access: "Manage Connections" },
  { role: "Marketing", access: "View Only" },
  { role: "Content Team", access: "No Access" },
];
