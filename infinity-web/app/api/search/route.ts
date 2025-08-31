// app/api/search/route.ts (Next.js route)
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { input } = await req.json();

  const system = `You are a concise assistant. Convert the following user text into a short 2-5 word search phrase suitable for a full-text search. Output ONLY the phrase (no punctuation, no explanation).`;
  const prompt = `Text: ${input}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    max_tokens: 16,
    temperature: 0.0,
  });

  if (!completion) return;

  // sanitize and return
  const raw = completion.choices?.[0]?.message?.content?.trim() ?? "";
  const aiQuery = raw.replace(/[^\w\s\-]/g, "").trim(); // strip stray punctuation
  return NextResponse.json({ aiQuery });
}
