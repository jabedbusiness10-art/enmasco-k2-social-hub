export type AccountPlatform = "facebook" | "instagram" | "linkedin" | "youtube";
export type AccountPlatformStatus = "CONNECTED" | "WARNING" | "DISCONNECTED";

export interface CompanyAccount {
  id: string;
  platform: AccountPlatform;
  accountName: string;
  pageId: string;
  status: AccountPlatformStatus;
  connectedDate: string;
  followers?: number;
  lastSync: string;
  nextSync?: string;
  tokenStatus: string;
  apiVersion?: string;
  lastUpdated: string;
}

export interface ActivityEntry {
  id: string;
  time: string;
  message: string;
}

export interface PermissionEntry {
  role: string;
  access: string;
}
