'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const inputpass = String(form.get('password') ?? '');
    

    try {
      const response = await fetch(`api/auth/login`, {
        credentials: "include",
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email, inputpass: inputpass }),
      });

      if (response.ok) {
        router.push('/dashboard/pasien');
        return;
      }

      const data = await response.json().catch(() => null);
      
      setError(data?.message ?? 'Login gagal. Cek email/password.');
    } catch {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 to-gray-900 text-slate-100">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.30),transparent_60%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.20),transparent_60%)] blur-2xl"
      />

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Reservasi Dokter Gigi</h1>
          <p className="mt-2 text-sm text-slate-400">
            Masuk untuk mengelola jadwal reservasi pasien.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
          <h2 className="text-base font-semibold">Login</h2>

          <form className="mt-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Masukkan email"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-white/20 focus:ring-4 focus:ring-blue-400/20"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-white/20 focus:ring-4 focus:ring-blue-400/20"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 active:translate-y-[1px] disabled:opacity-60"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>

              <div className="h-px w-full bg-white/10" />

              <p className="text-center text-xs text-slate-400">
                © 2026 Klinik Gigi
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
