import { db } from "../lib/db";
import { databases, functions, stats } from "../lib/schema";
import { $ } from "bun";
import { eq } from "drizzle-orm";

async function deleteNeonProject(projectId: string) {
  console.log(`Deleting Neon project: ${projectId}`);
  try {
    await $`npx neonctl project delete ${projectId}`;
    console.log(`✅ Successfully deleted project: ${projectId}`);
  } catch (error) {
    console.error(`❌ Failed to delete project ${projectId}:`, error);
  }
}

async function main() {
  try {
    // Fetch all databases from the database
    console.log("Fetching all databases...");
    const allDatabases = await db.select().from(databases);
    console.log(`Found ${allDatabases.length} databases to clean up`);

    // Fetch all functions from the database
    console.log("\nFetching all functions...");
    const allFunctions = await db.select().from(functions);
    console.log(`Found ${allFunctions.length} functions to clean up`);

    // Delete each database and its associated stats
    console.log("\n=== CLEANING UP DATABASES AND STATS ===");
    for (const dbRecord of allDatabases) {
      console.log(`\nProcessing database: ${dbRecord.name} (${dbRecord.regionCode})`);
      
      // Delete associated stats
      console.log("Deleting associated stats...");
      await db.delete(stats).where(eq(stats.databaseId, dbRecord.id));
      console.log("✅ Deleted associated stats");

      // Delete Neon project
      await deleteNeonProject(dbRecord.neonProjectId);

      // Delete database record
      console.log("Deleting database record...");
      await db.delete(databases).where(eq(databases.id, dbRecord.id));
      console.log("✅ Deleted database record");
    }

    // Delete each function and its associated stats
    console.log("\n=== CLEANING UP FUNCTIONS AND STATS ===");
    for (const fn of allFunctions) {
      console.log(`\nProcessing function: ${fn.name} (${fn.regionCode})`);
      
      // Delete associated stats
      console.log("Deleting associated stats...");
      await db.delete(stats).where(eq(stats.functionId, fn.id));
      console.log("✅ Deleted associated stats");

      // Delete function record
      console.log("Deleting function record...");
      await db.delete(functions).where(eq(functions.id, fn.id));
      console.log("✅ Deleted function record");
    }

    console.log("\nCleanup completed successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  }); 