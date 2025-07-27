// src/components/nav-main.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation" // Mengimpor usePathname untuk deteksi rute aktif
import {
  IconCirclePlusFilled,
  type Icon,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Mendefinisikan tipe props untuk komponen NavMain
type NavMainProps = {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
};

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname(); // Mendapatkan path URL saat ini

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Bagian Tombol Aksi Cepat: "Tambah Pesanan" */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Tambah Pesanan Baru"
              className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 min-w-8 duration-200"
              asChild
            >
              <Link href="/orders/create">
                <IconCirclePlusFilled />
                <span>Tambah Pesanan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Bagian Navigasi Menu Utama */}
        <SidebarMenu>
          {items.map((item) => {
            // Menentukan apakah item navigasi ini adalah rute aktif
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  // Menambahkan kelas 'active' jika rute aktif
                  className={isActive ? "bg-accent text-accent-foreground" : ""}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
