'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

type Props = { token: string | null };

export default function PasienFormClient({ token }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const backend = process.env.BACKEND_URL;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const namaPasien = String(form.get('namaPasien') ?? '').trim();
    const nohp = String(form.get('nohp') ?? '').trim();

    if (!namaPasien || !nohp) {
      setError('Nama pasien dan nomor HP wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backend}/pasiens`, {
        method: 'POST',
        credentials: 'include', // tetap boleh untuk cookie-based session
        headers: {
          'content-type': 'application/json',
          // ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ namaPasien, nohp }), // sesuaikan field backend (namaPasien)
      });

      if (res.ok) {
        router.push('/dashboard/pasien'); // samakan route kamu
        return;
      }

      let message = 'Gagal menyimpan data.';
      try {
        const data = await res.json();
        message = data?.message ?? message;
      } catch {}
        setError(message);
      } catch {
        setError('Gagal menghubungi server.');
      } finally {
        setLoading(false);
      }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Daftarkan Pasien</h1>
          <p className="mt-1 text-sm text-slate-400">Isi data pasien.</p>
        </div>

        <Link
          href="/dashboard/pasien"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {!token && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Token tidak ditemukan di cookie. Jika kamu pakai httpOnly cookie, ini normal (client tidak bisa baca).
              Jika backend butuh Bearer token, pastikan cookie tersedia di server dan namanya benar.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="namaPasien">
              Nama Pasien
            </label>
            <input
              id="namaPasien"
              name="namaPasien"
              type="text"
              required
              placeholder="Contoh: Andi Wijaya"
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-white/20 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="nohp">
              No. Handphone
            </label>
            <input
              id="nohp"
              name="nohp"
              type="text"
              required
              placeholder="Contoh: 081120006500"
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-white/20 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/pasien"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-blue-600/80 px-4 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
