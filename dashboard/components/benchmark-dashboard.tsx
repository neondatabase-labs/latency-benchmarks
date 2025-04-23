"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DatabaseSidebar } from "@/components/database-sidebar"
import { LatencyTable } from "@/components/latency-table"
import { LatencyGraphs } from "@/components/latency-graphs"
import { QASection } from "@/components/qa-section"
import { mockDatabases, mockFunctions, generateLatencyData, generateHistoricalData } from "@/lib/mock-data"

export function BenchmarkDashboard() {
  const [selectedDatabases, setSelectedDatabases] = useState(mockDatabases.slice(0, 2).map((db) => db.id))

  const toggleDatabase = (dbId: string) => {
    setSelectedDatabases((prev) => (prev.includes(dbId) ? prev.filter((id) => id !== dbId) : [...prev, dbId]))
  }

  const filteredDatabases = mockDatabases.filter((db) => selectedDatabases.includes(db.id))
  const latencyData = generateLatencyData(mockFunctions, mockDatabases)
  const historicalData = generateHistoricalData(mockFunctions, mockDatabases)

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const averageRequests = 96 // 4 requests per hour for 24 hours

  return (
    <div className="flex min-h-screen bg-background">
      <DatabaseSidebar
        databases={mockDatabases}
        selectedDatabases={selectedDatabases}
        onToggleDatabase={toggleDatabase}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Database Latency Benchmark</h1>
            <p className="text-muted-foreground mt-2">
              Compare database performance across different regions and serverless functions
            </p>
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
                {mockFunctions.length} serverless functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LatencyTable databases={filteredDatabases} functions={mockFunctions} latencyData={latencyData} />
            </CardContent>
          </Card>

          <QASection />

          <LatencyGraphs databases={filteredDatabases} functions={mockFunctions} historicalData={historicalData} />
        </div>
      </div>
    </div>
  )
}
