export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Voice ID do ElevenLabs — "Adam" (voz masculina, grave, estilo Jarvis)
// Outros bons candidatos: "Antoni" (warm), "Josh" (deep)
const VOICE_ID = "7WggD3IoWTIPT19PNyrW";

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response("ElevenLabs not configured", { status: 503 });
  }

  // Autenticação mínima — só aceita requests com Authorization
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return new Response("Missing text", { status: 400 });
  }

  // Limita o tamanho para não estourar quota
  const safeText = text.slice(0, 500);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: safeText,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.85,
        style: 0.2,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[TTS]", err);
    return new Response("TTS error", { status: 502 });
  }

  // Stream o áudio diretamente para o cliente
  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
