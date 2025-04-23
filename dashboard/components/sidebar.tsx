"use client"

import { useState } from "react"
import { Database } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarProvider,
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Mock database options
const databases = [
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
]

export function Sidebar() {
  const [selectedDbs, setSelectedDbs] = useState(databases.filter((db) => db.selected).map((db) => db.id))

  const toggleDatabase = (dbId: string) => {
    setSelectedDbs((prev) => (prev.includes(dbId) ? prev.filter((id) => id !== dbId) : [...prev, dbId]))
  }

  return (
    <SidebarProvider>
      <SidebarComponent>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 px-4 py-2">
            <Database className="h-5 w-5" />
            <span className="font-semibold">DB Benchmark</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="px-4 py-2">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Target Databases</h3>
            <SidebarMenu>
              {databases.map((db) => (
                <SidebarMenuItem key={db.id}>
                  <SidebarMenuButton
                    onClick={() => toggleDatabase(db.id)}
                    className={cn(
                      "flex items-center gap-2",
                      selectedDbs.includes(db.id) && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span>{db.name}</span>
                      <span className="text-xs text-muted-foreground">{db.region}</span>
                    </div>
                    <div className="ml-auto">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full",
                          selectedDbs.includes(db.id) ? "bg-green-500" : "bg-gray-300",
                        )}
                      />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
        </SidebarFooter>
      </SidebarComponent>
      <div className="flex-1 overflow-auto">
        <div className="flex h-16 items-center border-b px-4">
          <SidebarTrigger />
          <h1 className="ml-4 text-xl font-semibold">Database Latency Dashboard</h1>
        </div>
      </div>
    </SidebarProvider>
  )
}
