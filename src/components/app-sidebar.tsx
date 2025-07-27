// src/components/app-sidebar.tsx
"use client"

import * as React from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation" // <-- Pastikan ini ada

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

// Import ini sudah BENAR dan TIDAK PERLU DIUBAH
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
type SidebarProps = {
  session: any; // atau sesuaikan dengan tipe `Session`
};

export function AppSidebar({  ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession();
  const router = useRouter(); // <-- INISIALISASI useRouter
 
  const role = session?.profile?.role.toLowerCase() || "guest";
  console.log('role : ',role)
  // Fungsi logout yang akan ditugaskan ke item navSecondary
  const handleLogoutClick = async () => {
    // 1. Panggil signOut, tapi nonaktifkan redirect otomatis NextAuth
    await signOut({
      redirect: false, // PENTING: Mencegah NextAuth melakukan redirect server-side otomatis
    });
    // 2. Lakukan redirect secara manual di sisi client ke halaman login
    router.push("/login"); // PENTING: Memaksa navigasi client-side ke halaman login
  };

  // Data navigasi (sekarang bisa menggunakan handleLogoutClick)
  const data = {
    user: {
      name: "Admin",
      email: "admin@example.com",
      avatar: "/avatars/admin.png",
       // <-- Tambahkan role yang sesuai
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/", // <-- Ganti ke "/" jika dashboard utama ada di root (URL: http://localhost:3000/)
        icon: IconDashboard,
        allowedRoles: ["admin", "owner"],
      },
      {
        title: "Vehicles",
        url: "/vehicles", // <-- Asumsi rute utama (misal: app/(main)/vehicles/page.tsx)
        icon: IconCar,
        allowedRoles: ["admin", "owner"],
      },
      {
        title: "Orders",
        url: "/orders", // <-- Asumsi rute utama (misal: app/(main)/orders/page.tsx)
        icon: IconReceipt,
        allowedRoles: ["admin", "customer"],
      },
      {
        title: "Users",
        url: "/users", // <-- Asumsi rute utama (misal: app/(main)/users/page.tsx)
        icon: IconUser,
        allowedRoles: ["admin", "owner"],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings", // <-- Asumsi rute utama
        icon: IconSettings,
        allowedRoles: ["admin",  "owner"],
      },
      {
        title: "Search",
        url: "/search", // <-- Asumsi rute utama
        icon: IconSearch,
        allowedRoles: ["admin",  "owner"],
      },
      {
        title: "Help",
        url: "/help", // <-- Asumsi rute utama
        icon: IconHelp,
        allowedRoles: ["admin",  "owner"],
      },
      {
        title: "Logout",
        url: "#", // Tetap "#" karena kita akan menangani navigasi secara manual dengan onClick
        icon: IconLogout,
        onClick: handleLogoutClick,
        allowedRoles: ["admin",  "owner"], // <-- LANGSUNG TUGASKAN FUNGSI handleLogoutClick KE onClick
      },
    ],
  };

   const filteredNavMain = data.navMain.filter(item =>
    item.allowedRoles.includes(role)
  );

  const filteredNavSecondary = data.navSecondary.filter(item =>
    item.allowedRoles.includes(role)
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/"> {/* <-- Pastikan ini mengarah ke root path jika dashboard ada di root */}
                <IconDashboard className="!size-5" />
                <span className="text-base font-semibold">RentalKendaraan</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} /> {/* <-- Impor ini sudah BENAR */}
        <NavSecondary
          items={filteredNavSecondary} // <-- Meneruskan data.navSecondary yang sudah memiliki onClick
          className="mt-auto"
          // Prop `onItemClick` tidak lagi diperlukan di sini karena NavSecondary
          // sudah membaca `onClick` langsung dari `item`
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}