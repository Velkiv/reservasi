import DeletePasienButton from "@/components/deletePasienButton";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type Pasien = {
  id: number;
  namaPasien: string;
  nohp: string;
  createdAt: string; // ISO string dari backend
};

function formatTanggal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // fallback kalau bukan date valid
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function PasienPage() {
  const cookie = (await cookies()).get("access-token");
  const backend = process.env.BACKEND_URL;

  if(!cookie) {
    redirect("/login")
  }
  
  const data = await fetch(`${backend}/pasiens`, {
    cache: "no-cache",
    headers: cookie ? {Authorization: `Bearer ${cookie.value}`} : {}
  })

  if(!data) {
    redirect("/login")
  }
  
  const pasiens = await data.json()

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Data Pasien</h1>
          <p className="mt-1 text-sm text-slate-400">
            Daftar pasien yang terdaftar (skeleton).
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-500 md:w-64">
            Cari pasien...
          </div>
          <Link href={"/dashboard/pasien/form"} className="h-10 w-full rounded-xl border border-white/10 bg-blue-600/30 px-4 py-2 text-center text-sm font-semibold text-slate-200 md:w-auto">
            + Tambah Pasien
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="border-b border-white/10 px-4 py-3">ID</th>
                <th className="border-b border-white/10 px-4 py-3">Nama</th>
                <th className="border-b border-white/10 px-4 py-3">No. HP</th>
                <th className="border-b border-white/10 px-4 py-3">Dibuat</th>
                <th className="border-b border-white/10 px-4 py-3 text-right">
                  Aksi
                </th>
              </tr>
            </thead>

            
            <tbody className="text-sm text-slate-200">
              {(pasiens as Pasien[] ?? []).map( (pasien) => (
                <tr key={pasien.id} className="">
                    <td className="border-b border-white/10 px-4 py-3">
                      {pasien.id}
                    </td>
                    <td className="border-b border-white/10 px-4 py-3">
                      {pasien.namaPasien}
                    </td>
                    <td className="border-b border-white/10 px-4 py-3">
                      {pasien.nohp}
                    </td>
                    <td className="border-b border-white/10 px-4 py-3">
                      {formatTanggal(pasien.createdAt)}
                    </td>
                    <td className="border-b border-white/10 px-4 py-3">
                      <div className="ml-auto flex justify-end gap-2">
                        <Link href={`/dashboard/pasien/${pasien.id}`} className="text-center h-9 w-20 rounded-xl border border-white/10 bg-white/5 text-sm">
                          Detail
                        </Link>
                        <Link href={`/dashboard/pasien/${pasien.id}/edit`} className="h-9 w-20 rounded-xl border border-white/10 bg-white/5 text-sm">
                          Edit
                        </Link>
                        <DeletePasienButton id={pasien.id}/>
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
