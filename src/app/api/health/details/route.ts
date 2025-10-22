import { NextResponse } from "next/server";

export async function GET() {
  const mod = process.env.MOCK
    ? await import("@/services/health/health.mock")
    : await import("@/services/health/health");
  const svc = mod.healthService;
  const data = await svc.summary();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}