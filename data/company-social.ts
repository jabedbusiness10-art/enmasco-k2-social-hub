import type { CompanySocialAccount, HealthItem, ActivityItem, SecurityItem, PermissionItem, PostingPermissionItem, BrandSettings } from "@/types/company-social";

export const companyAccounts: CompanySocialAccount[] = [
  {
    id: "fb",
    platform: "FACEBOOK",
    accountName: "ENMASCO Security Trading Co.",
    businessId: "FB-ENMASCO-001",
    status: "CONNECTED",
    followers: 21500,
    lastSync: "2026-07-08 03:00",
    connectedDate: "2026-01-10",
    lastUpdated: "2026-07-08",
    createdBy: "MD Kazim",
  },
  {
    id: "ig",
    platform: "INSTAGRAM",
    accountName: "@enmasco",
    businessId: "IG-ENMASCO-001",
    status: "CONNECTED",
    followers: 13900,
    lastSync: "2026-07-08 02:45",
    connectedDate: "2026-02-05",
    lastUpdated: "2026-07-08",
    createdBy: "MD Kazim",
  },
  {
    id: "li",
    platform: "LINKEDIN",
    accountName: "ENMASCO Security Trading Co.",
    businessId: "LI-ENMASCO-001",
    status: "WARNING",
    followers: 8420,
    lastSync: "2026-07-07 11:20",
    connectedDate: "2026-03-01",
    lastUpdated: "2026-07-07",
    createdBy: "MD Kazim",
  },
  {
    id: "web",
    platform: "WEBSITE",
    accountName: "www.enmasco.com",
    businessId: "WEB-ENMASCO-001",
    status: "CONNECTED",
    lastSync: "2026-07-08 01:00",
    connectedDate: "2026-01-10",
    lastUpdated: "2026-07-08",
    createdBy: "MD Kazim",
  },
  {
    id: "yt",
    platform: "YOUTUBE",
    accountName: "ENMASCO TV",
    businessId: "YT-ENMASCO-001",
    status: "DISCONNECTED",
    followers: 12400,
    lastSync: "Never",
    connectedDate: "—",
    lastUpdated: "—",
    createdBy: "—",
  },
];

export const connectionHealth: HealthItem[] = [
  { id: "api", label: "API Status", value: "Healthy" },
  { id: "token", label: "Access Token Status", value: "Valid" },
  { id: "last-sync", label: "Last Synchronization", value: "2026-07-08 03:00" },
  { id: "connection", label: "Connection Health", value: "Strong" },
  { id: "next-token", label: "Next Token Expiration", value: "2026-08-08" },
  { id: "overall", label: "Overall Platform Health", value: "Good" },
];

export const platformInfo = [
  { platform: "Facebook", accountName: "ENMASCO Security Trading Co.", businessId: "FB-ENMASCO-001", connectedDate: "2026-01-10", lastUpdated: "2026-07-08", createdBy: "MD Kazim" },
  { platform: "Instagram", accountName: "@enmasco", businessId: "IG-ENMASCO-001", connectedDate: "2026-02-05", lastUpdated: "2026-07-08", createdBy: "MD Kazim" },
  { platform: "LinkedIn", accountName: "ENMASCO Security Trading Co.", businessId: "LI-ENMASCO-001", connectedDate: "2026-03-01", lastUpdated: "2026-07-07", createdBy: "MD Kazim" },
  { platform: "Website", accountName: "www.enmasco.com", businessId: "WEB-ENMASCO-001", connectedDate: "2026-01-10", lastUpdated: "2026-07-08", createdBy: "MD Kazim" },
  { platform: "YouTube", accountName: "ENMASCO TV", businessId: "YT-ENMASCO-001", connectedDate: "—", lastUpdated: "—", createdBy: "—" },
];

export const rolePermissions: PermissionItem[] = [
  { role: "CEO", access: "Full Access" },
  { role: "Admin", access: "Manage Accounts" },
  { role: "Marketing Team", access: "Publish Content" },
  { role: "Content Team", access: "Create Drafts" },
  { role: "Viewer", access: "Read Only" },
];

export const postingPermissions: PostingPermissionItem[] = [
  { label: "Allow Publishing", requiresApproval: false },
  { label: "Allow Scheduling", requiresApproval: false },
  { label: "Allow Delete", requiresApproval: true },
  { label: "Allow Edit", requiresApproval: false },
  { label: "Require CEO Approval", requiresApproval: true },
  { label: "Require Admin Approval", requiresApproval: true },
];

export const brandSettings: BrandSettings = {
  companyName: "ENMASCO Security Trading Co.",
  website: "https://www.enmasco.com",
  language: "English",
  timeZone: "Asia/Dhaka",
  brandColor: "#38bdf8",
  signature: "ENMASCO Enterprise",
};

export const activityTimeline: ActivityItem[] = [
  { id: "a1", title: "Facebook Connected", time: "2026-01-10" },
  { id: "a2", title: "Instagram Synced", time: "2026-02-05" },
  { id: "a3", title: "LinkedIn Token Refreshed", time: "2026-07-07" },
  { id: "a4", title: "Content Published", time: "2026-07-08" },
  { id: "a5", title: "Campaign Started", time: "2026-07-01" },
  { id: "a6", title: "Automation Triggered", time: "2026-07-08" },
];

export const securityCenter: SecurityItem[] = [
  { id: "s1", label: "Last Login", value: "2026-07-08 03:10" },
  { id: "s2", label: "Last Token Refresh", value: "2026-07-07 11:20" },
  { id: "s3", label: "Authorized Device", value: "Primary Admin Workstation" },
  { id: "s4", label: "API Connection Status", value: "Secure" },
  { id: "s5", label: "Security Alerts", value: "None" },
];

export const platformHealthSummary = [
  { id: "fb", name: "Facebook", status: "EXCELLENT" },
  { id: "ig", name: "Instagram", status: "GOOD" },
  { id: "li", name: "LinkedIn", status: "WARNING" },
  { id: "web", name: "Website", status: "EXCELLENT" },
  { id: "yt", name: "YouTube", status: "CRITICAL" },
];
