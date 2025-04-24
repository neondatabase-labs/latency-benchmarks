import { db } from "../lib/db";
import { databases, functions, type NewDatabase, type NewFunction } from "../lib/schema";

async function main() {
  try {
    // Create Neon databases
    const neonDatabases: NewDatabase[] = [
      {
        name: "Neon Postgres",
        provider: "neon",
        regionCode: "us-west-2",
        regionLabel: "AWS us-west-2",
      },
      {
        name: "Neon Postgres",
        provider: "neon",
        regionCode: "us-east-1",
        regionLabel: "AWS us-east-1",
      },
    ];

    console.log("Creating databases...");
    const createdDatabases = await Promise.all(
      neonDatabases.map(async (database) => {
        const result = await db.insert(databases).values(database).returning();
        return result[0];
      })
    );
    console.log("Created databases:", createdDatabases);

    // Create Vercel functions
    const vercelFunctions: NewFunction[] = [
      {
        name: "Vercel Serverless",
        regionCode: "us-west-2",
        regionLabel: "Portland, USA (West) - us-west-2 - pdx1",
        vercelRegionCode: "pdx1",
        connectionMethod: "@neondatabase/serverless (w/ connection pooling)",
      },
      {
        name: "Vercel Serverless",
        regionCode: "us-east-1",
        regionLabel: "Washington, D.C., USA (East) - us-east-1 - iad1",
        vercelRegionCode: "iad1",
        connectionMethod: "@neondatabase/serverless (w/ connection pooling)",
      },
    ];

    console.log("Creating functions...");
    const createdFunctions = await Promise.all(
      vercelFunctions.map(async (func) => {
        const result = await db.insert(functions).values(func).returning();
        return result[0];
      })
    );
    console.log("Created functions:", createdFunctions);

    console.log("Setup completed successfully!");
  } catch (error) {
    console.error("Error during setup:", error);
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