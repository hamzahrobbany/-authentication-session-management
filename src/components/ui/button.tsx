// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils" // Pastikan Anda memiliki file utils.ts ini

// Definisi varian tombol menggunakan cva (class-variance-authority)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 " +
  "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9", // Menggunakan 'size-9' untuk konsistensi dengan Shadcn
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Mendefinisikan tipe props untuk komponen Button secara eksplisit dan mengekspornya
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, // Menggabungkan semua atribut HTML button standar
    VariantProps<typeof buttonVariants> { // Menggabungkan semua varian props dari cva
  asChild?: boolean // Properti opsional untuk merender sebagai child dari komponen lain
}

// Komponen Button itu sendiri
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button" // Memilih komponen yang akan dirender: Slot jika asChild true, atau 'button' biasa

    return (
      <Comp
        data-slot="button" // Atribut data ini bisa berguna untuk styling atau seleksi CSS
        className={cn(buttonVariants({ variant, size, className }))} // Menggabungkan kelas dari varian dan kelas kustom
        ref={ref} // Meneruskan ref ke elemen DOM yang mendasarinya
        {...props} // Meneruskan semua props lainnya
      />
    )
  }
)
Button.displayName = "Button" // Memberikan nama tampilan untuk React DevTools

// Mengekspor komponen Button dan varian-variannya
export { Button, buttonVariants }
