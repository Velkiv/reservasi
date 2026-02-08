import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

type PasienMini = {
  id: number;
  namaPasien: string;
  nohp?: string;
};

type ReservasiDetail = {
  id: number;
  pasienId: number;
  start_at: string;
  finish_at: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  pasien?: PasienMini; // jika backend include pasien
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

function durationLabel(startIso: string, finishIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(finishIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return "—";

  const mins = Math.round((end - start) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  if (h <= 0) return `${mins} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const cls =
    s === "booked"
      ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
      : s === "done"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : s === "cancelled" || s === "canceled"
      ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
      : "border-white/10 bg-white/5 text-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export default async function DetailReservasiPage({ params } : { params: Promise<{id: string}>}) {
    const token = (await cookies()).get("access-token")?.value;
    if (!token) redirect("/login");

    const backend = process.env.BACKEND_URL;
    if (!backend) {
        throw new Error("BACKEND_URL belum diset di environment.");
    }

    const { id } = await params;
    const reservasiId = Number(id);
    if (!Number.isFinite(reservasiId)) notFound();

    // Sesuaikan endpoint ini dengan backend kamu:
    // contoh umum: GET /reservasis/:id (include pasien)
    const res = await fetch(`${backend}/reservasi/${reservasiId}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) redirect("/login");
    if (res.status === 404) notFound();
    if (!res.ok) {
        throw new Error(`Gagal memuat reservasi ${reservasiId}. Status: ${res.status}`);
    }

    const reservasi = (await res.json()) as ReservasiDetail;

    return (
        <section className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
            <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <Link
                href="/dashboard/reservasi"
                className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-slate-200"
                >
                Data Reservasi
                </Link>
                <span className="text-slate-600">/</span>
                <span className="text-slate-200">Detail</span>
            </div>

            <h1 className="mt-2 text-lg font-semibold text-slate-200">
                Detail Reservasi: <span className="text-slate-200">#{reservasi.id}</span>
            </h1>

            <p className="mt-1 text-sm text-slate-400">
                Informasi jadwal, status, dan pasien terkait.
            </p>
            </div>

            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <Link
                href="/dashboard/reservasi"
                className="h-10 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-center text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
                ← Kembali
            </Link>

            <Link
                href={`/dashboard/reservasi/${reservasi.id}/edit`}
                className="h-10 rounded-xl border border-white/10 bg-blue-600/30 px-4 py-2 text-center text-sm font-semibold text-slate-200 hover:bg-blue-600/40"
            >
                Edit Reservasi
            </Link>
            </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Jadwal
            </p>
            <div className="mt-3 space-y-2">
                <div>
                <p className="text-xs text-slate-500">Tanggal</p>
                <p className="text-sm font-semibold text-slate-200">
                    {formatDate(reservasi.start_at)}
                </p>
                </div>
                <div className="flex gap-6">
                <div>
                    <p className="text-xs text-slate-500">Mulai</p>
                    <p className="text-sm font-semibold text-slate-200">
                    {formatTime(reservasi.start_at)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Selesai</p>
                    <p className="text-sm font-semibold text-slate-200">
                    {formatTime(reservasi.finish_at)}
                    </p>
                </div>
                </div>
                <div>
                <p className="text-xs text-slate-500">Durasi</p>
                <p className="text-sm font-semibold text-slate-200">
                    {durationLabel(reservasi.start_at, reservasi.finish_at)}
                </p>
                </div>
            </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status & Deskripsi
            </p>
            <div className="mt-3 space-y-2">
                <div>
                <p className="text-xs text-slate-500">Status</p>
                <div className="mt-1">
                    <StatusBadge status={reservasi.status} />
                </div>
                </div>
                <div>
                <p className="text-xs text-slate-500">Deskripsi</p>
                <p className="text-sm font-semibold text-slate-200">
                    {reservasi.description ?? <span className="text-slate-500">—</span>}
                </p>
                </div>
            </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pasien
            </p>
            <div className="mt-3 space-y-2">
                <div>
                <p className="text-xs text-slate-500">Pasien ID</p>
                <p className="text-sm font-semibold text-slate-200">{reservasi.pasienId}</p>
                </div>

                <div>
                <p className="text-xs text-slate-500">Nama</p>
                <p className="text-sm font-semibold text-slate-200">
                    {reservasi.pasien?.namaPasien ?? <span className="text-slate-500">—</span>}
                </p>
                </div>

                <div className="pt-2">
                <Link
                    href={`/dashboard/pasien/${reservasi.pasienId}`}
                    className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                    Lihat Detail Pasien →
                </Link>
                </div>
            </div>
            </div>
        </div>

        {/* Metadata */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-base font-semibold text-slate-200">Metadata</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dibuat</p>
                <p className="mt-2 text-sm font-semibold text-slate-200">
                {formatDateTime(reservasi.createdAt)}
                </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Diupdate</p>
                <p className="mt-2 text-sm font-semibold text-slate-200">
                {formatDateTime(reservasi.updatedAt)}
                </p>
            </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
            Catatan: format waktu mencoba timezone Asia/Jakarta, fallback ke timezone environment bila tidak tersedia.
            </p>
        </div>
        </section>
    )
}