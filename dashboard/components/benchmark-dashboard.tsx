"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DatabaseSidebar } from "@/components/database-sidebar"
import { LatencyTable } from "@/components/latency-table"
import { LatencyGraphs } from "@/components/latency-graphs"
import { QASection } from "@/components/qa-section"
import { Database, Function, Stat } from "@/lib/schema"

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

export function BenchmarkDashboard(props: BenchmarkDashboardProps) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <BenchmarkDashboardClient {...props} />
    </Suspense>
  )
}

function BenchmarkDashboardClient({ 
  initialDatabases, 
  initialFunctions, 
  initialStats 
}: BenchmarkDashboardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Initialize selectedDatabases from URL query param or default to empty array
  const [selectedDatabases, setSelectedDatabases] = useState<number[]>(() => {
    const dbParam = searchParams.get('databases')
    return dbParam === 'all' ? initialDatabases.map(db => db.id) : 
           dbParam ? dbParam.split(',').map(Number) : []
  })

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    if (selectedDatabases.length === 0) {
      newParams.set('databases', 'all')
      const newSelectedDatabases = initialDatabases.map(db => db.id)
      setSelectedDatabases(newSelectedDatabases)
    } else if (selectedDatabases.length === initialDatabases.length) {
      newParams.set('databases', 'all')
    } else {
      newParams.set('databases', selectedDatabases.join(','))
    }
    
    if (!newParams.has('queries')) {
      newParams.set('queries', 'all')
    }
    if (!newParams.has('regions')) {
      newParams.set('regions', 'all')
    }
    
    window.history.replaceState({}, '', `?${newParams.toString()}`)
  }, [selectedDatabases, searchParams, initialDatabases])


  const toggleDatabase = (dbId: number) => {
    setSelectedDatabases((prev) => (prev.includes(dbId) ? prev.filter((id) => id !== Number(dbId)) : [...prev, Number(dbId)]))
  }

  const filteredDatabases = initialDatabases.filter((db) => selectedDatabases.includes(db.id))
  const latencyData = processLatencyData(initialStats, initialFunctions, initialDatabases)
  const historicalData = processHistoricalData(initialStats, initialFunctions, initialDatabases)

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex min-h-screen bg-background">
      <DatabaseSidebar
        databases={initialDatabases}
        selectedDatabases={selectedDatabases}
        onToggleDatabase={toggleDatabase}
      />

      <div className="flex-1 p-6" style={{ minWidth: 0 }}>
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Latency Benchmark Dashboard</h1>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>30-Day Latency Averages</CardTitle>
              </div>
              <CardDescription>
                Comparing cold and hot query latency across {selectedDatabases.length} databases and{" "}
                {initialFunctions.length} serverless functions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto m-4">
                <LatencyTable databases={filteredDatabases} functions={initialFunctions} latencyData={latencyData} />
              </div>
            </CardContent>
          </Card>
          <QASection />
        </div>
      </div>
    </div>
  )
}

// Helper functions to process the database stats into the required formats
function processLatencyData(stats: Stat[], functions: Function[], databases: Database[]): LatencyData {
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

function processHistoricalData(stats: Stat[], functions: Function[], databases: Database[]): HistoricalData {
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
