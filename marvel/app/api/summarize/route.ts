import { fetchFileFromConvex } from "@/lib/fetchFileFromConvex";
import { NextResponse } from "next/server";
import OpenAI from "openai";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { storageId, name, spellLevel } = await req.json();

  // Fetch file content from Convex
  const fileContent = await fetchFileFromConvex(storageId);
  const textContent: string = await fileContent.text();

  // Send to OpenAI for summarization
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Summarize this document in simple language.",
      },
      { role: "user", content: textContent },
    ],
  });

  const summary = completion.choices[0].message.content;

  return NextResponse.json({ summary });
}
