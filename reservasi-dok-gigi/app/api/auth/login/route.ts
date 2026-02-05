import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ message: "BACKEND_URL not set" }, { status: 500 });
  }

  const body = await req.text();

  const upstream = await fetch(`${backend}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  });

  const resText = await upstream.text();
  const res = new NextResponse(resText, { status: upstream.status });

  // forward content-type
  const ct = upstream.headers.get("content-type");
  if (ct) res.headers.set("content-type", ct);

  // forward Set-Cookie (penting kalau backend set cookie access-token)
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}
