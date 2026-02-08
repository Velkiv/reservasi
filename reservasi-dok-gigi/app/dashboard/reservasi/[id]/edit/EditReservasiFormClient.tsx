// app/dashboard/reservasi/[id]/edit/EditReservasiFormClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "Booked" | "Finished" | "Cancelled";

type PasienOption = {
  id: number;
  namaPasien: string;
};

type Props = {
  id: number;
  initialPasienId: number;
  initialStartAt: string;   // ISO
  initialFinishAt: string;  // ISO
  initialDescription: string;
  initialStatus: Status;
};

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toISOFromDatetimeLocal(value: string) {
  const d = new Date(value); // dianggap waktu lokal
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function EditReservasiFormClient({
  id,
  initialPasienId,
  initialStartAt,
  initialFinishAt,
  initialDescription,
  initialStatus,
}: Props) {
  const router = useRouter();

  const [pasiens, setPasiens] = useState<PasienOption[]>([]);
  const [pasienId, setPasienId] = useState<number>(initialPasienId);

  const [startAtLocal, setStartAtLocal] = useState(toDatetimeLocalValue(initialStartAt));
  const [finishAtLocal, setFinishAtLocal] = useState(toDatetimeLocalValue(initialFinishAt));
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<Status>(initialStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch dropdown pasien lewat route handler
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/pasiens", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PasienOption[];
        if (alive) setPasiens(data);
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const pasienLabel = useMemo(() => {
    const p = pasiens.find((x) => x.id === pasienId);
    return p?.namaPasien ?? `Pasien ID ${pasienId}`;
  }, [pasiens, pasienId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!pasienId || !Number.isFinite(pasienId)) {
      setError("Pasien wajib dipilih.");
      return;
    }

    const startIso = toISOFromDatetimeLocal(startAtLocal);
    const finishIso = toISOFromDatetimeLocal(finishAtLocal);

    if (!startIso || !finishIso) {
      setError("Start dan finish wajib diisi (format tanggal tidak valid).");
      return;
    }

    if (new Date(finishIso).getTime() < new Date(startIso).getTime()) {
      setError("Finish tidak boleh lebih awal dari Start.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reservasis/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pasienId,
          start_at: startIso,
          finish_at: finishIso,
          description: description.trim() ? description.trim() : null,
          status,
        }),
      });

      if (!res.ok) {
        let msg = `Update gagal. Status: ${res.status}`;
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          // ignore
        }
        setError(msg);
        return;
      }

      router.replace(`/dashboard/reservasi/${id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-sm text-slate-300">Pasien</div>
          <select
            value={pasienId}
            onChange={(e) => setPasienId(Number(e.target.value))}
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-white/20"
            disabled={loading}
          >
            {/* fallback agar tetap tampil walau list pasien belum kebaca */}
            {!pasiens.some((p) => p.id === pasienId) ? (
              <option value={pasienId}>{pasienLabel}</option>
            ) : null}

            <option value={0}>-- Pilih Pasien --</option>
            {pasiens.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaPasien} (ID {p.id})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <div className="text-sm text-slate-300">Status</div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-white/20"
            disabled={loading}
          >
            <option value="Booked">Booked</option>
            <option value="Finished">Finished</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>

        <label className="space-y-2">
          <div className="text-sm text-slate-300">Start</div>
          <input
            type="datetime-local"
            value={startAtLocal}
            onChange={(e) => setStartAtLocal(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-white/20"
            disabled={loading}
          />
        </label>

        <label className="space-y-2">
          <div className="text-sm text-slate-300">Finish</div>
          <input
            type="datetime-local"
            value={finishAtLocal}
            onChange={(e) => setFinishAtLocal(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-white/20"
            disabled={loading}
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <div className="text-sm text-slate-300">Deskripsi</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[96px] w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-white/20"
            placeholder="Opsional: catatan tindakan/keluhan pasien..."
            disabled={loading}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm"
          disabled={loading}
        >
          Batal
        </button>

        <button
          type="submit"
          className="h-10 rounded-xl border border-white/10 bg-blue-600/30 px-4 text-sm font-semibold"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
