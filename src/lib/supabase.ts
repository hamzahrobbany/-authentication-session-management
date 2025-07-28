// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Mengambil variabel lingkungan dari .env.local
// NEXT_PUBLIC_SUPABASE_URL: Ini adalah URL proyek Supabase Anda.
// SUPABASE_SERVICE_ROLE_KEY: Ini adalah kunci rahasia yang memiliki izin penuh di Supabase Anda (Service Role Key).
//                        Penting: JANGAN PERNAH MENGEKSPOS KUNCI INI DI SISI KLIEN (frontend).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Memastikan bahwa variabel lingkungan telah dimuat.
// Jika salah satu dari ini undefined, ini akan menyebabkan masalah.
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
}
if (!supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

// Membuat instance Supabase Client dengan Service Role Key.
// Client ini akan digunakan di Next.js API Routes untuk interaksi server-side.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
