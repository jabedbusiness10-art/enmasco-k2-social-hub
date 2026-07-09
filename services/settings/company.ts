import { prisma } from "@/lib/db";
import { CompanySettingsInput } from "@/lib/validations/settings";

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
  createdAt: Date;
  updatedAt: Date;
};

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const settings = await prisma.companySettings.findFirst();
  return settings as CompanySettings | null;
}

export async function upsertCompanySettings(input: CompanySettingsInput): Promise<CompanySettings> {
  const existing = await prisma.companySettings.findFirst();
  if (existing) {
    const updated = await prisma.companySettings.update({
      where: { id: existing.id },
      data: input,
    });
    return updated as CompanySettings;
  }
  const created = await prisma.companySettings.create({
    data: input,
  });
  return created as CompanySettings;
}
