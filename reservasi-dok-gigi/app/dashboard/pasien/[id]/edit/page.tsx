// app/dashboard/pasien/[id]/edit/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditPasienFormClient from "./EditPasienFormClient";

type PageProps = {
  params: { id: string };
};

type Pasien = {
  id: number;
  namaPasien: string;
  nohp: string;
  createdAt?: string;
  updatedAt?: string;
};

export default async function EditPasienPage({ params }: PageProps) {
  const cookie = (await cookies()).get("access-token");
  if (!cookie?.value) redirect("/login");

  const backend = process.env.BACKEND_URL;
  const { id } = await params
  const pasienId = Number(id);

  if (!Number.isFinite(pasienId)) notFound();

  const res = await fetch(`${backend}/pasiens/${pasienId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${cookie.value}`,
    },
  });

  if (res.status === 401) redirect("/login");
  if (res.status === 404) notFound();
  if (!res.ok) {
    // bisa kamu ganti dengan UI error page kalau mau
    throw new Error(`Gagal mengambil data pasien. Status: ${res.status}`);
  }

  const pasien = (await res.json()) as Pasien;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Edit Pasien</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ubah data pasien ID: <span className="text-slate-200">{pasien.id}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/pasien/${pasien.id}`}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            Kembali
          </Link>
          <Link
            href="/dashboard/pasien"
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            List Pasien
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <EditPasienFormClient
          id={pasien.id}
          token={cookie.value}
          initialNama={pasien.namaPasien}
          initialNohp={pasien.nohp}
        />
      </div>
    </section>
  );
}
