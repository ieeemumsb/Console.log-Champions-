"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Lightbulb } from "lucide-react";
import { avengersTrivia } from "@/lib/trivia";

export default function AvengersTriviaMCQ() {
  const [open, setOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (selectedOption === avengersTrivia[currentQ].ans) {
      setFeedback(avengersTrivia[currentQ].quote);
      setScore((s) => s + 1);
    } else {
      setFeedback("Oops! Wrong answer.");
    }
  };

  const handleNext = () => {
    setSelectedOption("");
    setFeedback("");
    if (currentQ < avengersTrivia.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowFinal(true);
      setOpen(false);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentQ(0);
    setSelectedOption("");
    setFeedback("");
    setShowFinal(false);
    setOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md z-[53]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" /> Avengers Trivia
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Score: <span className="font-semibold">{score}</span>
            </span>
            <span className="text-xs text-gray-400">
              Q{currentQ + 1} of {avengersTrivia.length}
            </span>
          </div>

          <div className="my-4">
            <p className="text-lg font-medium mb-4">
              Q{currentQ + 1}: {avengersTrivia[currentQ].q}
            </p>
            <div className="flex flex-col gap-2">
              {avengersTrivia[currentQ].options.map((opt) => (
                <Button
                  key={opt}
                  variant={
                    selectedOption === opt[0].toLowerCase()
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedOption(opt[0].toLowerCase())}
                  className="text-left"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className="mt-4 p-3 rounded-md bg-gray-100 text-center text-sm">
              {feedback}
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            {!feedback ? (
              <Button onClick={handleSubmit} disabled={!selectedOption}>
                Submit
              </Button>
            ) : (
              <Button onClick={handleNext}>Next</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Score Dialog */}
      <Dialog open={showFinal} onOpenChange={setShowFinal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500 animate-bounce" />
              Marvelous! You finished the Avengers Trivia!
            </DialogTitle>
          </DialogHeader>
          <div className="my-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              Your Score: {score} / {avengersTrivia.length}
            </div>
            <div className="text-md text-center mb-2">
              {score === avengersTrivia.length
                ? "You're a true Avenger! Assemble!"
                : score >= avengersTrivia.length / 2
                  ? "Great job, hero! Keep training with the Avengers."
                  : "Don't worry, even heroes need practice. Try again!"}
            </div>
            <div className="text-lg text-yellow-600 font-medium">
              {score === avengersTrivia.length
                ? "💥🦸‍♂️🦸‍♀️ Excelsior! 🦸‍♀️🦸‍♂️💥"
                : "⭐️ Thanks for playing! ⭐️"}
            </div>
          </div>
          <DialogFooter className="flex justify-end">
            <Button onClick={handleRestart} variant="default">
              Play Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
