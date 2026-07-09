import { z } from "zod";

export const companySettingsSchema = z.object({
  companyName: z.string().min(3, "Company name must be at least 3 characters"),
  companyShortName: z.string().max(50).optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),

  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(2, "Language code is required"),
  dateFormat: z.string().min(2, "Date format is required"),
  timeFormat: z.enum(["12H", "24H"]),

  theme: z.string().min(1),
  accentColor: z.string().min(3),
  sidebarStyle: z.string().min(1),
  glassEffect: z.boolean(),

  sessionTimeout: z.coerce.number().int().min(5).max(120),
  passwordPolicy: z.string().min(1),
  auditLogging: z.boolean(),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
