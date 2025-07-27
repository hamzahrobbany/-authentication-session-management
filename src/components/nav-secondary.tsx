// src/components/nav-secondary.tsx (REVISED)
"use client";

import * as React from "react";
import type { Icon } from "@tabler/icons-react";
import Link from "next/link"; // <-- TAMBAHKAN IMPORT INI

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: Icon;
  onClick?: () => void; // optional handler for logout or custom logic
};

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: NavItem[];
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link // <-- GANTI DARI <a> MENJADI Link
                  href={item.url}
                  onClick={(e) => {
                    // Logika ini sudah benar: jika ada onClick, jalankan dan cegah default link behavior
                    if (item.onClick) {
                      e.preventDefault(); // prevent default Link behavior if custom handler exists
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
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}