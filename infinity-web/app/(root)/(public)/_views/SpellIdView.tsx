"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "ai";
  content: string;
};

export const SpellIdView = ({ spellId }: { spellId: string }) => {
  const spell = useQuery(api.spell.getSpell, { id: spellId as Id<"spells"> });

  // State for chat messages and input
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // On spell load, set initial AI welcome message
  useEffect(() => {
    if (spell) {
      setMessages([
        {
          role: "ai",
          content: `Hello! Ask me anything about **${spell.name}**.`,
        },
      ]);
    }
  }, [spell]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Get AI response from new API route
  async function getAIResponse(
    userInput: string,
    spellSummary: string
  ): Promise<string> {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput, spellSummary }),
      });
      if (!res.ok) {
        return "Sorry, there was an error getting the AI response.";
      }
      const data = await res.json();
      return data.aiContent || "Sorry, no response from AI.";
    } catch (err) {
      return "Sorry, there was an error contacting the AI.";
    }
  }

  // Handle sending a message
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !spell) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    // Get AI response
    const aiContent = await getAIResponse(trimmed, spell.summary || "");
    setMessages((prev) => [...prev, { role: "ai", content: aiContent }]);
    setLoading(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  if (!spell)
    return (
      <div>
        <p className="text-center mt-20 text-muted-foreground">
          Loading spell...
        </p>
      </div>
    );

  return (
    <div
      className="flex flex-col h-screen max-h-screen bg-background px-2 sm:px-0 pb-20"
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      {/* Top: Spell name */}
      <div className="pt-8 pb-4 px-4 sm:px-8">
        <h1 className="text-3xl font-bold pb-2">{spell.name}</h1>
        <p className="text-muted-foreground text-sm text-justify mt-1 max-h-36 line-clamp-5">
          {spell.summary}
        </p>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 flex flex-col overflow-hidden mx-1 sm:mx-4 mb-2">
        <Card
          className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-2 sm:space-y-4 bg-background"
          style={{ minHeight: 0 }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
            >
              <div
                className={`
                  relative
                  px-4 py-2 max-w-[85%] text-sm
                  shadow
                  ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md ml-8"
                      : "bg-muted  rounded-2xl rounded-bl-md mr-8"
                  }
                `}
                style={{
                  wordBreak: "break-word",
                  boxShadow:
                    "0 2px 8px 0 rgba(0,0,0,0.04), 0 1.5px 3px 0 rgba(0,0,0,0.06)",
                }}
              >
                {msg.role === "ai" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p {...props} className="mb-2 last:mb-0" />
                      ),
                      code: ({ node, ...props }) => (
                        <code
                          {...props}
                          className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start w-full">
              <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md mr-8 px-4 py-2 max-w-[85%] text-sm shadow flex items-center min-h-[2.2rem]">
                <span className="animate-pulse">AI is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card>
      </div>

      {/* Input area fixed at bottom */}
      <form
        className="bottom-0 w-full z-10 bg-background border-t flex gap-2 px-2 sm:px-4 py-4"
        style={{
          maxWidth: 600,
          margin: "0 auto",
          // Respect sidebar: add left margin if sidebar present via media queries in CSS
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          placeholder={`Ask about ${spell.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="flex-1 px-4"
          autoFocus
          disabled={loading}
        />
        <Button type="submit" disabled={!input.trim() || loading}>
          Send
        </Button>
      </form>
    </div>
  );
};
