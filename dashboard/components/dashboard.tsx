"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LatencyChart } from "@/components/latency-chart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for the dashboard
const mockData = {
  date: new Date().toLocaleDateString(),
  requestCount: 1432,
  databases: [
    {
      id: "neon-us-west-2",
      name: "Neon Postgres",
      region: "AWS us-west-2",
      selected: true,
    },
    {
      id: "neon-us-east-1",
      name: "Neon Postgres",
      region: "AWS us-east-1",
      selected: true,
    },
  ],
  functions: [
    {
      id: "vercel-us-west-2",
      name: "Vercel lambda",
      region: "us-west-2",
    },
    {
      id: "vercel-us-west-1",
      name: "Vercel lambda",
      region: "us-west-1",
    },
    {
      id: "vercel-us-east-1",
      name: "Vercel lambda",
      region: "us-east-1",
    },
  ],
  latencyData: {
    cold: {
      "vercel-us-west-2": {
        "neon-us-west-2": 124,
        "neon-us-east-1": 187,
      },
      "vercel-us-west-1": {
        "neon-us-west-2": 142,
        "neon-us-east-1": 201,
      },
      "vercel-us-east-1": {
        "neon-us-west-2": 198,
        "neon-us-east-1": 115,
      },
    },
    hot: {
      "vercel-us-west-2": {
        "neon-us-west-2": 42,
        "neon-us-east-1": 98,
      },
      "vercel-us-west-1": {
        "neon-us-west-2": 56,
        "neon-us-east-1": 112,
      },
      "vercel-us-east-1": {
        "neon-us-west-2": 87,
        "neon-us-east-1": 38,
      },
    },
  },
  faqs: [
    {
      question: "What is a cold query?",
      answer:
        "A cold query is a database query that triggers a cold start in the database. This happens when the database has been idle and needs to allocate resources before processing the query, resulting in higher latency.",
    },
    {
      question: "What is a hot query?",
      answer:
        "A hot query is a database query that executes on an already running database instance. Since the database is already active, these queries typically have lower latency compared to cold queries.",
    },
    {
      question: "How often are benchmark requests made?",
      answer:
        "Benchmark requests are made every 15 minutes from each serverless function to each target database. This provides a consistent stream of data points throughout the day.",
    },
    {
      question: "How is the daily average calculated?",
      answer:
        "The daily average is calculated by taking the mean of all latency measurements over a 24-hour period. Outliers beyond 3 standard deviations are excluded to prevent extreme values from skewing the results.",
    },
  ],
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("cold")

  return (
    <div className="flex-1 overflow-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Latency Comparison</CardTitle>
          <CardDescription>
            Average latency for {mockData.date} - averaged over {mockData.requestCount} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cold" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="cold">Cold Query</TabsTrigger>
              <TabsTrigger value="hot">Hot Query</TabsTrigger>
            </TabsList>
            <TabsContent value="cold" className="mt-0">
              <LatencyTable type="cold" />
            </TabsContent>
            <TabsContent value="hot" className="mt-0">
              <LatencyTable type="hot" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {mockData.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {mockData.databases.map((db) => (
        <Card key={db.id} className="mb-6">
          <CardHeader>
            <CardTitle>
              {db.name} ({db.region}) - 30 Day History
            </CardTitle>
            <CardDescription>Individual latency data points for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <LatencyChart databaseId={db.id} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LatencyTable({ type }: { type: "cold" | "hot" }) {
  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Serverless Function</TableHead>
              {mockData.databases.map((db) => (
                <TableHead key={db.id}>
                  {db.name} <br />
                  <span className="text-xs font-normal">{db.region}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.functions.map((fn) => (
              <TableRow key={fn.id}>
                <TableCell className="font-medium">
                  {fn.name} <br />
                  <span className="text-xs font-normal">{fn.region}</span>
                </TableCell>
                {mockData.databases.map((db) => {
                  const latency = mockData.latencyData[type][fn.id][db.id]
                  return (
                    <TableCell key={db.id}>
                      <div className="flex items-center">
                        <span className={`font-semibold ${getLatencyColor(latency, type)}`}>{latency} ms</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="ml-2 h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Based on {Math.floor(mockData.requestCount / 6)} requests</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}

// Helper function to determine color based on latency
function getLatencyColor(latency: number, type: "cold" | "hot") {
  if (type === "cold") {
    if (latency < 150) return "text-green-600"
    if (latency < 180) return "text-yellow-600"
    return "text-red-600"
  } else {
    if (latency < 60) return "text-green-600"
    if (latency < 90) return "text-yellow-600"
    return "text-red-600"
  }
}
