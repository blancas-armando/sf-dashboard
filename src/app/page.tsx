import { Dashboard } from "@/components/dashboard";
import { fetchDashboardData } from "@/lib/dashboard";

export const revalidate = 60;

export default async function Home() {
  const data = await fetchDashboardData();
  return <Dashboard initial={data} />;
}
