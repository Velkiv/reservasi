// components/DeletePasienButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: number;
};

export default function DeleteReservasiButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm("Yakin hapus pasien ini?");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/reservasi/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        let msg = "Gagal menghapus pasien.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {}
        alert(msg);
        return;
      }

      // refresh server component (PasienPage) agar tabel terupdate
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-sm text-red-200 transition hover:bg-red-500/20 hover:border-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
    >
      {loading ? "Hapus..." : "Hapus"}
    </button>
  );
}
