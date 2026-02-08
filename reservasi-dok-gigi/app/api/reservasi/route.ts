// app/api/reservasis/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type Status = "Booked" | "Finished" | "Cancelled";
const ALLOWED_STATUS = new Set<Status>(["Booked", "Finished", "Cancelled"]);

function getBackendUrl() {
  const backend = process.env.BACKEND_URL;
  if (!backend) throw new Error("BACKEND_URL is not set");
  return backend.replace(/\/$/, "");
}

function extractBearer(authHeader: string | null) {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export async function POST(req: Request) {
  // ambil token dari httpOnly cookie (server bisa baca)
  const cookieToken = (await cookies()).get("access-token")?.value ?? null;
  // fallback jika kamu kirim Authorization dari client
  const headerToken = extractBearer(req.headers.get("authorization"));
  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const pasienId = Number(body?.pasienId);
  const start_at = String(body?.start_at ?? "");
  const finish_at = String(body?.finish_at ?? "");
  const status = String(body?.status ?? "Booked") as Status;

  const descriptionRaw = body?.description;
  const description =
    descriptionRaw === null || descriptionRaw === undefined
      ? null
      : String(descriptionRaw).trim() || null;

  if (!Number.isFinite(pasienId) || pasienId <= 0) {
    return NextResponse.json({ message: "pasienId tidak valid" }, { status: 400 });
  }

  if (!start_at || !finish_at) {
    return NextResponse.json(
      { message: "start_at dan finish_at wajib diisi" },
      { status: 400 }
    );
  }

  const startMs = Date.parse(start_at);
  const finishMs = Date.parse(finish_at);
  if (!Number.isFinite(startMs) || !Number.isFinite(finishMs)) {
    return NextResponse.json(
      { message: "Format start_at/finish_at tidak valid (harus ISO string)" },
      { status: 400 }
    );
  }
  if (finishMs <= startMs) {
    return NextResponse.json(
      { message: "finish_at harus lebih besar dari start_at" },
      { status: 400 }
    );
  }

  if (!ALLOWED_STATUS.has(status)) {
    return NextResponse.json(
      { message: "status tidak valid" },
      { status: 400 }
    );
  }

  const backend = getBackendUrl();

  try {
    const res = await fetch(`${backend}/reservasi`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        pasienId,
        start_at,
        finish_at,
        description,
        status,
      }),
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message:"Gagal menghubungi backend" },
      { status: 502 }
    );
  }
}
