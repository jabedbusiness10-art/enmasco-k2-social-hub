// Central, strongly-typed settings model for the K2KAI Social Flow
// Enterprise Control Center. Each section is its own slice so the form
// state stays modular, scalable and ready to bind to real backend APIs.

export type ThemeMode = "dark" | "light" | "system";
export type SidebarStyle = "glass" | "solid" | "minimal";
export type PasswordPolicy = "standard" | "strong" | "enterprise";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "D MMM YYYY";
export type TimeFormat = "12H" | "24H";

export interface CompanyProfile {
  companyName: string;
  companyShortName: string;
  legalName: string;
  taxId: string;
  logoUrl: string;
  faviconUrl: string;
  website: string;
  email: string;
  supportEmail: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  industry: string;
  description: string;
}

export interface RegionalSettings {
  timezone: string;
  language: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  currency: string;
  firstDayOfWeek: "monday" | "sunday" | "saturday";
  numberFormat: "western" | "european" | "indian";
  weekStartsOn: "monday" | "sunday";
}

export interface BrandingSettings {
  theme: ThemeMode;
  accentColor: string;
  sidebarStyle: SidebarStyle;
  glassEffect: boolean;
  borderRadius: number;
  fontFamily: string;
  logoOnLight: string;
  logoOnDark: string;
  emailTemplate: string;
  customCss: string;
}

export interface SocialAccountSettings {
  autoConnect: boolean;
  defaultPlatforms: string[];
  tokenRefresh: "auto" | "manual";
  rateLimitGuard: boolean;
  postApproval: boolean;
  crossPost: boolean;
  watermark: string;
}

export interface AIConfiguration {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  autoReply: boolean;
  humanReview: boolean;
  contentModeration: boolean;
  brandVoice: string;
  fallbackProvider: string;
  apiKeySet: boolean;
}

export interface PublishingSettings {
  defaultSchedule: string;
  timeZoneLock: boolean;
  approvalFlow: boolean;
  autoRetry: boolean;
  retryCount: number;
  linkShortener: string;
  utmEnabled: boolean;
  defaultVisibility: "public" | "private" | "unlisted";
  duplicateGuard: boolean;
}

export interface NotificationSettings {
  emailDigest: boolean;
  pushAlerts: boolean;
  slackIntegration: boolean;
  slackWebhook: string;
  mentions: boolean;
  weeklyReport: boolean;
  failureAlerts: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  channels: string[];
}

export interface TeamPermissionSettings {
  selfSignup: boolean;
  defaultRole: string;
  twoFactorEnforced: boolean;
  ssoEnabled: boolean;
  ssoProvider: string;
  inviteOnly: boolean;
  guestAccess: boolean;
  seatLimit: number;
}

export interface SecuritySettings {
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  auditLogging: boolean;
  ipWhitelist: string;
  mfaRequired: boolean;
  loginAlerts: boolean;
  dataRetentionDays: number;
  blockVpn: boolean;
}

export interface IntegrationSettings {
  enabled: string[];
  webhookUrl: string;
  webhookSecret: string;
  zapierEnabled: boolean;
  apiAccess: boolean;
  rateLimitPerMin: number;
  allowedOrigins: string;
  eventLog: boolean;
}

export interface BackupSettings {
  autoBackup: boolean;
  frequency: "hourly" | "daily" | "weekly";
  retention: number;
  storageTarget: "s3" | "gcs" | "azure" | "local";
  encryptBackups: boolean;
  lastBackupAt: string;
  notifyOnFailure: boolean;
}

export interface BillingSettings {
  plan: "free" | "pro" | "business" | "enterprise" | "future";
  billingEmail: string;
  paymentMethod: string;
  autoRenew: boolean;
  seatsIncluded: number;
  usageBased: boolean;
  invoiceFormat: "pdf" | "xml";
  currency: string;
}

export interface AuditLogSettings {
  retentionDays: number;
  logLevel: "basic" | "detailed" | "verbose";
  exportEnabled: boolean;
  piiRedaction: boolean;
  streamToSiem: boolean;
  siemEndpoint: string;
}

export interface SystemHealthSettings {
  enableMonitoring: boolean;
  metricsEndpoint: string;
  alertThreshold: number;
  healthcheckInterval: number;
  errorTracking: boolean;
  errorTrackingDsn: string;
  uptimeTarget: number;
}

export interface AdvancedSettings {
  featureFlags: string[];
  maintenanceMode: boolean;
  betaChannel: boolean;
  debugMode: boolean;
  experimentalUi: boolean;
  apiVersion: string;
  cacheTtl: number;
  maxUploadMb: number;
}

export interface AppSettings {
  profile: CompanyProfile;
  regional: RegionalSettings;
  branding: BrandingSettings;
  social: SocialAccountSettings;
  ai: AIConfiguration;
  publishing: PublishingSettings;
  notifications: NotificationSettings;
  team: TeamPermissionSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  backup: BackupSettings;
  billing: BillingSettings;
  audit: AuditLogSettings;
  system: SystemHealthSettings;
  advanced: AdvancedSettings;
}

export type SettingsSectionKey = keyof AppSettings;

export const SETTINGS_SECTIONS: { key: SettingsSectionKey; label: string; icon: string; group: string }[] = [
  { key: "profile", label: "Company Profile", icon: "Building2", group: "Organization" },
  { key: "regional", label: "Regional Settings", icon: "Globe", group: "Organization" },
  { key: "branding", label: "Branding", icon: "Palette", group: "Organization" },
  { key: "social", label: "Social Accounts", icon: "Share2", group: "Channels" },
  { key: "ai", label: "AI Configuration", icon: "Sparkles", group: "Channels" },
  { key: "publishing", label: "Publishing", icon: "Send", group: "Channels" },
  { key: "notifications", label: "Notifications", icon: "Bell", group: "Channels" },
  { key: "team", label: "Team & Permissions", icon: "Users", group: "Administration" },
  { key: "security", label: "Security", icon: "ShieldCheck", group: "Administration" },
  { key: "integrations", label: "Integrations", icon: "Plug", group: "Administration" },
  { key: "backup", label: "Backup & Restore", icon: "Database", group: "Administration" },
  { key: "billing", label: "Billing (Future)", icon: "CreditCard", group: "Administration" },
  { key: "audit", label: "Audit Logs", icon: "ScrollText", group: "Observability" },
  { key: "system", label: "System Health", icon: "Activity", group: "Observability" },
  { key: "advanced", label: "Advanced", icon: "SlidersHorizontal", group: "Observability" },
];
