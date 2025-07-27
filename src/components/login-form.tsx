// src/app/ui/auth-forms/login-form.tsx (updated)
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset error message on new submission attempt
    setError("");
setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Email atau kata sandi tidak valid."); // Pesan error lebih user-friendly
    } else {
      setLoading(false);
      router.push("/dashboard");
    }
  };

  return (
    // Mengatur lebar card dan menambahkan padding/margin di div luar
    <div className={cn("w-full max-w-sm mx-auto flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">Selamat Datang Kembali!</CardTitle> {/* Judul lebih besar dan berwarna */}
          <CardDescription className="text-muted-foreground">
            Masuk dengan akun Google Anda atau lanjutkan dengan email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <Button
                // Menggunakan variant 'secondary' atau custom warna untuk tombol Google
                // Tambahkan warna ikon dan teks
                variant="outline"
                className="w-full text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700"
                type="button"
                onClick={() => signIn("google")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-4 w-4 text-blue-500" // Warna ikon Google
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login dengan Google
              </Button>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Atau lanjutkan dengan email
                </span>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline underline-offset-4" // Warna link lupa password
                    >
                      Lupa Kata Sandi?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"> {/* Tombol Login utama */}
                 {loading ? "Memuat..." : "Masuk"}
                </Button>
              </div>

              <div className="text-center text-sm">
                Belum punya akun?{" "}
                <a href="/register" className="text-blue-600 dark:text-blue-400 underline underline-offset-4"> {/* Warna link daftar */}
                  Daftar sekarang
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Dengan mengklik lanjutkan, Anda menyetujui{" "}
        <a href="#" className="text-blue-600 dark:text-blue-400">Ketentuan Layanan</a> dan{" "}
        <a href="#" className="text-blue-600 dark:text-blue-400">Kebijakan Privasi</a> kami.
      </div>
    </div>
  );
}