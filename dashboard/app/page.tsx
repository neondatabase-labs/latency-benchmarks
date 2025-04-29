import { BenchmarkDashboard } from "@/components/benchmark-dashboard"
import { getAllDatabases, getAllFunctions, getLast30DaysStats, getStatsWithDetails } from "@/lib/db"

// Revalidate the page every 15 minutes
export const revalidate = 900; // 15 minutes in seconds

export default async function Home() {
  // Fetch all functions first
  const functions = await getAllFunctions();

  // For each function, fetch its associated databases
  const databasesByFunction = await Promise.all(
    functions.map(async (fn) => {
      const databases = await getAllDatabases(fn.id);
      return { function: fn, databases };
    })
  );

  // Flatten all databases into a single array
  const allDatabases = databasesByFunction.flatMap(({ databases }) => databases);

  // Fetch stats for all databases
  const allStats = await Promise.all(
    allDatabases.map(db => getLast30DaysStats(db.id))
  );

  // Combine all stats into a single array
  const combinedStats = allStats.flat();

  // Get stats with database and function details
  const statsWithDetails = await getStatsWithDetails(combinedStats);

  return (
    <main>
      <BenchmarkDashboard 
        initialDatabases={allDatabases}
        initialFunctions={functions}
        initialStats={statsWithDetails}
      />
    </main>
  );
}
