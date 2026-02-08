import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("access-token")?.value;

  const backend = process.env.BACKEND_URL;

  // Sesuaikan path ini kalau backend kamu pakai prefix /api
  // contoh: joinUrl(backend, "/api/pasiens")

  const res = await fetch(`${backend}/pasiens`, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: Request) {
  const token = (await (cookies())).get("access-token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ message: "BACKEND_URL is not set" }, { status: 500 });
  }

  const body = await req.json();

  const res = await fetch(`${backend}/pasiens`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
