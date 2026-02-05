'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

type Props = { token: string | null };

type Status = 'Booked' | 'Finished' | 'Cancelled';

type PasienOption = {
  id: number;
  namaPasien: string;
};

function toISOFromDatetimeLocal(value: string) {
  // value contoh: "2026-02-03T14:30"
  // new Date(value) akan dianggap waktu lokal, lalu toISOString() jadi UTC.
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function ReservasiFormClient({ token }: Props) {
  const router = useRouter();
  const backend = process.env.BACKEND_URL;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // pasien dropdown
  const [pasiens, setPasiens] = useState<PasienOption[]>([]);
  const [pasiensLoading, setPasiensLoading] = useState(false);
  const [pasiensError, setPasiensError] = useState<string | null>(null);

  // form state (lebih enak untuk datetime-local & select)
  const [pasienId, setPasienId] = useState<string>('');
  const [startAt, setStartAt] = useState<string>('');
  const [finishAt, setFinishAt] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<Status>('Booked');

  const authHeaders = useMemo(
    () => ({
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  useEffect(() => {
    if (!backend) {
      setPasiensError('BACKEND_URL belum diset.');
      return;
    }

    let cancelled = false;

    (async () => {
      setPasiensLoading(true);
      setPasiensError(null);

      try {
        const res = await fetch(`${backend}/pasiens`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            ...authHeaders,
          },
        });

        if (!res.ok) {
          let msg = 'Gagal memuat daftar pasien.';
          try {
            const data = await res.json();
            msg = data?.message ?? msg;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();

        // Minimal mapping: pastikan backend mengembalikan id & namaPasien
        const mapped: PasienOption[] = (Array.isArray(data) ? data : [])
          .map((p) => ({
            id: Number(p?.id),
            namaPasien: String(p?.namaPasien ?? ''),
          }))
          .filter((p) => Number.isFinite(p.id) && p.id > 0 && p.namaPasien.length > 0);

        if (!cancelled) setPasiens(mapped);
      } catch {
        if (!cancelled) setPasiensError('Gagal memuat daftar pasien.');
      } finally {
        if (!cancelled) setPasiensLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [backend, authHeaders]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!backend) {
      setError('BACKEND_URL belum diset.');
      return;
    }

    const pasienIdNum = Number(pasienId);
    if (!Number.isFinite(pasienIdNum) || pasienIdNum <= 0) {
      setError('Pasien wajib dipilih.');
      return;
    }

    const startISO = toISOFromDatetimeLocal(startAt);
    const finishISO = toISOFromDatetimeLocal(finishAt);

    if (!startISO || !finishISO) {
      setError('Tanggal/jam mulai dan selesai wajib diisi dengan format yang valid.');
      return;
    }

    if (new Date(finishISO).getTime() <= new Date(startISO).getTime()) {
      setError('Waktu selesai harus lebih besar dari waktu mulai.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backend}/reservasis`, {
        // GANTI ke `${backend}/reservasi` kalau route backend kamu singular
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          pasienId: pasienIdNum,
          start_at: startISO,
          finish_at: finishISO,
          description: description.trim() || null,
          status, // "Booked" | "Finished" | "Cancelled"
        }),
      });

      if (res.ok) {
        router.push('/dashboard/reservasi');
        return;
      }

      let message = 'Gagal menyimpan reservasi.';
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
          <h1 className="text-lg font-semibold">Buat Reservasi</h1>
          <p className="mt-1 text-sm text-slate-400">Pilih pasien dan tentukan jadwal.</p>
        </div>

        <Link
          href="/dashboard/reservasi"
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
              Pastikan backend menerima cookie (credentials: include) atau gunakan Bearer token sesuai kebutuhan backend.
            </div>
          )}

          {/* Pasien */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="pasienId">
              Pasien
            </label>

            {pasiensError && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {pasiensError}
              </div>
            )}

            <select
              id="pasienId"
              name="pasienId"
              value={pasienId}
              onChange={(e) => setPasienId(e.target.value)}
              required
              disabled={pasiensLoading}
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none focus:border-white/20 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
            >
              <option value="">
                {pasiensLoading ? 'Memuat pasien...' : '— Pilih pasien —'}
              </option>
              {pasiens.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.namaPasien} (ID: {p.id})
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-500">
              Jika dropdown kosong: pastikan endpoint <code>/pasiens</code> mengembalikan <code>id</code> dan{' '}
              <code>namaPasien</code>.
            </p>
          </div>

          {/* Jadwal */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="start_at">
                Mulai
              </label>
              <input
                id="start_at"
                name="start_at"
                type="datetime-local"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none focus:border-white/20 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="finish_at">
                Selesai
              </label>
              <input
                id="finish_at"
                name="finish_at"
                type="datetime-local"
                required
                value={finishAt}
                onChange={(e) => setFinishAt(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none focus:border-white/20 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none focus:border-white/20 focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="Booked">Booked</option>
              <option value="Finished">Finished</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="description">
              Deskripsi (opsional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan tambahan, keluhan, dsb."
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-white/20 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/reservasi"
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
