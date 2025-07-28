// src/components/delete-vehicle-dialog.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteVehicleDialogProps {
  vehicleId: string;
  vehicleName: string; // Misalnya: "Toyota Camry"
  onSuccess: () => void; // Callback setelah sukses hapus
  children: React.ReactNode; // Trigger button
}

export function DeleteVehicleDialog({ vehicleId, vehicleName, onSuccess, children }: DeleteVehicleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Definisi mutasi untuk menghapus kendaraan
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete vehicle.");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(`Vehicle "${vehicleName}" deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] }); // Invalidate cache 'vehicles' untuk refetch
      onSuccess();
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete vehicle.");
    },
  });

  const handleDelete = () => {
    deleteVehicleMutation.mutate(vehicleId);
  };

  const isDeleting = deleteVehicleMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete vehicle "
            <span className="font-semibold text-foreground">{vehicleName}</span>"
            and its associated image from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
