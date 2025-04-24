"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DatabaseSidebar } from "@/components/database-sidebar"
import { LatencyTable } from "@/components/latency-table"
import { LatencyGraphs } from "@/components/latency-graphs"
import { QASection } from "@/components/qa-section"
import { Database, Function, Stat } from "@/lib/schema"
import { DatabaseSelector } from "./database-selector"

interface DatabaseInfo {
  id: number
  name: string
  provider: string
  regionCode: string
  regionLabel: string
  region: string
}

interface ServerlessFunction {
  id: number
  name: string
  regionCode: string
  regionLabel: string
  region: string
  connectionMethod: string
}

interface LatencyData {
  cold: Record<string, Record<string, number>>
  hot: Record<string, Record<string, number>>
}

interface HistoricalData {
  [key: string]: {
    date: string
    coldLatency: number
    hotLatency: number
  }[]
}

interface BenchmarkDashboardProps {
  initialDatabases: Database[]
  initialFunctions: Function[]
  initialStats: Stat[]
}

export function BenchmarkDashboard({ 
  initialDatabases, 
  initialFunctions, 
  initialStats 
}: BenchmarkDashboardProps) {
  const [selectedDatabases, setSelectedDatabases] = useState<number[]>(
    initialDatabases.slice(0, 2).map((db) => db.id)
  )

  // Convert database and function types to match the UI components
  const databases: DatabaseInfo[] = initialDatabases.map(db => ({
    ...db,
    region: db.regionLabel
  }))
  
  const functions: ServerlessFunction[] = initialFunctions.map(fn => ({
    ...fn,
    region: fn.regionLabel
  }))

  const toggleDatabase = (dbId: number) => {
    setSelectedDatabases((prev) => (prev.includes(dbId) ? prev.filter((id) => id !== Number(dbId)) : [...prev, Number(dbId)]))
  }

  const filteredDatabases = databases.filter((db) => selectedDatabases.includes(db.id))
  const latencyData = processLatencyData(initialStats, functions, databases)
  const historicalData = processHistoricalData(initialStats, functions, databases)

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const averageRequests = 96 // 4 requests per hour for 24 hours

  return (
    <div className="flex min-h-screen bg-background">
      <DatabaseSidebar
        databases={databases}
        selectedDatabases={selectedDatabases}
        onToggleDatabase={toggleDatabase}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Latency Benchmark Dashboard</h1>
              <div className="text-sm text-muted-foreground">
                {functions.length} serverless functions
              </div>
            </div>
            <DatabaseSelector
              databases={databases}
              selectedDatabases={selectedDatabases}
              onDatabaseSelect={setSelectedDatabases}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Latency Comparison</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mr-1" />
                        Average latency for {today}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Daily average calculated from {averageRequests} requests per function</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>
                Comparing cold and hot query latency across {selectedDatabases.length} databases and{" "}
                {functions.length} serverless functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LatencyTable databases={filteredDatabases} functions={functions} latencyData={latencyData} />
            </CardContent>
          </Card>

          <QASection />

          <LatencyGraphs databases={filteredDatabases} functions={functions} stats={initialStats} />
        </div>
      </div>
    </div>
  )
}

// Helper functions to process the database stats into the required formats
function processLatencyData(stats: Stat[], functions: ServerlessFunction[], databases: DatabaseInfo[]): LatencyData {
  const result: LatencyData = {
    cold: {},
    hot: {}
  }

  // Initialize the structure
  functions.forEach(fn => {
    result.cold[fn.id] = {}
    result.hot[fn.id] = {}
    databases.forEach(db => {
      result.cold[fn.id][db.id] = 0
      result.hot[fn.id][db.id] = 0
    })
  })

  // Group stats by function and database
  const groupedStats = stats.reduce((acc, stat) => {
    const key = `${stat.functionId}-${stat.databaseId}`
    if (!acc[key]) {
      acc[key] = { cold: [], hot: [] }
    }
    if (stat.queryType === 'cold') {
      acc[key].cold.push(stat)
    } else {
      acc[key].hot.push(stat)
    }
    return acc
  }, {} as Record<string, { cold: Stat[]; hot: Stat[] }>)

  // Calculate averages
  Object.entries(groupedStats).forEach(([key, { cold, hot }]) => {
    const [functionId, databaseId] = key.split('-').map(Number)
    if (cold.length > 0) {
      result.cold[functionId][databaseId] = cold.reduce((sum, s) => sum + Number(s.latencyMs), 0) / cold.length
    }
    if (hot.length > 0) {
      result.hot[functionId][databaseId] = hot.reduce((sum, s) => sum + Number(s.latencyMs), 0) / hot.length
    }
  })

  return result
}

function processHistoricalData(stats: Stat[], functions: ServerlessFunction[], databases: DatabaseInfo[]): HistoricalData {
  const result: HistoricalData = {}

  // Initialize the structure for each database
  databases.forEach(db => {
    result[db.id] = []
  })

  // Group stats by database, date, and query type
  const groupedStats = stats.reduce((acc, stat) => {
    const date = stat.dateTime.toISOString().split('T')[0]
    if (!acc[stat.databaseId]) {
      acc[stat.databaseId] = {}
    }
    if (!acc[stat.databaseId][date]) {
      acc[stat.databaseId][date] = { cold: [], hot: [] }
    }
    if (stat.queryType === 'cold') {
      acc[stat.databaseId][date].cold.push(stat)
    } else {
      acc[stat.databaseId][date].hot.push(stat)
    }
    return acc
  }, {} as Record<number, Record<string, { cold: Stat[]; hot: Stat[] }>>)

  // Calculate daily averages for each database
  Object.entries(groupedStats).forEach(([databaseId, dates]) => {
    Object.entries(dates).forEach(([date, { cold, hot }]) => {
      result[Number(databaseId)].push({
        date,
        coldLatency: cold.reduce((sum, s) => sum + Number(s.latencyMs), 0) / cold.length,
        hotLatency: hot.reduce((sum, s) => sum + Number(s.latencyMs), 0) / hot.length,
      })
    })
  })

  return result
}
