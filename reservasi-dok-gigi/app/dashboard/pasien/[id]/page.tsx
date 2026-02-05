// app/dashboard/pasien/[id]/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

type Reservasi = {
  id: number;
  pasienId: number;
  start_at: string;
  finish_at: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Pasien = {
  id: number;
  namaPasien: string;
  nohp: string;
  createdAt: string;
  updatedAt: string;
  reservasi: Reservasi[];
};

const TZ = "Asia/Jakarta";

function fmt(iso: string, options: Intl.DateTimeFormatOptions) {
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...options }).format(d);
  } catch {
    return new Intl.DateTimeFormat("id-ID", options).format(d);
  }
}

function formatDate(iso: string) {
  return fmt(iso, { dateStyle: "medium" });
}
function formatTime(iso: string) {
  return fmt(iso, { timeStyle: "short" });
}
function formatDateTime(iso: string) {
  return fmt(iso, { dateStyle: "medium", timeStyle: "short" });
}
function isUpcoming(startIso: string) {
  return new Date(startIso).getTime() >= Date.now();
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "booked"
      ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
      : s === "done"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : s === "cancelled" || s === "canceled"
      ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
      : "border-white/10 bg-white/5 text-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

export default async function PasienDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookie = (await cookies()).get("access-token");
  if (!cookie?.value) redirect("/login");

  const { id } = await params;
  const pasienId = Number(id);
  if (!Number.isFinite(pasienId)) notFound();

  const res = await fetch(`/api/pasiens/${pasienId}`, {
    cache: "no-store",
    // headers: {
    //   Authorization: `Bearer ${cookie.value}`,
    // },
  });

  if (res.status === 401) redirect("/login");
  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`Gagal memuat pasien ${pasienId}. Status: ${res.status}`);
  }

  const pasien = (await res.json()) as Pasien;

  const reservasiSorted = [...(pasien.reservasi ?? [])].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );

  const upcoming = reservasiSorted.filter((r) => isUpcoming(r.start_at));
  const history = reservasiSorted.filter((r) => !isUpcoming(r.start_at));

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link
              href="/dashboard/pasien"
              className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-slate-200"
            >
              Data Pasien
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">Detail</span>
          </div>

          <h1 className="mt-2 text-lg font-semibold">
            Detail Pasien:{" "}
            <span className="text-slate-200">{pasien.namaPasien}</span>
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Ringkasan data pasien dan daftar reservasi.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <Link
            href="/dashboard/pasien"
            className="h-10 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-center text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            ← Kembali
          </Link>

          <Link
            href={`/dashboard/pasien/${pasien.id}/edit`}
            className="h-10 rounded-xl border border-white/10 bg-blue-600/30 px-4 py-2 text-center text-sm font-semibold text-slate-200 hover:bg-blue-600/40"
          >
            Edit Pasien
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Identitas
          </p>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-xs text-slate-500">ID</p>
              <p className="text-sm font-semibold text-slate-200">{pasien.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Nama</p>
              <p className="text-sm font-semibold text-slate-200">
                {pasien.namaPasien}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Kontak
          </p>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-xs text-slate-500">No. HP</p>
              <p className="text-sm font-semibold text-slate-200">{pasien.nohp}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Metadata
          </p>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-xs text-slate-500">Dibuat</p>
              <p className="text-sm font-semibold text-slate-200">
                {formatDateTime(pasien.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Diupdate</p>
              <p className="text-sm font-semibold text-slate-200">
                {formatDateTime(pasien.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservasi */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-200">Reservasi</h2>
            <p className="mt-1 text-sm text-slate-400">
              Total:{" "}
              <span className="text-slate-200 font-semibold">
                {reservasiSorted.length}
              </span>{" "}
              • Upcoming:{" "}
              <span className="text-slate-200 font-semibold">{upcoming.length}</span>{" "}
              • Riwayat:{" "}
              <span className="text-slate-200 font-semibold">{history.length}</span>
            </p>
          </div>

          {/* sementara tombol biasa; nanti bisa jadi Link ke form reservasi */}
          <button
            type="button"
            className="h-10 rounded-xl border border-white/10 bg-emerald-600/25 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-emerald-600/35"
          >
            + Tambah Reservasi
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Mulai</th>
                  <th className="px-4 py-3">Selesai</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reservasiSorted.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-slate-400" colSpan={6}>
                      Belum ada reservasi.
                    </td>
                  </tr>
                ) : (
                  reservasiSorted.map((r) => {
                    const upcomingFlag = isUpcoming(r.start_at);

                    return (
                      <tr key={r.id} className="bg-slate-950/20">
                        <td className="px-4 py-4 font-semibold text-slate-200">
                          #{r.id}
                        </td>
                        <td className="px-4 py-4 text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{formatDate(r.start_at)}</span>
                            {upcomingFlag ? (
                              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                                Upcoming
                              </span>
                            ) : (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                                Riwayat
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-200">{formatTime(r.start_at)}</td>
                        <td className="px-4 py-4 text-slate-200">{formatTime(r.finish_at)}</td>
                        <td className="px-4 py-4 text-slate-300">
                          {r.description ?? <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Catatan: format waktu mencoba timezone Asia/Jakarta, fallback ke timezone environment bila tidak tersedia.
        </p>
      </div>
    </section>
  );
}
