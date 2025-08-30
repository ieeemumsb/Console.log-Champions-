"use client";
import GameDisplay from "./GamePlayDisplay";


export function Game() {
  return (
    <div className="game-container min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-green-400 mb-4">
          Welcome to the Adventure
        </h2>
        <p className="text-xl text-gray-300 mb-2 font-light">
          Join Groot on his epic adventures in the Marvel Universe
        </p>
        <p className="text-sm text-gray-400">
          Defeat monsters, gain experience, and become the mightiest Guardian
        </p>
      </div>
      <GameDisplay />
    </div>

  );
}


