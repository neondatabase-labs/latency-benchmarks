// Types for our mock data
export interface DatabaseInfo {
    id: string
    name: string
    provider: string
    region: string
    regionCode: string // Added regionCode for consistent matching
  }
  
  export interface ServerlessFunction {
    id: string
    name: string
    region: string
    connectionMethod: string // Added connection method property
  }
  
  export interface LatencyData {
    cold: Record<string, Record<string, number>>
    hot: Record<string, Record<string, number>>
  }
  
  export interface DailyLatencyPoint {
    functionId: string
    queryType: "cold" | "hot"
    latency: number
  }
  
  export interface DailyLatencyData {
    date: string
    [key: string]: string | number // For dynamic keys like "function-id-cold"
  }
  
  export interface HistoricalData {
    [databaseId: string]: DailyLatencyData[]
  }
  
  // Mock databases with consistent regionCode property
  export const mockDatabases: DatabaseInfo[] = [
    {
      id: "neon-postgres-us-west-2",
      name: "Neon Postgres",
      provider: "Neon",
      region: "AWS us-west-2",
      regionCode: "us-west-2",
    },
    {
      id: "neon-postgres-us-east-1",
      name: "Neon Postgres",
      provider: "Neon",
      region: "AWS us-east-1",
      regionCode: "us-east-1",
    },
    {
      id: "neon-postgres-eu-west-1",
      name: "Neon Postgres",
      provider: "Neon",
      region: "AWS eu-west-1",
      regionCode: "eu-west-1",
    },
    {
      id: "neon-postgres-ap-southeast-1",
      name: "Neon Postgres",
      provider: "Neon",
      region: "AWS ap-southeast-1",
      regionCode: "ap-southeast-1",
    },
    {
      id: "supabase-postgres-us-west-1",
      name: "Supabase Postgres",
      provider: "Supabase",
      region: "AWS us-west-1",
      regionCode: "us-west-1",
    },
    {
      id: "supabase-postgres-eu-central-1",
      name: "Supabase Postgres",
      provider: "Supabase",
      region: "AWS eu-central-1",
      regionCode: "eu-central-1",
    },
  ]
  
  // Mock serverless functions with connection method
  export const mockFunctions: ServerlessFunction[] = [
    {
      id: "vercel-lambda-us-west-2",
      name: "Vercel Lambda",
      region: "us-west-2",
      connectionMethod: "HTTP Serverless Driver",
    },
    {
      id: "vercel-lambda-us-west-1",
      name: "Vercel Lambda",
      region: "us-west-1",
      connectionMethod: "HTTP Serverless Driver",
    },
    {
      id: "vercel-lambda-us-east-1",
      name: "Vercel Lambda",
      region: "us-east-1",
      connectionMethod: "HTTP Serverless Driver",
    },
    {
      id: "vercel-lambda-eu-west-1",
      name: "Vercel Lambda",
      region: "eu-west-1",
      connectionMethod: "HTTP Serverless Driver",
    },
    {
      id: "vercel-lambda-ap-southeast-1",
      name: "Vercel Lambda",
      region: "ap-southeast-1",
      connectionMethod: "HTTP Serverless Driver",
    },
  ]
  
  // Generate mock latency data
  export function generateLatencyData(functions: ServerlessFunction[], databases: DatabaseInfo[]): LatencyData {
    const latencyData: LatencyData = {
      cold: {},
      hot: {},
    }
  
    functions.forEach((fn) => {
      latencyData.cold[fn.id] = {}
      latencyData.hot[fn.id] = {}
  
      databases.forEach((db) => {
        // Generate realistic latency based on regions
        const coldLatency = generateRealisticLatency(db.regionCode, fn.region, "cold")
        const hotLatency = generateRealisticLatency(db.regionCode, fn.region, "hot")
  
        latencyData.cold[fn.id][db.id] = coldLatency
        latencyData.hot[fn.id][db.id] = hotLatency
      })
    })
  
    return latencyData
  }
  
  // Generate historical data for the past 30 days
  export function generateHistoricalData(functions: ServerlessFunction[], databases: DatabaseInfo[]): HistoricalData {
    const historicalData: HistoricalData = {}
  
    databases.forEach((db) => {
      historicalData[db.id] = []
  
      // Generate data for the past 30 days
      const today = new Date()
  
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(today.getDate() - i)
  
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
  
        const dailyData: DailyLatencyData = {
          date: formattedDate,
        }
  
        // Add latency data for each function
        functions.forEach((fn) => {
          // Base latency for this day (with some daily variation)
          const dailyVariation = Math.sin(i * 0.4) * 50 // Creates a wave pattern
  
          // Cold query latency
          const baseColdLatency = generateRealisticLatency(db.regionCode, fn.region, "cold")
          const coldLatency = Math.max(10, baseColdLatency + dailyVariation + (Math.random() * 100 - 50))
  
          // Hot query latency
          const baseHotLatency = generateRealisticLatency(db.regionCode, fn.region, "hot")
          const hotLatency = Math.max(5, baseHotLatency + dailyVariation / 2 + (Math.random() * 50 - 25))
  
          // Add to daily data
          dailyData[`${fn.id}-cold`] = coldLatency
          dailyData[`${fn.id}-hot`] = hotLatency
        })
  
        historicalData[db.id].push(dailyData)
      }
    })
  
    return historicalData
  }
  
  // Helper function to generate realistic latency based on regions and query type
  function generateRealisticLatency(dbRegion: string, fnRegion: string, queryType: "cold" | "hot"): number {
    // Base latency values
    const baseLatency = queryType === "cold" ? 300 : 50
  
    // Extract region codes for comparison
    const dbRegionCode = dbRegion.toLowerCase()
    const fnRegionCode = fnRegion.toLowerCase()
  
    // Calculate distance factor
    let distanceFactor = 1.0
  
    // Same region bonus
    if (dbRegionCode === fnRegionCode) {
      distanceFactor = 0.7
    }
    // Same area but different region (e.g., us-west-1 and us-west-2)
    else if (
      (dbRegionCode.startsWith("us-west") && fnRegionCode.startsWith("us-west")) ||
      (dbRegionCode.startsWith("us-east") && fnRegionCode.startsWith("us-east")) ||
      (dbRegionCode.startsWith("eu-") && fnRegionCode.startsWith("eu-")) ||
      (dbRegionCode.startsWith("ap-") && fnRegionCode.startsWith("ap-"))
    ) {
      distanceFactor = 1.2
    }
    // Same continent
    else if (
      (dbRegionCode.startsWith("us-") && fnRegionCode.startsWith("us-")) ||
      (dbRegionCode.startsWith("eu-") && fnRegionCode.startsWith("eu-")) ||
      (dbRegionCode.startsWith("ap-") && fnRegionCode.startsWith("ap-"))
    ) {
      distanceFactor = 1.5
    }
    // Cross-continent
    else {
      distanceFactor = 2.5
    }
  
    // Calculate latency with some randomness
    let latency = baseLatency * distanceFactor
  
    // Add some random variation (±15%)
    const randomFactor = 0.85 + Math.random() * 0.3
    latency *= randomFactor
  
    // For cold queries, add a cold start penalty
    if (queryType === "cold") {
      // Neon has faster cold starts in general
      const isColdStartPenalty = Math.random() > 0.3 // 70% chance of cold start penalty
      if (isColdStartPenalty) {
        const coldStartPenalty = dbRegion.includes("neon")
          ? Math.random() * 200 + 100
          : // Neon: 100-300ms penalty
            Math.random() * 400 + 200 // Others: 200-600ms penalty
        latency += coldStartPenalty
      }
    }
  
    return Math.round(latency * 100) / 100 // Round to 2 decimal places
  }
  