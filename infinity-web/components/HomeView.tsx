"use client";

import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { storyLines } from "@/lib/constants";
import { Gamepad, MapPin, DollarSign, Book } from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
export const MUSIC_URL = "./endgame.mp3";
const iconMap = {
  Game: Gamepad,
  Spydersense: MapPin,
  Finance: DollarSign,
  "Spell Library": Book,
};

export function HomeView() {
  const [currentLine, setCurrentLine] = useState(0);
  const [showModules, setShowModules] = useState(false);

  useEffect(() => {
    // Sequentially animate each line
    if (currentLine < storyLines.length) {
      const timeout = setTimeout(() => {
        setCurrentLine((prev) => prev + 1);
      }, 2300);
      return () => clearTimeout(timeout);
    } else {
      // After all lines, show modules
      const modTimeout = setTimeout(() => setShowModules(true), 1200);
      return () => clearTimeout(modTimeout);
    }
  }, [currentLine]);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.4;

    const playAudio = () => {
      audio.play().catch(() => console.log("Audio play blocked"));
    };

    // Try autoplay first (might fail)
    playAudio();

    // Fallback: play on first click
    window.addEventListener("click", playAudio, { once: true });
    window.addEventListener("keydown", playAudio, { once: true });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      window.removeEventListener("click", playAudio);
      window.removeEventListener("keydown", playAudio);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col justify-center items-center px-4 bg-red-500"
      style={{
        backgroundImage: "url('/wall].jpeg')",
      }}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mt-10 mb-8 bg-black/70 p-6 rounded-lg shadow-lg backdrop-blur-sm">
        <AnimatePresence>
          {storyLines.slice(0, currentLine).map((line, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="shadow-2xl text-white text-xl font-semibold text-center mb-4 drop-shadow-xl px-4"
            >
              {line}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-8 max-w-md w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <Unauthenticated>
            <SignInButton>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className="rounded-lg shadow-md px-6 py-2"
                >
                  Sign in
                </Button>
              </motion.div>
            </SignInButton>
            <SignUpButton>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="rounded-lg shadow-md px-6 py-2">
                  Sign up
                </Button>
              </motion.div>
            </SignUpButton>
          </Unauthenticated>
          <Authenticated>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={"/game"}>
                <Button className="rounded-lg shadow-md px-6 py-2">
                  Play Game with Groot
                </Button>
              </Link>
            </motion.div>
          </Authenticated>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
