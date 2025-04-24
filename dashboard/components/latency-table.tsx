"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Database, Function, Stat } from "@/lib/schema"

interface LatencyData {
  cold: Record<number, Record<number, number>>;
  hot: Record<number, Record<number, number>>;
}

interface LatencyTableProps {
  databases: Database[];
  functions: Function[];
  latencyData: LatencyData;
}

export function LatencyTable({ databases, functions, latencyData }: LatencyTableProps) {
  // Helper function to get latency data for a specific function and database
  const getLatency = (functionId: number, databaseId: number, queryType: "cold" | "hot") => {
    return latencyData[queryType][functionId]?.[databaseId] || null;
  }

  // Format latency value with color coding
  const formatLatency = (latency: number | null, queryType: "cold" | "hot") => {
    if (latency === null) return <span className="text-muted-foreground">N/A</span>

    let colorClass = "text-green-600"
    if (queryType === "cold") {
      if (latency > 200) colorClass = "text-yellow-600"
      if (latency > 500) colorClass = "text-orange-600"
      if (latency > 1000) colorClass = "text-red-600"
    } else {
      if (latency > 100) colorClass = "text-yellow-600"
      if (latency > 250) colorClass = "text-orange-600"
      if (latency > 500) colorClass = "text-red-600"
    }

    return <span className={colorClass}>{latency.toFixed(2)}ms</span>
  }

  // Check if a database and function are in the same region
  const isExactSameRegion = (db: Database, fn: Function): boolean => {
    return db.regionCode.toLowerCase() === fn.regionCode.toLowerCase()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end space-x-2">
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-sm bg-green-100"></div>
          <span className="text-xs text-muted-foreground">Same region (recommended)</span>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="w-[200px] align-bottom">
                Serverless Function
              </TableHead>
              {databases.map((db) => (
                <TableHead key={db.id} colSpan={2} className="text-center border-b">
                  <div className="font-medium">
                    {db.name}
                    <div className="font-normal text-xs text-muted-foreground">{db.regionLabel}</div>
                    <div className="font-normal text-xs text-muted-foreground">30-day average</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              {databases.flatMap((db) => [
                <TableHead key={`${db.id}-cold`} className="text-center font-medium text-sm w-[100px]">
                  Cold
                </TableHead>,
                <TableHead key={`${db.id}-hot`} className="text-center font-medium text-sm w-[100px]">
                  Hot
                </TableHead>
              ])}
            </TableRow>
          </TableHeader>
          <TableBody>
            {functions.map((fn) => (
              <TableRow key={fn.id}>
                <TableCell className="font-medium">
                  <div>
                    {fn.name}
                    <div className="font-normal text-xs text-muted-foreground">{fn.regionLabel}</div>
                    <div className="font-normal text-xs text-muted-foreground mt-1">{fn.connectionMethod}</div>
                  </div>
                </TableCell>
                {databases.flatMap((db) => {
                  const isSameRegionMatch = isExactSameRegion(db, fn)
                  return [
                    <TableCell
                      key={`${fn.id}-${db.id}-cold`}
                      className={cn("text-center", isSameRegionMatch && "bg-green-50")}
                    >
                      {formatLatency(getLatency(fn.id, db.id, "cold"), "cold")}
                    </TableCell>,
                    <TableCell
                      key={`${fn.id}-${db.id}-hot`}
                      className={cn("text-center", isSameRegionMatch && "bg-green-50")}
                    >
                      {formatLatency(getLatency(fn.id, db.id, "hot"), "hot")}
                    </TableCell>
                  ]
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
