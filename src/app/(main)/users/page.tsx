// app/(main)/users/page.tsx
import { UserTable } from "@/components/user/user-table";

// Fungsi ini akan dieksekusi di server untuk halaman ini
export default function UsersPage() {
  return (
    // Asumsikan QueryProvider sudah membungkus di layout.tsx atau di sini.
    <div className="flex flex-col items-start gap-4 p-4 lg:p-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <p className="text-muted-foreground">Manage user accounts, roles, and verification status.</p>
      <UserTable />
    </div>
  );
}
