import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/dashboard";
import { buildTrmnlMarkup } from "@/lib/trmnl";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await fetchDashboardData();
  const markup = buildTrmnlMarkup(data);

  const webhookUrl = process.env.TRMNL_WEBHOOK_URL;
  const pluginUuid = process.env.TRMNL_PLUGIN_UUID;

  if (!webhookUrl || !pluginUuid) {
    return NextResponse.json({
      status: "skipped",
      reason: "TRMNL_WEBHOOK_URL or TRMNL_PLUGIN_UUID not configured",
      markup,
    });
  }

  const trmnlRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merge_variables: { markup } }),
  });

  return NextResponse.json({
    status: trmnlRes.ok ? "pushed" : "error",
    trmnlStatus: trmnlRes.status,
  });
}
