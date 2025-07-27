// src/components/nav-documents.tsx
"use client"

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react"
import { toast } from "sonner" // Mengimpor toast untuk notifikasi

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Mendefinisikan tipe props untuk komponen NavDocuments
type NavDocumentsProps = {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
};

export function NavDocuments({ items }: NavDocumentsProps) {
  // Menggunakan hook useSidebar untuk mendapatkan status mobile
  const { isMobile } = useSidebar();

  // Fungsi placeholder untuk aksi "Open"
  const handleOpen = async (itemName: string, itemUrl: string) => {
    // Di sini Anda bisa menambahkan logika navigasi atau membuka modal
    // Contoh: router.push(itemUrl);
    // Atau, jika ini membuka dokumen di viewer internal:
    // openDocumentViewer(itemUrl);
    console.log(`Opening document: ${itemName} at ${itemUrl}`);
    toast.info(`Opening ${itemName}...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success(`${itemName} opened successfully.`);
  };

  // Fungsi placeholder untuk aksi "Share"
  const handleShare = async (itemName: string) => {
    console.log(`Sharing document: ${itemName}`);
    toast.info(`Preparing to share ${itemName}...`);
    // Di sini Anda bisa menambahkan logika untuk berbagi dokumen (misal: membuka modal berbagi)
    // Contoh: showShareModal(itemName);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`${itemName} shared successfully.`);
  };

  // Fungsi placeholder untuk aksi "Delete"
  const handleDelete = async (itemName: string, itemId: string | number) => {
    console.log(`Deleting document: ${itemName} (ID: ${itemId})`);
    // Di sini Anda bisa menambahkan logika untuk konfirmasi penghapusan dan proses penghapusan
    // Contoh: const confirmed = await showConfirmationDialog(`Are you sure you want to delete ${itemName}?`);
    // if (confirmed) {
    toast.promise(
      new Promise((resolve, reject) => {
        // Simulate API call for deletion
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate for demo
          if (success) {
            resolve(`${itemName} deleted successfully.`);
          } else {
            reject(`Failed to delete ${itemName}.`);
          }
        }, 1500);
      }),
      {
        loading: `Deleting ${itemName}...`,
        success: (message) => message,
        error: (error) => error,
      }
    );
    // }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleOpen(item.name, item.url)}>
                  <IconFolder className="mr-2 h-4 w-4" />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare(item.name)}>
                  <IconShare3 className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => handleDelete(item.name, item.name)}> {/* Menggunakan item.name sebagai ID sementara */}
                  <IconTrash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton>
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
