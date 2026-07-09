import { prisma } from "@/lib/db";
import type { CompanySettingsInput } from "@/lib/validations/settings";

export type CompanySettings = {
  id: string;
  companyName: string;
  companyShortName: string | null;
  logoUrl: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
  accentColor: string;
  sidebarStyle: string;
  glassEffect: boolean;
  sessionTimeout: number;
  passwordPolicy: string;
  auditLogging: boolean;
  supportEmail: string | null;
  defaultLanguage: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toInput(row: CompanySettings): CompanySettingsInput {
  return {
    companyName: row.companyName,
    companyShortName: row.companyShortName ?? "",
    logoUrl: row.logoUrl ?? "",
    website: row.website ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    timezone: row.timezone,
    language: row.language,
    dateFormat: row.dateFormat,
    timeFormat: row.timeFormat as CompanySettingsInput["timeFormat"],
    theme: row.theme,
    accentColor: row.accentColor,
    sidebarStyle: row.sidebarStyle,
    glassEffect: row.glassEffect,
    sessionTimeout: row.sessionTimeout,
    passwordPolicy: row.passwordPolicy,
    auditLogging: row.auditLogging,
  };
}

export async function getCompanySettings(): Promise<CompanySettingsInput | null> {
  const settings = await prisma.companySettings.findFirst();
  if (!settings) return null;
  return toInput(settings as CompanySettings);
}

export async function upsertCompanySettings(
  input: CompanySettingsInput
): Promise<CompanySettingsInput> {
  const existing = await prisma.companySettings.findFirst();
  if (existing) {
    const updated = await prisma.companySettings.update({
      where: { id: existing.id },
      data: input,
    });
    return toInput(updated as CompanySettings);
  }
  const created = await prisma.companySettings.create({
    data: input,
  });
  return toInput(created as CompanySettings);
}
