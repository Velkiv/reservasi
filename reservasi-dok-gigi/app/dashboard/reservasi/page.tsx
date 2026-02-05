import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type ReservasiRow = {
  id: number;
  pasienId: number;
  start_at: string;
  finish_at: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pasien?: {
    namaPasien: string;
  } | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function ReservasiPage() {
  const cookie = (await cookies()).get("access-token");
  const backend = process.env.BACKEND_URL;

  if(!cookie) {
    redirect("/login")
  }
  
  const data = await fetch(`${backend}/reservasi`, {
    cache: "no-cache",
    headers: cookie ? {Authorization: `Bearer ${cookie.value}`} : {}
  })

  if(!data) {
    redirect("/login")
  }

  const reservasi = await data.json()


  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Data Reservasi</h1>
          <p className="mt-1 text-sm text-slate-400">
            Daftar reservasi pasien (skeleton).
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-500 md:w-64">
            Cari reservasi...
          </div>
          <div className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-500 md:w-40">
            Filter status...
          </div>
          <Link href={'/dashboard/reservasi/form'} className="h-10 w-full rounded-xl border border-white/10 bg-blue-600/30 px-4 py-2 text-center text-sm font-semibold text-slate-200 md:w-auto">
            + Tambah Reservasi
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="border-b border-white/10 px-4 py-3">ID</th>
                <th className="border-b border-white/10 px-4 py-3">Pasien</th>
                <th className="border-b border-white/10 px-4 py-3">Mulai</th>
                <th className="border-b border-white/10 px-4 py-3">Selesai</th>
                <th className="border-b border-white/10 px-4 py-3">Status</th>
                <th className="border-b border-white/10 px-4 py-3">Deskripsi</th>
                <th className="border-b border-white/10 px-4 py-3 text-right">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="text-sm text-slate-200">
              {reservasi.map((r: ReservasiRow) => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="border-b border-white/10 px-4 py-3">{r.id}</td>
                  <td className="border-b border-white/10 px-4 py-3">{r.pasien?.namaPasien}</td>
                  <td className="border-b border-white/10 px-4 py-3">{formatDate(r.start_at)}</td>
                  <td className="border-b border-white/10 px-4 py-3">{formatDate(r.finish_at)}</td>
                  <td className="border-b border-white/10 px-4 py-3">{r.description}</td>
                  <td className="border-b border-white/10 px-4 py-3">{r.status}</td>
                  <td className="border-b border-white/10 px-4 py-3">{formatDate(r.createdAt)}</td>

                  <td className="border-b border-white/10 px-4 py-3">
                    <div className="ml-auto flex flex-wrap justify-end gap-2">
                      <button className="h-9 w-20 rounded-xl border border-white/10 bg-white/5 text-sm">
                        Detail
                      </button>
                      <button className="h-9 w-20 rounded-xl border border-white/10 bg-white/5 text-sm">
                        Edit
                      </button>
                      <button className="h-9 w-20 rounded-xl border border-white/10 bg-white/5 text-sm">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
