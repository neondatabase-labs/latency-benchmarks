import { BenchmarkDashboard } from "@/components/benchmark-dashboard";
import {
  getAllDatabases,
  getAllFunctions,
  getLast30DaysAvgLatency,
} from "@/lib/db";

// Revalidate the page every 15 minutes
export const revalidate = 900; // 15 minutes in seconds

export default async function Home() {
  const [functions, databases, stats] = await Promise.all([
    getAllFunctions(),
    getAllDatabases(),
    getLast30DaysAvgLatency(),
  ]);

  return (
    <main>
      <BenchmarkDashboard
        initialDatabases={databases}
        initialFunctions={functions}
        initialStats={stats}
      />
    </main>
  );
}
