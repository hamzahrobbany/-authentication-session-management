// app/(main)/vehicles/page.tsx
import { VehicleTable } from "@/components/vehicle/vehicle-table";

export default function VehiclesPage() {
  return (
    <div className="flex flex-col items-start gap-4 p-4 lg:p-6">
      <h1 className="text-2xl font-bold">Vehicle Management</h1>
      <p className="text-muted-foreground">Manage your fleet of rental vehicles, including details and images.</p>
      <VehicleTable />
    </div>
  );
}
