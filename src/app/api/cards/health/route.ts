import { NextResponse } from "next/server";
import { services } from "@/services";

export async function GET() {
  const svc = await services.health();
  const data = await svc.get();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}