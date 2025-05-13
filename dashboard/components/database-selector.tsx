"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DatabaseInfo {
  id: number;
  name: string;
  provider: string;
  regionCode: string;
  regionLabel: string;
  region: string;
}

interface DatabaseSelectorProps {
  databases: DatabaseInfo[];
  selectedDatabases: number[];
  onDatabaseSelect: (databases: number[]) => void;
}

export function DatabaseSelector({
  databases,
  selectedDatabases,
  onDatabaseSelect,
}: DatabaseSelectorProps) {
  const toggleDatabase = (dbId: number) => {
    onDatabaseSelect(
      selectedDatabases.includes(dbId)
        ? selectedDatabases.filter((id) => id !== dbId)
        : [...selectedDatabases, dbId],
    );
  };

  return (
    <div className="space-y-4">
      <Label>Select Databases to Compare</Label>
      <div className="flex flex-wrap gap-4">
        {databases.map((db) => (
          <div key={db.id} className="flex items-center space-x-2">
            <Checkbox
              id={`db-${db.id}`}
              checked={selectedDatabases.includes(db.id)}
              onCheckedChange={() => toggleDatabase(db.id)}
            />
            <Label htmlFor={`db-${db.id}`} className="text-sm font-normal">
              {db.name} ({db.region})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
