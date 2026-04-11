import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/dashboard";
import { buildTrmnlMarkup } from "@/lib/trmnl";

export async function GET() {
  const data = await fetchDashboardData();
  return NextResponse.json({ markup: buildTrmnlMarkup(data) });
}
