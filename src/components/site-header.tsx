// src/components/site-header.tsx
"use client"

import * as React from "react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  // Mengambil data sesi dan status dari NextAuth.js
  const { data: session, status } = useSession();

  // Menentukan nama pengguna yang akan ditampilkan
  // Jika sesi sedang loading, tampilkan "Loading..."
  // Jika ada sesi dan nama pengguna, tampilkan nama pengguna
  // Jika tidak ada sesi atau nama, tampilkan "Guest"
  const userName = status === "loading"
    ? "Loading..."
    : session?.user?.name || "Guest";

  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Tombol untuk membuka/menutup sidebar */}
        <SidebarTrigger className="-ml-1" />
        {/* Separator vertikal */}
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {/* Judul Dashboard */}
        <h1 className="text-base font-medium text-muted-foreground">
          Rental Dashboard
        </h1>
        {/* Bagian kanan header */}
        <div className="ml-auto flex items-center gap-2">
          {/* Tombol selamat datang dengan nama pengguna dinamis */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex text-muted-foreground"
            disabled={status === "loading"} // Nonaktifkan tombol saat loading
          >
            Selamat datang, {userName}
          </Button>
          {/* Anda bisa menambahkan elemen lain di sini, seperti notifikasi atau tombol profil */}
        </div>
      </div>
    </header>
  );
}
