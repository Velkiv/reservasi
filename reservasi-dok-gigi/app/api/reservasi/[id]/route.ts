// app/api/reservasis/[id]/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getBackendUrl() {
  const backend = process.env.BACKEND_URL;
  if (!backend) throw new Error("BACKEND_URL is not set");
  return backend;
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const token = (await cookies()).get("access-token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = Number(context.params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  // Ambil payload dari client
  let payload: {
    pasienId?: number;
    start_at?: string;
    finish_at?: string;
    description?: string | null;
    status?: "Booked" | "Finished" | "Cancelled";
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  // Validasi minimal (sesuaikan kalau backend sudah validasi juga)
  const pasienId = Number(payload.pasienId);
  if (!Number.isFinite(pasienId) || pasienId <= 0) {
    return NextResponse.json({ message: "pasienId wajib dan harus valid" }, { status: 400 });
  }

  if (!payload.start_at || !payload.finish_at) {
    return NextResponse.json({ message: "start_at dan finish_at wajib diisi" }, { status: 400 });
  }

  const startMs = new Date(payload.start_at).getTime();
  const finishMs = new Date(payload.finish_at).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(finishMs)) {
    return NextResponse.json({ message: "Format tanggal start_at/finish_at tidak valid" }, { status: 400 });
  }
  if (finishMs < startMs) {
    return NextResponse.json({ message: "finish_at tidak boleh lebih awal dari start_at" }, { status: 400 });
  }

  const allowedStatus = new Set(["Booked", "Finished", "Cancelled"]);
  if (!payload.status || !allowedStatus.has(payload.status)) {
    return NextResponse.json({ message: "status tidak valid" }, { status: 400 });
  }

  try {
    const backend = getBackendUrl();

    // Forward request ke backend (server-to-server)
    const res = await fetch(`${backend}/reservasis/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        pasienId,
        start_at: payload.start_at,
        finish_at: payload.finish_at,
        description: payload.description ?? null,
        status: payload.status,
      }),
      cache: "no-store",
    });

    // Forward response dari backend apa adanya (biar error message ikut kebawa)
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
