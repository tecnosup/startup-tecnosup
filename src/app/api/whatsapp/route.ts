import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;

  if (!instanceId || !token) {
    return NextResponse.json({ error: "Z-API não configurada." }, { status: 503 });
  }

  const { phone, message } = await req.json();
  if (!phone || !message) {
    return NextResponse.json({ error: "phone e message são obrigatórios" }, { status: 400 });
  }

  const numero = String(phone).replace(/\D/g, "");

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: numero, message }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("[Z-API] Erro:", res.status, JSON.stringify(data));
      return NextResponse.json({ error: data }, { status: res.status });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
