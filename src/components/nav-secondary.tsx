// src/components/nav-secondary.tsx
"use client";

import * as React from "react";
import type { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Mengimpor usePathname

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Mendefinisikan tipe untuk setiap item navigasi
type NavItem = {
  title: string;
  url: string;
  icon: Icon;
  onClick?: () => void;
};

// Mendefinisikan interface props untuk komponen NavSecondary
interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: NavItem[];
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const pathname = usePathname(); // Mendapatkan path URL saat ini

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // Menentukan apakah item navigasi ini adalah rute aktif
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  // Menambahkan kelas 'active' jika rute aktif
                  className={isActive ? "bg-accent text-accent-foreground" : ""}
                >
                  <Link
                    href={item.url}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                    className="flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <item.icon className="size-4" />
                    <span className="text-sm">{item.title}</span>
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
