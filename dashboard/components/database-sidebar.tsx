"use client"

import { useState, useEffect } from "react"
import { Database as DatabaseIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/schema"

interface DatabaseSidebarProps {
  databases: Database[]
  selectedDatabases: number[]
  onToggleDatabase: (dbId: number) => void
}

export function DatabaseSidebar({ databases, selectedDatabases, onToggleDatabase }: DatabaseSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Group databases by provider
  const groupedDatabases = databases.reduce(
    (acc, db) => {
      if (!acc[db.provider]) {
        acc[db.provider] = []
      }
      acc[db.provider].push(db)
      return acc
    },
    {} as Record<string, Database[]>,
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-50 h-full border-r bg-background transition-all duration-300 md:relative md:z-0",
          isOpen ? "w-72" : "w-0 md:w-16 overflow-hidden",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className={cn("flex items-center gap-2", !isOpen && "md:hidden")}>
            <DatabaseIcon className="h-5 w-5" />
            <span className="font-semibold">Target Databases</span>
          </div>
          {/* Toggle button to close sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(!isOpen && "hidden md:hidden")}
            onClick={() => setIsOpen(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          {/* Toggle button to open sidebar - visible when collapsed on desktop */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(isOpen && "hidden", "md:flex")}
            onClick={() => setIsOpen(true)}
          >
            <DatabaseIcon className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4">
            <div className={cn("mb-4", !isOpen && "md:hidden")}>
              <Badge variant="outline" className="mb-2">
                {selectedDatabases.length} selected
              </Badge>
              <p className="text-sm text-muted-foreground">Select databases to compare their performance</p>
            </div>

            {Object.entries(groupedDatabases).map(([provider, dbs]) => (
              <div key={provider} className="mb-6">
                <h3 className={cn("mb-2 text-sm font-medium text-muted-foreground", !isOpen && "md:hidden")}>
                  {provider}
                </h3>
                <div className="space-y-1">
                  {dbs.map((db) => (
                    <div
                      key={db.id}
                      className={cn(
                        "flex items-center space-x-2 rounded-md px-2 py-2 hover:bg-accent",
                        selectedDatabases.includes(db.id) && "bg-accent/50",
                      )}
                    >
                      <Checkbox
                        id={db.id.toString()}
                        checked={selectedDatabases.includes(db.id)}
                        onCheckedChange={() => onToggleDatabase(db.id)}
                      />
                      <div className={cn("flex-1", !isOpen && "md:hidden")}>
                        <label htmlFor={db.id.toString()} className="flex flex-col cursor-pointer">
                          <span className="text-sm font-medium">{db.name}</span>
                          <span className="text-xs text-muted-foreground">{db.regionLabel}</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Toggle button for mobile */}
      <Button
        variant="outline"
        size="icon"
        className={cn("fixed left-4 top-4 z-40 md:hidden", isOpen && "hidden")}
        onClick={() => setIsOpen(true)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  )
}
