// app/dashboard/reservasi/[id]/edit/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditReservasiFormClient from "./EditReservasiFormClient";

type PageProps = {
  params: { id: string };
};

type Status = "Booked" | "Finished" | "Cancelled";

type Reservasi = {
  id: number;
  pasienId: number;
  start_at: string;   // ISO dari backend
  finish_at: string;  // ISO dari backend
  description: string | null;
  status: Status;
  createdAt?: string;
  updatedAt?: string;
};

export default async function EditReservasiPage({ params} : PageProps) {
  const cookie = (await cookies()).get("access-token");
  if (!cookie?.value) redirect("/login");

  const backend = process.env.BACKEND_URL;
  if (!backend) {
    throw new Error("BACKEND_URL belum diset di environment.");
  }

  const { id } = await params;
  const reservasiId = Number(id);
  if (!Number.isFinite(reservasiId)) notFound();

  const res = await fetch(`${backend}/reservasi/${reservasiId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${cookie.value}`,
    },
  });

  if (res.status === 401) redirect("/login");

  if (!res.ok) {
    throw new Error(`Gagal mengambil data reservasi. Status: ${res.status}`);
  }

  const reservasi = (await res.json()) as Reservasi;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Edit Reservasi</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ubah data reservasi ID:{" "}
            <span className="text-slate-200">{reservasi.id}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/reservasi/${reservasi.id}`}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            Kembali
          </Link>
          <Link
            href="/dashboard/reservasi"
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            List Reservasi
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <EditReservasiFormClient
          id={reservasi.id}
          initialPasienId={reservasi.pasienId}
          initialStartAt={reservasi.start_at}
          initialFinishAt={reservasi.finish_at}
          initialDescription={reservasi.description ?? ""}
          initialStatus={reservasi.status}
        />
      </div>
    </section>
  );
}
