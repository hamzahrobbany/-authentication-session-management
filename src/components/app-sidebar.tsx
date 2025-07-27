// src/components/app-sidebar.tsx
"use client"

import * as React from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import {
  IconDashboard,
  IconCar,
  IconUser,
  IconReceipt,
  IconSettings,
  IconHelp,
  IconSearch,
  IconLogout,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menentukan tipe props untuk komponen AppSidebar
type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  // Mengambil data sesi dan status dari NextAuth.js
  const { data: session, status } = useSession();
  const router = useRouter();

  // Menentukan role pengguna dari sesi, default ke "guest" jika tidak ada sesi atau role
  const role = session?.profile?.role?.toLowerCase() || "guest";

  // Fungsi untuk menangani proses logout
  const handleLogoutClick = async () => {
    // Memanggil signOut dari NextAuth.js tanpa redirect otomatis
    await signOut({
      redirect: false, // Penting: Mencegah NextAuth melakukan redirect server-side
    });
    // Melakukan redirect manual ke halaman login di sisi client
    router.push("/login"); // Penting: Memaksa navigasi client-side
  };

  // Data navigasi untuk sidebar
  // Data pengguna sekarang diambil secara dinamis dari sesi
  const data = {
    user: {
      name: session?.user?.name || "Guest", // Mengambil nama dari sesi
      email: session?.user?.email || "guest@example.com", // Mengambil email dari sesi
      avatar: session?.user?.image || "/avatars/default-user.png", // Mengambil avatar dari sesi, dengan fallback
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: IconDashboard,
        allowedRoles: ["admin", "owner", "customer"],
      },
      {
        title: "Vehicles",
        url: "/vehicles",
        icon: IconCar,
        allowedRoles: ["admin", "owner"],
      },
      {
        title: "Orders",
        url: "/orders",
        icon: IconReceipt,
        allowedRoles: ["admin", "customer"],
      },
      {
        title: "Users",
        url: "/users",
        icon: IconUser,
        allowedRoles: ["admin", "owner"],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: IconSettings,
        allowedRoles: ["admin", "owner", "customer"],
      },
      {
        title: "Search",
        url: "/search",
        icon: IconSearch,
        allowedRoles: ["admin", "owner", "customer"],
      },
      {
        title: "Help",
        url: "/help",
        icon: IconHelp,
        allowedRoles: ["admin", "owner", "customer"],
      },
      {
        title: "Logout",
        url: "#",
        icon: IconLogout,
        onClick: handleLogoutClick, // Menugaskan fungsi logout ke item ini
        allowedRoles: ["admin", "owner", "customer"], // Semua role bisa logout
      },
    ],
  };

  // Memfilter item navigasi berdasarkan role pengguna
  const filteredNavMain = data.navMain.filter(item =>
    item.allowedRoles.includes(role)
  );

  const filteredNavSecondary = data.navSecondary.filter(item =>
    item.allowedRoles.includes(role)
  );

  // Menampilkan komponen Sidebar
  // Jika sesi sedang dimuat, tampilkan skeleton loader
  if (status === "loading") {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <a href="/">
                  <IconDashboard className="!size-5" />
                  <span className="text-base font-semibold">Loading...</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* Skeleton loader untuk NavMain */}
          <div className="flex flex-col gap-2 p-4">
            <div className="h-8 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
          </div>
          {/* Skeleton loader untuk NavSecondary */}
          <div className="flex flex-col gap-2 p-4 mt-auto">
            <div className="h-8 bg-gray-200 rounded-md animate-pulse w-2/3"></div>
            <div className="h-8 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          {/* Skeleton loader untuk NavUser */}
          <div className="flex items-center gap-2 p-4">
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="flex-1 grid gap-1">
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <IconDashboard className="!size-5" />
                <span className="text-base font-semibold">RentalKendaraan</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary
          items={filteredNavSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
