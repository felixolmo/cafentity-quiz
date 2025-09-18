import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { answers, result, lead } = await req.json();
  const url = process.env.MAKE_WEBHOOK_URL;
  if (url) {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: "cafentity-quiz",
        answers,
        result,
        lead,
        timestamp: new Date().toISOString()
      })
    });
  }
  return NextResponse.json({ ok: true });
}
