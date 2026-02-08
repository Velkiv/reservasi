// app/api/pasiens/[id]/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Body = {
  namaPasien?: string;
  nohp?: string;
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idPasien = Number(id);

    if (!Number.isFinite(idPasien)) {
      return NextResponse.json({ message: "Invalid pasien id" }, { status: 400 });
    }

    // Ambil token dari httpOnly cookie (lebih aman daripada props di client)
    const token = (await cookies()).get("access-token")?.value;

    // (Opsional) fallback kalau kamu masih kirim Authorization dari client
    const authFromHeader = req.headers.get("authorization") ?? "";
    const bearerFromHeader = authFromHeader.toLowerCase().startsWith("bearer ")
      ? authFromHeader.slice(7)
      : null;

    const finalToken = token ?? bearerFromHeader;

    if (!finalToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const backend = process.env.BACKEND_URL;
    if (!backend) {
      return NextResponse.json(
        { message: "BACKEND_URL is not set" },
        { status: 500 }
      );
    }

    // Parse & validasi body
    let body: Body = {};
    try {
      body = (await req.json()) as Body;
    } catch {
      return NextResponse.json({ message: "Body must be JSON" }, { status: 400 });
    }

    const nama = String(body.namaPasien ?? "").trim();
    const hp = String(body.nohp ?? "").trim();

    if (!nama || !hp) {
      return NextResponse.json(
        { message: "namaPasien dan nohp wajib diisi" },
        { status: 400 }
      );
    }

    // Forward ke backend
    const res = await fetch(`${backend}/pasiens/${idPasien}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${finalToken}`,
      },
      body: JSON.stringify({ namaPasien: nama, nohp: hp }),
      cache: "no-store",
    });

    // Forward response apa adanya (json/text)
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idPasien = Number(id);

    if (!Number.isFinite(idPasien)) {
      return NextResponse.json({ message: "Invalid pasien id" }, { status: 400 });
    }

    const token = (await cookies()).get("access-token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const backend = process.env.BACKEND_URL;
    if (!backend) {
      return NextResponse.json(
        { message: "BACKEND_URL is not set" },
        { status: 500 }
      );
    }

    const res = await fetch(`${backend}/pasiens/${idPasien}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    // Coba baca sebagai text dulu (aman untuk json maupun non-json)
    const text = await res.text();

    // (Opsional) normalize beberapa error umum dari Prisma/backend
    if (!res.ok) {
      // record not found (sering: Prisma P2025)
      if (res.status === 500 && text.includes("P2025")) {
        return NextResponse.json(
          { message: "Pasien tidak ditemukan." },
          { status: 404 }
        );
      }

      return new NextResponse(text, {
        status: res.status,
        headers: {
          "content-type": res.headers.get("content-type") ?? "application/json",
        },
      });
    }

    // success -> forward payload backend
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
