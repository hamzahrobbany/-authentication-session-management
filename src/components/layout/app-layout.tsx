//src/components/layout/app-layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";



export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SessionProvider>
  );
}

function LayoutWithSidebar({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={session?.user ?? null} />
      <main className="flex-1 p-8 bg-muted/40">{children}</main>
    </div>
  );
}
