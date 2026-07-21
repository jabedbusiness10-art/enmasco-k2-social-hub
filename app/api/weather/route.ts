import { NextRequest, NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/weather/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";
  const weather = await getCurrentWeather(forceRefresh);
  return NextResponse.json(weather, {
    status: weather.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "private, no-store" },
  });
}
