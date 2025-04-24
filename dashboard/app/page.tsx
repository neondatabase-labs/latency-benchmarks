import { BenchmarkDashboard } from "@/components/benchmark-dashboard"
import { getAllDatabases, getAllFunctions, getLast30DaysStats, getStatsWithDetails } from "@/lib/db"

// Revalidate the page every 15 minutes
export const revalidate = 900; // 15 minutes in seconds

export default async function Home() {
  // Fetch all databases and functions first
  const [databases, functions] = await Promise.all([
    getAllDatabases(),
    getAllFunctions()
  ]);

  // Fetch stats for all databases
  const allStats = await Promise.all(
    databases.map(db => getLast30DaysStats(db.id))
  );

  // Combine all stats into a single array
  const combinedStats = allStats.flat();

  // Get stats with database and function details
  const statsWithDetails = await getStatsWithDetails(combinedStats);

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
