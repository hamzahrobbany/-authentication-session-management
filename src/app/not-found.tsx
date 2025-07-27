// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Menggunakan komponen Button dari shadcn/ui

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground text-center p-4">
      <h1 className="text-9xl font-bold text-primary-foreground">404</h1>
      <h2 className="mt-4 text-3xl font-semibold">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Maaf, halaman yang Anda cari tidak ada. Mungkin Anda salah mengetik alamat atau halaman telah dipindahkan.
      </p>
      <Link href="/" passHref className="mt-8">
        <Button size="lg">Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}