import { BenchmarkDashboard } from "@/components/benchmark-dashboard"
import { getAllDatabases, getAllFunctions, getLast30DaysStats, getStatsWithDetails } from "@/lib/db"

export default async function Home() {
  // Fetch all required data on the server
  const [databases, functions, stats] = await Promise.all([
    getAllDatabases(),
    getAllFunctions(),
    getLast30DaysStats(1) // Get stats for the first database as an example
  ]);

  // Get stats with database and function details
  const statsWithDetails = await getStatsWithDetails(stats);

  return (
    <main className="container mx-auto p-4">
      <BenchmarkDashboard 
        initialDatabases={databases}
        initialFunctions={functions}
        initialStats={statsWithDetails}
      />
    </main>
  );
}
