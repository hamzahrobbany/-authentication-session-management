// src/components/nav-main.tsx
"use client"

import * as React from "react"
import Link from "next/link" // <-- TAMBAHKAN IMPORT INI
import {
  IconCirclePlusFilled,
  IconLayoutDashboard,
  IconCar,
  IconListCheck,
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

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Bagian Tombol Aksi Cepat (biarkan seperti ini jika memang diinginkan sebagai tombol terpisah) */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Tambah Pesanan"
              className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 min-w-8 duration-200"
            >
              <IconCirclePlusFilled />
              <span>Tambah Pesanan</span>
            </SidebarMenuButton>
            {/* Tombol Dashboard terpisah ini mungkin redundan jika sudah ada di navigasi utama */}
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconLayoutDashboard />
              <span className="sr-only">Dashboard</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Bagian Navigasi Menu */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                {/* <-- GANTI <a> MENJADI Link --> */}
                <Link href={item.url} className="flex items-center gap-2">
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}