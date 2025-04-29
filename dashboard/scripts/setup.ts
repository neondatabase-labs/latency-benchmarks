import { db } from "../lib/db";
import { databases, functions, type NewDatabase, type NewFunction } from "../lib/schema";
import { getVercelRegionCode } from "../lib/vercel";
import { $ } from "bun";

async function createNeonProject(platform: string, platformRegion: string, dbRegion: string, connectionMethod: 'ws' | 'http'): Promise<{ connectionUrl: string; projectId: string }> {
  const projectName = `benchmarking-from-${platform}-${platformRegion}-to-${dbRegion}-via-${
    connectionMethod === 'ws' ? 'ws' : 'http'
  }`;
  console.log(`Creating Neon project: ${projectName}`);
  
  try {
    const projectData = await $`npx neonctl project create --name ${projectName} --region-id aws-${dbRegion} --org-id ${process.env.NEON_ORG_ID} --output json`.json();
    return {
      connectionUrl: projectData.connection_uris[0].connection_uri,
      projectId: projectData.project.id,
    };
  } catch (error) {
    console.error(`Failed to create project ${projectName}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Create Vercel functions for each region
    const vercelFunctions: NewFunction[] = [
      {
        name: "Vercel Serverless",
        regionCode: "us-east-2",
        regionLabel: "Columbus, USA (East) - us-east-2 - cle1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "us-west-2",
        regionLabel: "Portland, USA (West) - us-west-2 - pdx1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "us-east-1",
        regionLabel: "Washington, D.C., USA (East) - us-east-1 - iad1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "us-west-1",
        regionLabel: "San Francisco, USA (West) - us-west-1 - sfo1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "eu-west-1",
        regionLabel: "Dublin, Ireland (West EU) - eu-west-1 - dub1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "eu-west-2",
        regionLabel: "London, UK (West EU) - eu-west-2 - lhr1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "eu-central-1",
        regionLabel: "Frankfurt, Germany (Central EU) - eu-central-1 - fra1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "eu-north-1",
        regionLabel: "Stockholm, Sweden (North EU) - eu-north-1 - arn1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "ap-southeast-1",
        regionLabel: "Singapore (Southeast Asia) - ap-southeast-1 - sin1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "ap-southeast-2",
        regionLabel: "Sydney, Australia (Southeast Asia) - ap-southeast-2 - syd1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "ap-northeast-1",
        regionLabel: "Tokyo, Japan (Northeast Asia) - ap-northeast-1 - hnd1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "ap-northeast-2",
        regionLabel: "Seoul, South Korea (Northeast Asia) - ap-northeast-2 - icn1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "ap-south-1",
        regionLabel: "Mumbai, India (South Asia) - ap-south-1 - bom1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "sa-east-1",
        regionLabel: "São Paulo, Brazil (South America) - sa-east-1 - gru1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "af-south-1",
        regionLabel: "Cape Town, South Africa (South Africa) - af-south-1 - cpt1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "me-south-1",
        regionLabel: "Dubai, UAE (Middle East) - me-south-1 - dxb1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "eu-west-3",
        regionLabel: "Paris, France (West EU) - eu-west-3 - cdg1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "ap-east-1",
        regionLabel: "Hong Kong (East Asia) - ap-east-1 - hkg1",
        platform: "vercel",
      },
      {
        name: "Vercel Serverless",
        regionCode: "ap-northeast-3",
        regionLabel: "Osaka, Japan (Northeast Asia) - ap-northeast-3 - kix1",
        platform: "vercel",
      }
    ];

    console.log("Creating functions...");
    const createdFunctions = await Promise.all(
      vercelFunctions.map(async (func) => {
        const result = await db.insert(functions).values(func).returning();
        return result[0];
      })
    );
    console.log("Created functions:", createdFunctions);

    // Neon AWS Regions
    const awsRegions = [
      { code: "us-east-1", label: "AWS US East 1 (N. Virginia)" },
      { code: "us-east-2", label: "AWS US East 2 (Ohio)" },
      { code: "us-west-2", label: "AWS US West 2 (Oregon)" },
      { code: "ap-southeast-1", label: "AWS Asia Pacific 1 (Singapore)" },
      { code: "ap-southeast-2", label: "AWS Asia Pacific 2 (Sydney)" },
      { code: "eu-central-1", label: "AWS Europe Central 1 (Frankfurt)" },
      { code: "eu-west-2", label: "AWS Europe West 2 (London)" },
      { code: "sa-east-1", label: "AWS South America East 1 (São Paulo)" },
    ];

    // Regions that should have both HTTP and WebSocket connections
    const specialRegions = ["us-west-2", "us-east-1"];

    console.log("Creating databases...");
    for (const fn of createdFunctions) {
      const neonDatabases: NewDatabase[] = [];
      const vercelRegionCode = getVercelRegionCode(fn.regionCode);

      // Create HTTP databases for all regions
      for (const region of awsRegions) {
        // Create HTTP connection project
        const { connectionUrl: httpConnectionUrl, projectId: httpProjectId } = await createNeonProject(
          fn.platform,
          vercelRegionCode,
          region.code,
          'http'
        );

        neonDatabases.push({
          name: "Neon Postgres",
          provider: "neon",
          regionCode: region.code,
          regionLabel: region.label,
          functionId: fn.id,
          connectionMethod: 'http',
          connectionUrl: httpConnectionUrl,
          neonProjectId: httpProjectId,
        });

        // Add special configurations only for specified regions
        if (specialRegions.includes(region.code)) {
          // Add WebSocket connection (which handles pooling)
          const { connectionUrl: wsConnectionUrl, projectId: wsProjectId } = await createNeonProject(
            fn.platform,
            vercelRegionCode,
            region.code,
            'ws'
          );

          neonDatabases.push({
            name: "Neon Postgres",
            provider: "neon",
            regionCode: region.code,
            regionLabel: region.label,
            functionId: fn.id,
            connectionMethod: 'ws',
            connectionUrl: wsConnectionUrl,
            neonProjectId: wsProjectId,
          });
        }
      }

      const createdDatabases = await Promise.all(
        neonDatabases.map(async (database) => {
          const result = await db.insert(databases).values(database).returning();
          return result[0];
        })
      );
      console.log(`Created databases for function ${fn.id}:`, createdDatabases);
    }

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
