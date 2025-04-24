"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LatencyChart } from "@/components/latency-chart"
import type { Database, Function, Stat } from "@/lib/schema"

interface LatencyGraphsProps {
  databases: Database[];
  functions: Function[];
  stats: Stat[];
}

export function LatencyGraphs({ databases, functions, stats }: LatencyGraphsProps) {
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
        {databases.map((db) => {
          const dbStats = stats.filter(stat => stat.databaseId === db.id)
          return (
            <Card key={db.id}>
              <CardHeader>
                <CardTitle>{db.name}</CardTitle>
                <CardDescription>
                  {db.provider} in {db.regionLabel} - 30-day historical latency data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LatencyChart 
                  database={db} 
                  functions={functions} 
                  stats={dbStats}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
