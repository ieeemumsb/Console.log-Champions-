"use client";

import { useState, useEffect } from "react";
import BattleField from "./BattleField";
import Map from "./Map";
import AudioManager from "./AudioManager";
import { getPlayerStats } from "../_lib/players";
import { Player, GameState, BattleState } from "../types";

import { getMonsters, resetMonsters } from "../_lib/Monsters";
import Image from "next/image";
import { WelcomeMessage } from "./Welcome";

export function GameDisplay() {
  const [gameStarted, setGameStarted] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [monster, setMonster] = useState("");
  const [lostGame, setLostGame] = useState(false);
  const [wonGame, setWonGame] = useState(false);
  const [player, setPlayer] = useState<Player>(getPlayerStats());
  const [isMuted, setIsMuted] = useState(false);

  // Determine game state for audio
  const getGameState = (): GameState => {
    if (wonGame) return "victory";
    if (lostGame) return "gameOver";
    if (gameStarted) return "playing";
    return "menu";
  };

  const getBattleState = (): BattleState => {
    if (battleStarted) return "battling";
    if (gameStarted) return "map";
    return "menu";
  };

  // Check if all monsters are defeated
  useEffect(() => {
    if (gameStarted && !battleStarted && !lostGame) {
      const monsters = getMonsters();
      const allMonstersDefeated = monsters.every((m) => m.health <= 0);
      if (allMonstersDefeated) {
        setWonGame(true);
        if (window.playSoundEffect) {
          window.playSoundEffect("victory");
        }
      }
    }
  }, [gameStarted, battleStarted, lostGame]);

  // Reset the game state to initial values
  function resetGame(): void {
    setMonster("");
    setLostGame(false);
    setWonGame(false);
    setPlayer(getPlayerStats());
    // Reset monster health
    resetMonsters();
  }

  function toggleMute(): void {
    setIsMuted(!isMuted);
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Audio Manager */}
      <AudioManager
        gameState={getGameState()}
        battleState={getBattleState()}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Groot Icon */}
      <div className="groot-icon">
        <Image
          width={64}
          height={64}
          src="/groot.png"
          alt="Groot"
          className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-green-500 shadow-lg"
        />
      </div>

      {/* Marvel Logo */}
      <div className="marvel-logo">MARVEL</div>

      {!battleStarted && !gameStarted && !lostGame && !wonGame && (
        <div className="w-full glass-effect rounded-2xl shadow-2xl mx-auto text-center ">
          <WelcomeMessage setGameStarted={setGameStarted} />
        </div>
      )}

      {!battleStarted && gameStarted && !lostGame && !wonGame && (
        <div className="glass-effect rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
          <Map
            setBattleStarted={setBattleStarted}
            setMonster={setMonster}
            player={player}
            setPlayer={setPlayer}
          />
        </div>
      )}

      {battleStarted && gameStarted && !lostGame && !wonGame && (
        <div className="glass-effect rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
          <BattleField
            player={player}
            setPlayer={setPlayer}
            monster={monster}
            setMonster={setMonster}
            setBattleStarted={setBattleStarted}
            setGameStarted={setGameStarted}
            lostGame={lostGame}
            setLostGame={setLostGame}
          />
        </div>
      )}

      {lostGame && !battleStarted && !gameStarted && (
        <div className="glass-effect rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center lose-game-page">
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over</h2>
            <div className="flex justify-center">
              <div className=" w-24 h-24 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center border-4 border-red-700">
                <span className="text-4xl">💀</span>
              </div>
            </div>
            <p className="text-red-300 mb-6">Groot has fallen in battle...</p>
            <p className="text-sm text-gray-400 mb-6">
              Final Stats: {player.xp} XP • {player.gold} Gold
            </p>
          </div>
          <button
            onClick={resetGame}
            className="button-primary text-white font-bold py-3 px-8 rounded-xl text-lg hover:scale-105 transition-all duration-200"
          >
            Restart Adventure
          </button>
        </div>
      )}

      {wonGame && !battleStarted && !lostGame && (
        <div className="glass-effect rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center winPage">
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-green-500 mb-4">Victory!</h2>
            <div className="w-24 h-24 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>
            <p className="text-gray-300 mb-6">
              All monsters have been defeated!
            </p>
            <p className="text-xl text-green-400 mb-4">
              You are the ultimate Guardian!
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Final Stats: {player.xp} XP • {player.gold} Gold • Level{" "}
              {player.level}
            </p>
          </div>
          <button
            onClick={resetGame}
            className="button-primary text-white font-bold py-3 px-8 rounded-xl text-lg hover:scale-105 transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default GameDisplay;
