// app/dashboard/pasien/[id]/edit/EditPasienFormClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  id: number;
  token: string;
  initialNama: string;
  initialNohp: string;
};

export default function EditPasienFormClient({
  id,
  token,
  initialNama,
  initialNohp,
}: Props) {
  const router = useRouter();
  const backend = process.env.BACKEND_URL;

  const [namaPasien, setNamaPasien] = useState(initialNama);
  const [nohp, setNohp] = useState(initialNohp);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const nama = namaPasien.trim();
    const hp = nohp.trim();

    if (!nama || !hp) {
      setError("Nama pasien dan nomor HP wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backend}/pasiens/${id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ namaPasien: nama, nohp: hp }),
      });

      if (!res.ok) {
        let msg = `Update gagal. Status: ${res.status}`;
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          // ignore
        }

        // Prisma: nohp @unique -> seringnya error karena duplicate
        if (res.status === 409) {
          msg = "Nomor HP sudah dipakai pasien lain.";
        }

        setError(msg);
        return;
      }

      // success
      router.replace(`/dashboard/pasien/${id}`);
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
          <div className="text-sm text-slate-300">Nama Pasien</div>
          <input
            name="namaPasien"
            value={namaPasien}
            onChange={(e) => setNamaPasien(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-white/20"
            placeholder="Contoh: Kevin"
            autoComplete="off"
          />
        </label>

        <label className="space-y-2">
          <div className="text-sm text-slate-300">No HP</div>
          <input
            name="nohp"
            value={nohp}
            onChange={(e) => setNohp(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 text-sm outline-none focus:border-white/20"
            placeholder="Contoh: 0800-5500-5521"
            autoComplete="off"
          />
          <p className="text-xs text-slate-400">
            * nohp bersifat unik (Prisma: <code className="text-slate-200">@unique</code>)
          </p>
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



