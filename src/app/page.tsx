import { Dashboard } from "@/components/dashboard";
import { fetchDashboardData } from "@/lib/dashboard";

// Data fetchers carry their own caches; render per request so ETAs are current.
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await fetchDashboardData();
  return <Dashboard initial={data} />;
}
