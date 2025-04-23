"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HistoricalChart } from "@/components/historical-chart"
import type { DatabaseInfo, ServerlessFunction, HistoricalData } from "@/lib/mock-data"

interface LatencyGraphsProps {
  databases: DatabaseInfo[]
  functions: ServerlessFunction[]
  historicalData: HistoricalData
}

export function LatencyGraphs({ databases, functions, historicalData }: LatencyGraphsProps) {
  if (databases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Select at least one database to view historical data</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Historical Performance</h2>
      <p className="text-muted-foreground">Individual latency datapoints for the last 30 days (not averaged)</p>

      <div className="space-y-6">
        {databases.map((db) => (
          <Card key={db.id}>
            <CardHeader>
              <CardTitle>{db.name}</CardTitle>
              <CardDescription>
                {db.provider} in {db.region} - 30-day historical latency data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HistoricalChart database={db} functions={functions} data={historicalData[db.id]} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
