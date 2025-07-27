// src/components/user/user-form.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Skema validasi menggunakan Zod
const userFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not be longer than 50 characters." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
  role: z.enum(["CUSTOMER", "OWNER", "ADMIN"], { message: "Invalid role." }),
  phoneNumber: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  isVerifiedByAdmin: z.boolean().default(false).optional(),
}).refine(data => {
  // Validasi kustom: password wajib jika bukan mode edit
  if (!data.id && !data.password) {
    return false;
  }
  return true;
}, {
  message: "Password is required for new users.",
  path: ["password"],
});


type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: UserFormValues;
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSuccess, onCancel }: UserFormProps) {
  const isEditMode = !!initialData?.id;
  const queryClient = useQueryClient();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      role: "CUSTOMER",
      phoneNumber: "",
      address: "",
      isVerifiedByAdmin: false,
    },
    mode: "onChange",
  });

  // Definisi mutasi untuk membuat pengguna
  const createUserMutation = useMutation({
    mutationFn: async (newUser: UserFormValues) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("User created successfully!");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess(data); // Panggil callback sukses untuk menutup dialog
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user.");
    },
  });

  // Definisi mutasi untuk memperbarui pengguna
  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: UserFormValues) => {
      const { id, password, ...updateValues } = updatedUser;
      const payload = password && password.length > 0 ? updatedUser : updateValues;

      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess(data); // Panggil callback sukses untuk menutup dialog
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user.");
    },
  });

  const onSubmit = (values: UserFormValues) => {
    if (isEditMode) {
      updateUserMutation.mutate(values);
    } else {
      createUserMutation.mutate(values);
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                  {...field}
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              {isEditMode && <FormDescription>Leave blank to keep current password.</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+6281234567890" {...field} value={field.value || ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Jl. Contoh No. 123" {...field} value={field.value || ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isVerifiedByAdmin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Verified by Admin
                </FormLabel>
                <FormDescription>
                  Check this if the user has been verified by an admin.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update User" : "Create User")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
