// src/components/vehicle-form.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { IconPhotoOff, IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Enum dari Prisma Schema Anda
const VehicleTypeEnum = z.enum(["SUV", "MPV", "SEDAN", "HATCHBACK", "SPORT", "TRUCK", "MOTORCYCLE", "OTHER"]);
const TransmissionTypeEnum = z.enum(["MANUAL", "AUTOMATIC"]);
const FuelTypeEnum = z.enum(["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]);

// Skema validasi menggunakan Zod, disesuaikan dengan skema Prisma terbaru
const vehicleFormSchema = z.object({
  id: z.string().optional(),
  make: z.string().min(2, { message: "Make must be at least 2 characters." }).max(50, { message: "Make must not be longer than 50 characters." }),
  model: z.string().min(2, { message: "Model must be at least 2 characters." }).max(50, { message: "Model must not be longer than 50 characters." }),
  year: z.coerce.number().int().min(1900, { message: "Year must be 1900 or later." }).max(new Date().getFullYear() + 1, { message: "Invalid year." }),
  licensePlate: z.string().min(4, { message: "License plate must be at least 4 characters." }).max(20, { message: "License plate must not be longer than 20 characters." }),
  rentalRate: z.coerce.number().min(0.01, { message: "Rental rate must be positive." }),
  description: z.string().optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  type: VehicleTypeEnum,
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1." }),
  transmissionType: TransmissionTypeEnum,
  fuelType: FuelTypeEnum,
  dailyRate: z.coerce.number().min(0.01, { message: "Daily rate must be positive." }),
  lateFeePerDay: z.coerce.number().min(0, { message: "Late fee cannot be negative." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  address: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal('')),
  imageFile: z.instanceof(File).optional().nullable()
}).refine(data => {
  if (!data.id && !data.imageUrl && (!data.imageFile || data.imageFile.size === 0)) {
    return false;
  }
  return true;
}, {
  message: "Vehicle image is required.",
  path: ["imageFile"],
});


type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  initialData?: VehicleFormValues;
  onSuccess: (vehicle: any) => void;
  onCancel: () => void;
}

export function VehicleForm({ initialData, onSuccess, onCancel }: VehicleFormProps) {
  const isEditMode = !!initialData?.id;
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = React.useState(0); // State untuk langkah formulir, 0-4 (total 5 langkah)

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      ...initialData,
      make: initialData?.make || "",
      model: initialData?.model || "",
      year: initialData?.year || new Date().getFullYear(),
      licensePlate: initialData?.licensePlate || "",
      rentalRate: initialData?.rentalRate || 0,
      description: initialData?.description || "",
      isAvailable: initialData?.isAvailable ?? true,
      type: initialData?.type || "SEDAN",
      capacity: initialData?.capacity || 4,
      transmissionType: initialData?.transmissionType || "AUTOMATIC",
      fuelType: initialData?.fuelType || "GASOLINE",
      dailyRate: initialData?.dailyRate || 0,
      lateFeePerDay: initialData?.lateFeePerDay || 0,
      city: initialData?.city || "",
      address: initialData?.address || "",
      imageUrl: initialData?.imageUrl || "",
      imageFile: undefined,
    },
    mode: "onChange",
  });

  const imageFileRef = form.register("imageFile");

  const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.imageUrl || null);
  const [removeExistingImage, setRemoveExistingImage] = React.useState(false);

  React.useEffect(() => {
    const file = form.watch("imageFile");
    if (file && file instanceof File && file.size > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setRemoveExistingImage(false);
      };
      reader.readAsDataURL(file);
    } else if (removeExistingImage) {
      setImagePreview(null);
    } else if (isEditMode && initialData?.imageUrl && !form.formState.dirtyFields.imageFile) {
      setImagePreview(initialData.imageUrl);
    } else if (!isEditMode && initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    }
  }, [form.watch("imageFile"), removeExistingImage, initialData?.imageUrl, isEditMode, form.formState.dirtyFields.imageFile]);


  // Mutasi untuk membuat kendaraan baru
  const createVehicleMutation = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      const formData = new FormData();
      formData.append("make", values.make);
      formData.append("model", values.model);
      formData.append("year", values.year.toString());
      formData.append("licensePlate", values.licensePlate);
      formData.append("rentalRate", values.rentalRate.toString());
      formData.append("description", values.description || "");
      formData.append("isAvailable", values.isAvailable.toString());
      formData.append("type", values.type);
      formData.append("capacity", values.capacity.toString());
      formData.append("transmissionType", values.transmissionType);
      formData.append("fuelType", values.fuelType);
      formData.append("dailyRate", values.dailyRate.toString());
      formData.append("lateFeePerDay", values.lateFeePerDay.toString());
      formData.append("city", values.city);
      formData.append("address", values.address || "");

      if (values.imageFile && values.imageFile.size > 0) {
        formData.append("image", values.imageFile);
      }

      const response = await fetch("/api/vehicles", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create vehicle.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Vehicle created successfully!");
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onSuccess(data);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create vehicle.");
    },
  });

  // Mutasi untuk memperbarui kendaraan
  const updateVehicleMutation = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      const formData = new FormData();
      // Hanya tambahkan field yang diubah atau yang wajib
      if (form.formState.dirtyFields.make) formData.append("make", values.make);
      if (form.formState.dirtyFields.model) formData.append("model", values.model);
      if (form.formState.dirtyFields.year) formData.append("year", values.year.toString());
      if (form.formState.dirtyFields.licensePlate) formData.append("licensePlate", values.licensePlate);
      if (form.formState.dirtyFields.rentalRate) formData.append("rentalRate", values.rentalRate.toString());
      if (form.formState.dirtyFields.description) formData.append("description", values.description || "");
      if (form.formState.dirtyFields.isAvailable) formData.append("isAvailable", values.isAvailable.toString());
      if (form.formState.dirtyFields.type) formData.append("type", values.type);
      if (form.formState.dirtyFields.capacity) formData.append("capacity", values.capacity.toString());
      if (form.formState.dirtyFields.transmissionType) formData.append("transmissionType", values.transmissionType);
      if (form.formState.dirtyFields.fuelType) formData.append("fuelType", values.fuelType);
      if (form.formState.dirtyFields.dailyRate) formData.append("dailyRate", values.dailyRate.toString());
      if (form.formState.dirtyFields.lateFeePerDay) formData.append("lateFeePerDay", values.lateFeePerDay.toString());
      if (form.formState.dirtyFields.city) formData.append("city", values.city);
      if (form.formState.dirtyFields.address) formData.append("address", values.address || "");

      if (removeExistingImage) {
        formData.append("removeExistingImage", "true");
      }
      if (values.imageFile && values.imageFile.size > 0) {
        formData.append("image", values.imageFile);
      }

      const response = await fetch(`/api/vehicles/${values.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update vehicle.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Vehicle updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onSuccess(data);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update vehicle.");
    },
  });

  const onSubmit = (values: VehicleFormValues) => {
    if (isEditMode) {
      updateVehicleMutation.mutate(values);
    } else {
      createVehicleMutation.mutate(values);
    }
  };

  const isLoading = createVehicleMutation.isPending || updateVehicleMutation.isPending;

  // Fungsi untuk navigasi antar langkah
  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await form.trigger(["make", "model", "year", "licensePlate", "rentalRate"]);
    } else if (currentStep === 1) {
      isValid = await form.trigger(["type", "capacity", "transmissionType", "fuelType"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["dailyRate", "lateFeePerDay", "isAvailable"]);
    } else if (currentStep === 3) {
      isValid = await form.trigger(["city", "address", "description"]);
    } else if (currentStep === 4) { // Last step, will be handled by submit
      isValid = await form.trigger(["imageFile"]); // Only validate image on the last step
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error("Please fill in all required fields for this step.");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const totalSteps = 5; // Total langkah formulir (0-4)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Step 1: Basic Vehicle Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Basic Vehicle Information</h3>
            <Separator />
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input placeholder="Toyota" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Camry" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2020" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl>
                    <Input placeholder="B 1234 ABC" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rentalRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rental Rate (per day)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="50.00" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 2: Detailed Vehicle Specs */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Detailed Vehicle Specifications</h3>
            <Separator />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(VehicleTypeEnum.enum).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Passengers)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transmissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transmission Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TransmissionTypeEnum.enum).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(FuelTypeEnum.enum).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 3: Pricing & Availability */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. Pricing & Availability</h3>
            <Separator />
            <FormField
              control={form.control}
              name="dailyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate (main)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="75.00" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lateFeePerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Fee Per Day</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="10.00" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAvailable"
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
                      Available for Rent
                    </FormLabel>
                    <FormDescription>
                      Check this if the vehicle is currently available for rental.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 4: Location & Description */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">4. Location & Description</h3>
            <Separator />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Jakarta" {...field} disabled={isLoading} />
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
                    <Textarea placeholder="Jl. Contoh No. 123" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A comfortable sedan for city travel." {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 5: Vehicle Image */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">5. Vehicle Image</h3>
            <Separator />
            {/* Image Upload Field */}
            <FormItem>
              <FormLabel>Vehicle Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  {...imageFileRef}
                  onChange={(e) => {
                    imageFileRef.onChange(e);
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      form.setValue("imageFile", file);
                    } else {
                      form.setValue("imageFile", null);
                    }
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Upload an image of the vehicle.</FormDescription>
              <FormMessage />
            </FormItem>

            {/* Image Preview */}
            {(imagePreview && !removeExistingImage) ? (
              <div className="relative w-full h-48 border rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Vehicle Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => {
                    setImagePreview(null);
                    setRemoveExistingImage(true);
                    form.setValue("imageFile", null);
                    if (imageFileRef.ref.current) {
                      imageFileRef.ref.current.value = "";
                    }
                  }}
                  disabled={isLoading}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="w-full h-48 border rounded-md flex items-center justify-center bg-muted text-muted-foreground">
                <IconPhotoOff className="h-12 w-12" />
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2 pt-4">
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={isLoading}>
              <IconArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}
          <div className="flex-grow" /> {/* Spacer */}
          {currentStep < totalSteps - 1 && ( // "Next" button appears until the last step
            <Button type="button" onClick={handleNext} disabled={isLoading}>
              Next <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === totalSteps - 1 && ( // "Submit" button appears only on the last step
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Vehicle" : "Create Vehicle")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
