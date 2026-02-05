// components/DeletePasienButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: number;
};

export default function DeletePasienButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm("Yakin hapus pasien ini?");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pasiens/${id}`, {
        method: "DELETE",
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
      className="h-9 w-20 rounded-xl border border-white/10 bg-white/5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Hapus..." : "Hapus"}
    </button>
  );
}
