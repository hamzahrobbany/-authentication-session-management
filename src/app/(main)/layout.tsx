// app/(main)/layout.tsx
"use client"; // Ini harus menjadi client component karena menggunakan SidebarProvider, AppSidebar, dll.

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/providers/query-provider"; // <-- TAMBAHKAN IMPORT INI

// Layout untuk semua halaman di bawah route group (main)
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // SessionProvider harus membungkus seluruh aplikasi yang membutuhkan sesi
    <SessionProvider>
      {/* QueryProvider harus membungkus komponen yang menggunakan TanStack Query */}
      <QueryProvider>
        <SidebarProvider
          style={
            {
              // Variabel CSS kustom untuk lebar sidebar dan tinggi header
              "--sidebar-width": "calc(var(--spacing) * 72)", // Contoh: 72 * 4px = 288px
              "--header-height": "calc(var(--spacing) * 12)", // Contoh: 12 * 4px = 48px
            } as React.CSSProperties // Type assertion untuk CSSProperties
          }
        >
          {/* AppSidebar Anda, bisa memiliki varian 'inset' atau 'offcanvas' */}
          <AppSidebar variant="inset" />{" "}
          {/* Sidebar aplikasi Anda */}
          <SidebarInset>
            <div className="flex flex-1 flex-col"> {/* Gunakan flex-1 untuk mengisi sisa ruang vertikal */}
              <SiteHeader /> {/* Header situs Anda */}
              <main className="flex flex-1 flex-col overflow-hidden">
                {/* Konten halaman spesifik akan di-render di sini */}
                {children}
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
