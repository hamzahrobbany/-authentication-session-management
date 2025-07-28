// src/components/vehicle-table.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDotsVertical, IconLayoutColumns, IconPlus, IconRefresh, IconPhotoOff } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VehicleForm } from "./vehicle-form";
import { DeleteVehicleDialog } from "./delete-vehicle-dialog";

// Enum dari Prisma Schema Anda
const VehicleTypeEnum = z.enum(["SUV", "MPV", "SEDAN", "HATCHBACK", "SPORT", "TRUCK", "MOTORCYCLE", "OTHER"]);
const TransmissionTypeEnum = z.enum(["MANUAL", "AUTOMATIC"]);
const FuelTypeEnum = z.enum(["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]);

// Skema data kendaraan yang akan ditampilkan di tabel
const vehicleSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  licensePlate: z.string(),
  rentalRate: z.number(),
  imageUrl: z.string().url().nullable(),
  description: z.string().nullable(),
  isAvailable: z.boolean(),
  type: VehicleTypeEnum,
  capacity: z.number(),
  transmissionType: TransmissionTypeEnum,
  fuelType: FuelTypeEnum,
  dailyRate: z.number(),
  lateFeePerDay: z.number(),
  city: z.string(),
  address: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  owner: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
  }).optional(),
});

export type Vehicle = z.infer<typeof vehicleSchema>;

// Definisi kolom untuk tabel kendaraan
const columns: ColumnDef<Vehicle>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-16 h-12 relative overflow-hidden rounded-md border">
        {row.original.imageUrl ? (
          <Image
            src={row.original.imageUrl}
            alt={`${row.original.make} ${row.original.model}`}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <IconPhotoOff className="h-6 w-6" />
          </div>
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "make",
    header: "Make",
    cell: ({ row }) => <div>{row.getValue("make")}</div>,
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => <div>{row.getValue("model")}</div>,
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => <div>{row.getValue("year")}</div>,
  },
  {
    accessorKey: "licensePlate",
    header: "License Plate",
    cell: ({ row }) => <div>{row.getValue("licensePlate")}</div>,
  },
  {
    accessorKey: "rentalRate",
    header: "Rental Rate",
    cell: ({ row }) => (
      <div>${(row.getValue("rentalRate") as number).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "isAvailable",
    header: "Available",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isAvailable") ? "default" : "secondary"}>
        {row.getValue("isAvailable") ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "owner.name",
    header: "Owner",
    cell: ({ row }) => <div>{row.original.owner?.name || "N/A"}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => <div>{row.getValue("capacity")}</div>,
  },
  {
    accessorKey: "transmissionType",
    header: "Trans.",
    cell: ({ row }) => <div>{row.getValue("transmissionType")}</div>,
  },
  {
    accessorKey: "fuelType",
    header: "Fuel",
    cell: ({ row }) => <div>{row.getValue("fuelType")}</div>,
  },
  {
    accessorKey: "dailyRate",
    header: "Daily Rate",
    cell: ({ row }) => <div>${(row.getValue("dailyRate") as number).toFixed(2)}</div>,
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => <div>{row.getValue("city")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("createdAt")), "PPP")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const vehicle = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(vehicle.id);
                toast.info("Vehicle ID copied to clipboard!");
              }}
            >
              Copy Vehicle ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Vehicle</DialogTitle>
                  <DialogDescription>
                    Make changes to vehicle details here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <VehicleForm
                  initialData={{
                    id: vehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    licensePlate: vehicle.licensePlate,
                    rentalRate: vehicle.rentalRate,
                    description: vehicle.description || "",
                    isAvailable: vehicle.isAvailable,
                    imageUrl: vehicle.imageUrl || "",
                    imageFile: null,
                    type: vehicle.type,
                    capacity: vehicle.capacity,
                    transmissionType: vehicle.transmissionType,
                    fuelType: vehicle.fuelType,
                    dailyRate: vehicle.dailyRate,
                    lateFeePerDay: vehicle.lateFeePerDay,
                    city: vehicle.city,
                    address: vehicle.address || "",
                  }}
                  onSuccess={() => setIsEditDialogOpen(false)}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <DropdownMenuSeparator />
            <DeleteVehicleDialog vehicleId={vehicle.id} vehicleName={`${vehicle.make} ${vehicle.model}`} onSuccess={() => { /* Handled by mutation invalidation */ }}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DeleteVehicleDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface VehicleTableProps {
  // Tidak ada props lagi karena data di-fetch di sini
}

export function VehicleTable({}: VehicleTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = React.useState(false);

  // Menggunakan useQuery untuk mengambil data kendaraan
  const { data: vehicles, isLoading, isError, error, refetch } = useQuery<Vehicle[], Error>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await fetch("/api/vehicles");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch vehicles.");
      }
      const parsedData = vehicleSchema.array().parse(await response.json());
      return parsedData;
    },
  });

  const table = useReactTable({
    data: vehicles || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by make or model..."
          value={(table.getColumn("make")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("make")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <IconLayoutColumns className="mr-2 h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Vehicle</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new vehicle to the inventory.
                </DialogDescription>
              </DialogHeader>
              <VehicleForm
                onSuccess={() => setIsAddVehicleDialogOpen(false)}
                onCancel={() => setIsAddVehicleDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading vehicles...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                  Error: {error?.message || "An unexpected error occurred."}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
