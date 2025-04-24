"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Database, Function, Stat } from "@/lib/schema"

interface ChartData {
  date: string;
  cold: number;
  hot: number;
}

interface LatencyChartProps {
  database: Database;
  functions: Function[];
  stats: Stat[];
}

export function LatencyChart({ database, functions, stats }: LatencyChartProps) {
  // Transform stats into chart data format
  const chartData = stats.reduce((acc, stat) => {
    const date = new Date(stat.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const existingData = acc.find(d => d.date === date)
    
    if (existingData) {
      if (stat.queryType === 'cold') {
        existingData.cold = Number(stat.latencyMs)
      } else {
        existingData.hot = Number(stat.latencyMs)
      }
    } else {
      acc.push({
        date,
        cold: stat.queryType === 'cold' ? Number(stat.latencyMs) : 0,
        hot: stat.queryType === 'hot' ? Number(stat.latencyMs) : 0
      })
    }
    
    return acc
  }, [] as ChartData[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Tabs defaultValue="combined">
      <TabsList>
        <TabsTrigger value="combined">Combined</TabsTrigger>
        <TabsTrigger value="cold">Cold Queries</TabsTrigger>
        <TabsTrigger value="hot">Hot Queries</TabsTrigger>
      </TabsList>

      <TabsContent value="combined" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cold"
                  name="Cold Query"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="hot"
                  name="Hot Query"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cold" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cold"
                  name="Cold Query"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hot" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="hot"
                  name="Hot Query"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
