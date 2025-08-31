"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { BookMarkedIcon, BotIcon, Loader2, Wand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddSpell } from "../_components/AddSpell";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

const SpellView = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const spells = useQuery(api.spell.getSpells) || [];
  const [isOpen, setIsOpen] = useState(false);
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: searchTerm }),
    });
    if (!res.ok) {
      /* handle error */ return;
    }
    const { aiQuery } = await res.json();
    setAiQuery(aiQuery); // useQuery will reactively fetch search results
  };

  const filteredSpells = spells.filter((spell: any) => {
    const matchesQuery = aiQuery ? spell.name.toLowerCase().includes(aiQuery.toLowerCase()) : true;
    const matchesLevel = levelFilter === "All" ? true : spell.level === levelFilter;
    return matchesQuery && matchesLevel;
  });

  return (
    <div className="min-h-screen w-full">
      <AddSpell open={isOpen} onOpenChange={setIsOpen} />
      <header className="flex items-center justify-between px-6 pb-4  pt-10 z-10">
        <div>
          <h1 className="text-2xl font-bold">Spells</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage all your magical spells
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="dark:bg-amber-400 bg-amber-600 flex items-center space-x-2"
        >
          <BookMarkedIcon /> Add Spell
        </Button>
      </header>

      <main className="pt-20 px-6 pb-10 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:space-x-4">
          <div className="relative flex-1">
            <BotIcon className="absolute top-2 right-2 " />
            <Textarea
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term..."
              className="mb-2 pr-6"
            />
            <Button className="w-full" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <div className="mt-2 sm:mt-0 min-w-[120px]">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-8">
          {aiQuery && (
            <div className="flex items-center">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-sm text-blue-500 mb-4">AI Query: {aiQuery}</span>
            </div>
          )}
          {filteredSpells.length === 0 && aiQuery && (
            <p className="text-center bg-muted-foreground">No spells found for your search.</p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredSpells.map((spell: any) => {
              // Gradient backgrounds by level
              const gradientBg =
                spell.level === "1"
                  ? "bg-gradient-to-br from-green-200 via-green-100 to-green-300 dark:bg-card "
                  : spell.level === "2"
                    ? "bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-300 dark:bg-card "
                    : spell.level === "3"
                      ? "bg-gradient-to-br from-red-200 via-red-100 to-red-300d ark:bg-card "
                      : "bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:bg-card ";

              // Badge color by level
              const badgeColor =
                spell.level === "1"
                  ? "bg-green-500 text-white"
                  : spell.level === "2"
                    ? "bg-yellow-500 text-white"
                    : spell.level === "3"
                      ? "bg-red-500 text-white"
                      : "bg-gray-400 text-white";

              // Truncate summary/description
              const summary =
                spell.summary ||
                spell.description ||
                "";
              const truncatedSummary =
                summary.length > 60
                  ? summary.slice(0, 60) + "…"
                  : summary;

              return (
                <Link key={spell._id || spell.id} href={`/spell/${spell._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
                    }}
                    className="cursor-pointer rounded-2xl"
                  >
                    <Card
                      className={` p-5 rounded-2xl shadow-md relative flex flex-col min-h-[180px] border-foreground`}
                    >
                      {/* Level badge at top-right */}
                      <motion.div
                        className="absolute top-3 right-3 z-10"
                        whileHover={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                      >
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold shadow ${badgeColor} border border-white/70`}
                          title={`Level ${spell.level}`}
                        >
                          <Wand className="w-3 h-3 mr-1 inline-block opacity-80" />
                          <p className="hidden lg:inline-flex">Level {spell.level}</p>
                        </span>
                      </motion.div>
                      <CardHeader className="flex flex-row items-center gap-3 pb-1">
                        <Wand className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                        <CardTitle className="text-lg font-bold leading-tight">
                          {spell.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2 flex-1 flex flex-col">
                        <p className="text-muted-foreground text-sm mt-1 mb-2 line-clamp-2">
                          {truncatedSummary || (
                            <span className="italic text-gray-400">
                              No summary available.
                            </span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpellView;
