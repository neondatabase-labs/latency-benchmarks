"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Database, Function, Stat } from "@/lib/schema"

interface LatencyData {
  cold: Record<number, Record<number, number>>;
  hot: Record<number, Record<number, number>>;
}

interface RegionGroup {
  regionLabel: string
  connectionMethod: string
  regionCode: string
  databases: Database[]
}

interface LatencyTableProps {
  databases: Database[];
  functions: Function[];
  latencyData: LatencyData;
}

type QueryType = "both" | "cold" | "hot";
type RegionFilter = "all" | "matching";

export function LatencyTable(props: LatencyTableProps) {
  return (
    <Suspense fallback={<div>Loading table...</div>}>
      <LatencyTableClient {...props} />
    </Suspense>
  )
}

function LatencyTableClient({ databases, functions, latencyData }: LatencyTableProps) {
  const searchParams = useSearchParams()
  
  const [queryType, setQueryType] = useState<QueryType>(() => {
    const param = searchParams.get('queries')
    if (param === 'cold') return 'cold'
    if (param === 'hot') return 'hot'
    return 'both' // Default is 'both' ('all')
  })
  
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(() => {
    const param = searchParams.get('regions')
    return param === 'match' ? 'matching' : 'all' // Default is 'all'
  })
  
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    const queryParamValue = queryType === 'both' ? 'all' : queryType
    const regionParamValue = regionFilter === 'matching' ? 'match' : 'all'
    
    newParams.set('queries', queryParamValue)
    newParams.set('regions', regionParamValue)
    
    if (!newParams.has('databases')) {
      newParams.set('databases', 'all')
    }
    
    window.history.replaceState({}, '', `?${newParams.toString()}`)
  }, [queryType, regionFilter, searchParams])

  // Group databases by region and connection method
  const regionGroups = databases.reduce((groups, db) => {
    const key = `${db.regionLabel}-${db.connectionMethod}`;
    if (!groups[key]) {
      groups[key] = {
        regionLabel: db.regionLabel,
        connectionMethod: db.connectionMethod,
        regionCode: db.regionCode,
        databases: []
      };
    }
    groups[key].databases.push(db);
    return groups;
  }, {} as Record<string, RegionGroup>);

  // Define a standard order for AWS regions
  const regionOrder = [
    // Europe
    { region: 'Europe Central 1', code: 'eu-central-1' }, // Frankfurt (fra1)
    { region: 'Europe West 2', code: 'eu-west-2' }, // London (lhr1)
    { region: 'Europe West 3', code: 'eu-west-3' }, // Paris (cdg1)
    { region: 'Europe North 1', code: 'eu-north-1' }, // Stockholm (arn1)
    { region: 'Europe West 1', code: 'eu-west-1' }, // Dublin (dub1)
    // US East
    { region: 'US East 1', code: 'us-east-1' }, // Washington DC (iad1)
    { region: 'US East 2', code: 'us-east-2' }, // Columbus (cle1)
    // US West
    { region: 'US West 1', code: 'us-west-1' }, // San Francisco (sfo1)
    { region: 'US West 2', code: 'us-west-2' }, // Portland (pdx1)
    // Asia East
    { region: 'Asia East 1', code: 'ap-east-1' }, // Hong Kong (hkg1)
    { region: 'Asia Northeast 2', code: 'ap-northeast-2' }, // Seoul (icn1)
    { region: 'Asia Northeast 1', code: 'ap-northeast-1' }, // Tokyo (hnd1)
    { region: 'Asia Northeast 3', code: 'ap-northeast-3' }, // Osaka (kix1)
    // Asia South/Southeast
    { region: 'Asia Southeast 1', code: 'ap-southeast-1' }, // Singapore (sin1)
    { region: 'Asia Southeast 2', code: 'ap-southeast-2' }, // Sydney (syd1)
    { region: 'Asia South 1', code: 'ap-south-1' }, // Mumbai (bom1)
    // Middle East & Africa
    { region: 'Middle East 1', code: 'me-south-1' }, // Dubai (dxb1)
    { region: 'Africa South 1', code: 'af-south-1' }, // Cape Town (cpt1)
    // South America
    { region: 'South America East 1', code: 'sa-east-1' }, // São Paulo (gru1)
  ];

  // Helper function to get the standardized region name
  const getStandardRegion = (label: string): string => {
    // First try to match by AWS region code
    for (const region of regionOrder) {
      if (label.toLowerCase().includes(region.code.toLowerCase())) {
        return region.region;
      }
    }
    // Then try to match by region name
    for (const region of regionOrder) {
      if (label.toLowerCase().includes(region.region.toLowerCase())) {
        return region.region;
      }
    }
    return label;
  };

  // Sort region groups by region label
  const sortedRegionGroups = Object.values(regionGroups).sort((a, b) => {
    const regionA = getStandardRegion(a.regionCode); // Changed from regionLabel to regionCode
    const regionB = getStandardRegion(b.regionCode); // Changed from regionLabel to regionCode
    const indexA = regionOrder.findIndex(r => r.code === a.regionCode.toLowerCase());
    const indexB = regionOrder.findIndex(r => r.code === b.regionCode.toLowerCase());
    
    if (indexA !== indexB) return indexA - indexB;
    // If regions are the same, sort by connection method (http before ws)
    return a.connectionMethod.localeCompare(b.connectionMethod);
  });

  // Sort functions by their AWS region to match the column ordering
  const sortedFunctions = [...functions].sort((a, b) => {
    const indexA = regionOrder.findIndex(r => r.code === a.regionCode.toLowerCase());
    const indexB = regionOrder.findIndex(r => r.code === b.regionCode.toLowerCase());
    return indexA - indexB;
  });

  // Helper function to get average latency for a function across all databases in a region group
  const getRegionGroupLatency = (functionId: number, regionGroup: RegionGroup, queryType: "cold" | "hot") => {
    const validLatencies = regionGroup.databases
      .map(db => {
        const latency = latencyData[queryType][functionId]?.[db.id];
        // Only include values that are numbers and greater than 0
        return typeof latency === 'number' && latency > 0 ? latency : null;
      })
      .filter((latency): latency is number => latency !== null);

    if (validLatencies.length === 0) return null;
    return validLatencies.reduce((sum, latency) => sum + latency, 0) / validLatencies.length;
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

  // Check if a region group and function are in the same region
  const isExactSameRegion = (regionGroup: RegionGroup, fn: Function): boolean => {
    // Get the first database from the group to check the region code
    // This assumes all databases in a group share the same region code
    const db = regionGroup.databases[0];
    return db && db.regionCode.toLowerCase() === fn.regionCode.toLowerCase();
  }

  // Filter functions based on region filter
  const getFilteredFunctions = () => {
    if (regionFilter === "all") {
      return sortedFunctions;
    }
    // Get unique database region codes
    const dbRegionCodes = new Set(databases.map(db => db.regionCode.toLowerCase()));
    // Filter functions that match any database region
    return sortedFunctions.filter(fn => dbRegionCodes.has(fn.regionCode.toLowerCase()));
  };

  return (
    <div className="space-y-3 min-w-full w-fit">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={queryType === "both" ? "default" : "outline"}
              size="sm"
              onClick={() => setQueryType("both")}
            >
              All Queries
            </Button>
            <Button
              variant={queryType === "cold" ? "default" : "outline"}
              size="sm"
              onClick={() => setQueryType("cold")}
            >
              Cold Queries
            </Button>
            <Button
              variant={queryType === "hot" ? "default" : "outline"}
              size="sm"
              onClick={() => setQueryType("hot")}
            >
              Hot Queries
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-sm bg-green-100"></div>
            <span className="text-xs text-muted-foreground">Same region (recommended)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={regionFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setRegionFilter("all")}
          >
            All Function Regions
          </Button>
          <Button
            variant={regionFilter === "matching" ? "default" : "outline"}
            size="sm"
            onClick={() => setRegionFilter("matching")}
          >
            Matching Regions Only
          </Button>
        </div>
      </div>

      <div className="rounded-md border max-h-[80vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-20">
              <TableRow>
                <TableHead 
                  rowSpan={3} 
                  className="sticky left-0 bg-background z-30 border-r w-[120px] min-w-[120px]"
                >
                  <div className="h-full flex flex-col justify-between">
                    <div className="p-1 text-xs text-muted-foreground text-right">Database Region →</div>
                    <div className="p-1 text-xs text-muted-foreground">Function Region ↓ </div>
                  </div>
                </TableHead>
                <TableHead
                  colSpan={sortedRegionGroups.length * (queryType === "both" ? 2 : 1)}
                  className="text-center border-b bg-muted py-2"
                >
                  <span className="font-bold text-lg">Neon Serverless Postgres</span>
                </TableHead>
              </TableRow>
              <TableRow>
                {sortedRegionGroups.map((group, groupIndex) => (
                  <TableHead 
                    key={`${group.regionLabel}-${group.connectionMethod}`} 
                    colSpan={queryType === "both" ? 2 : 1}
                    className={cn(
                      "text-center border-b bg-background",
                      groupIndex !== 0 && "border-l-2 border-l-muted"
                    )}
                    style={{ 
                      width: queryType === "both" ? '400px' : '200px',
                      minWidth: queryType === "both" ? '400px' : '200px'
                    }}
                  >
                    <div className="font-medium break-words text-sm">
                      {group.regionLabel}
                      <div className="font-normal text-xs text-muted-foreground mt-1 break-all">
                        {group.regionCode} via<br />@neondatabase/serverless {group.connectionMethod === 'http' ? 'http' : 'websocket'}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {sortedRegionGroups.flatMap((group) => {
                  const cells = [];
                  if (queryType === "both" || queryType === "cold") {
                    cells.push(
                      <TableHead 
                        key={`${group.regionLabel}-${group.connectionMethod}-cold`} 
                        className="text-center font-medium text-sm bg-background px-2 w-full min-w-[200px]"
                      >
                        Cold
                      </TableHead>
                    );
                  }
                  if (queryType === "both" || queryType === "hot") {
                    cells.push(
                      <TableHead 
                        key={`${group.regionLabel}-${group.connectionMethod}-hot`} 
                        className="text-center font-medium text-sm bg-background px-2 w-full min-w-[200px]"
                      >
                        Hot
                      </TableHead>
                    );
                  }
                  return cells;
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Vercel Serverless section header */}
              <TableRow className="bg-muted">
                <TableCell 
                  colSpan={1 + (sortedRegionGroups.length * (queryType === "both" ? 2 : 1))} 
                  className="left-0 bg-muted z-30"
                >
                  <span className="font-bold text-lg">Vercel Serverless</span>
                  {regionFilter === "matching" && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Showing only regions matching selected databases)
                    </span>
                  )}
                </TableCell>
              </TableRow>
              {getFilteredFunctions().map((fn) => (
                <TableRow key={fn.id}>
                  <TableCell 
                    className="sticky left-0 bg-background z-30 border-r"
                  >
                    <div className="font-normal text-xs">{fn.regionLabel.split(' - ')[0]}</div>
                    <div className="text-xs text-muted-foreground">
                      {fn.regionLabel.split(' - ').slice(1).join(' - ')}
                    </div>
                  </TableCell>
                  {sortedRegionGroups.flatMap((group, groupIndex) => {
                    const isSameRegionMatch = isExactSameRegion(group, fn)
                    const cells = [];
                    if (queryType === "both" || queryType === "cold") {
                      cells.push(
                        <TableCell
                          key={`${fn.id}-${group.regionLabel}-${group.connectionMethod}-cold`}
                          className={cn(
                            "text-center w-full min-w-[200px]", 
                            isSameRegionMatch && "bg-green-50",
                            groupIndex !== 0 && "border-l-2 border-l-muted"
                          )}
                        >
                          {formatLatency(getRegionGroupLatency(fn.id, group, "cold"), "cold")}
                        </TableCell>
                      );
                    }
                    if (queryType === "both" || queryType === "hot") {
                      cells.push(
                        <TableCell
                          key={`${fn.id}-${group.regionLabel}-${group.connectionMethod}-hot`}
                          className={cn(
                            "text-center w-full min-w-[200px]", 
                            isSameRegionMatch && "bg-green-50",
                            queryType === "both" && "border-l",
                            groupIndex !== 0 && queryType !== "both" && "border-l-2 border-l-muted"
                          )}
                        >
                          {formatLatency(getRegionGroupLatency(fn.id, group, "hot"), "hot")}
                        </TableCell>
                      );
                    }
                    return cells;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  )
}
