import { NextResponse } from "next/server";
import { getCompanySettings, upsertCompanySettings } from "@/services/settings/company";
import { companySettingsSchema, CompanySettingsInput } from "@/lib/validations/settings";

export async function GET() {
  try {
    const settings = await getCompanySettings();
    if (!settings) {
      return NextResponse.json({ settings: null }, { status: 200 });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/company/settings error", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = companySettingsSchema.safeParse(json as CompanySettingsInput);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const settings = await upsertCompanySettings(parsed.data);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PUT /api/company/settings error", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
