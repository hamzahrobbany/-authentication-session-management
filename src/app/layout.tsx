// app/layout.tsx (REVISED)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
// Hapus import AppLayout dan SidebarProvider dari sini
// import { AppLayout } from "@/components/layout/app-layout";
// import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rental Kendaraan",
  description: "Aplikasi Rental Kendaraan",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Hapus SidebarProvider dan AppLayout dari sini */}
        {/* <SidebarProvider> */}
        {/* <AppLayout>{children}</AppLayout> */}
        {/* </SidebarProvider> */}
        {children} {/* children sekarang akan merender layout atau halaman turunan langsung */}
      </body>
    </html>
  );
}