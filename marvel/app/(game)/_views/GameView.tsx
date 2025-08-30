"use client";
import { useState } from "react";
import { Game } from "../_components/Game";
import LeaderBoard from "../_components/LeaderBoard";


export const GameView = () => {
  const [currentPage, setCurrentPage] = useState<'game' | 'leaderboard'>('game');

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-effect p-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="groot-title text-2xl font-bold text-green-500">
            I-Am-Groot
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentPage('game')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                currentPage === 'game'
                  ? 'button-primary text-white'
                  : 'text-gray-300 hover:text-green-400'
              }`}
            >
              🎮 Play Game
            </button>
            <button
              onClick={() => setCurrentPage('leaderboard')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                currentPage === 'leaderboard'
                  ? 'button-primary text-white'
                  : 'text-gray-300 hover:text-green-400'
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'game' && <Game />}
        {currentPage === 'leaderboard' && <LeaderBoard />}
      </main>
    </div>
  );
};
