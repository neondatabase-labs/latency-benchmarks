"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Generate mock data for the past 30 days
const generateMockData = (databaseId: string) => {
  const data = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate random latency values with some patterns
    const coldLatency = Math.floor(100 + Math.random() * 150)
    const hotLatency = Math.floor(30 + Math.random() * 100)

    // Add some spikes for visual interest
    const hasColdSpike = Math.random() > 0.9
    const hasHotSpike = Math.random() > 0.9

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cold: hasColdSpike ? coldLatency * 1.5 : coldLatency,
      hot: hasHotSpike ? hotLatency * 1.5 : hotLatency,
    })
  }

  return data
}

export function LatencyChart({ databaseId }: { databaseId: string }) {
  const [chartData] = useState(() => generateMockData(databaseId))

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
