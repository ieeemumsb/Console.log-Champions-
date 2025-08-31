"use server";

import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const { userInput, spellSummary } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Placeholder response if no API key
    return NextResponse.json({
      aiContent: `*This is a simulated AI response for:* \n\n**${userInput}**\n\n_About the spell:_ ${spellSummary.slice(0, 180)}...`,
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant answering questions about the following spell: ${spellSummary}`,
        },
        { role: "user", content: userInput },
      ],
      temperature: 0.7,
    });

    const aiContent =
      completion.choices?.[0]?.message?.content ??
      "Sorry, no response from AI.";

    return NextResponse.json({ aiContent });
  } catch (err) {
    return NextResponse.json(
      { aiContent: "Sorry, there was an error contacting the AI." },
      { status: 500 }
    );
  }
}
