// src/components/delete-user-dialog.tsx
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

interface DeleteUserDialogProps {
  userId: string;
  userName: string;
  onSuccess: () => void; // Callback setelah sukses hapus
  children: React.ReactNode; // Trigger button
}

export function DeleteUserDialog({ userId, userName, onSuccess, children }: DeleteUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Definisi mutasi untuk menghapus pengguna
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user.");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(`User "${userName}" deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate cache 'users' untuk refetch
      onSuccess();
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user.");
    },
  });

  const handleDelete = () => {
    deleteUserMutation.mutate(userId);
  };

  const isDeleting = deleteUserMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete user "
            <span className="font-semibold text-foreground">{userName}</span>"
            and remove their data from our servers.
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
