import { useState, useEffect } from "react";

import MonsterStats from "./MonsterStats";
import PlayerStats from "./PlayerStats";
import { playerDitched, playerHit, addPlayerXp } from "../_lib/players"
import { Player, Monster } from "../types";
import { getMonsters , monsterHit} from "../_lib/Monsters";

interface BattleFieldProps {
    player: Player;
    setPlayer: (player: Player) => void;
    monster: string;
    setMonster: (monster: string) => void;
    setBattleStarted: (started: boolean) => void;
    setGameStarted: (started: boolean) => void;
    lostGame: boolean;
    setLostGame: (lost: boolean) => void;
}

export function BattleField({ 
    player, 
    setPlayer, 
    monster, 
    setMonster, 
    setBattleStarted, 
    setGameStarted, 
    lostGame, 
    setLostGame 
}: BattleFieldProps){
    const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [levelUpMessage, setLevelUpMessage] = useState("");

    useEffect(() => {
        const monsterData = getMonsters().find((m) => m.name === monster);
        setCurrentMonster(monsterData || null);
        setBattleLog([`A wild ${monster} appears!`]);
    }, [monster]);

    // Handle losing the game by changing the game state
    function lost(): void {
        setGameStarted(false);
        setBattleStarted(false);
        setLostGame(true);
    }

    // Handle running away from the battle
    function runAway(): void {
        if (!currentMonster) return;
        
        setIsAnimating(true);
        if (window.playSoundEffect) {
            window.playSoundEffect("block");
        }
        setTimeout(() => {
            setPlayer(playerDitched(player, currentMonster));
            if (player.health > 0) {
                setMonster("");
                setBattleStarted(false);
            } else {
                lost();
            }
            setIsAnimating(false);
        }, 500);
    }

    function block(): void {
        if (!currentMonster) return;
        
        setIsAnimating(true);
        if (window.playSoundEffect) {
            window.playSoundEffect("block");
        }
        setTimeout(() => {
            if (Math.random() < 0.5) {
                setBattleLog(prev => [...prev, "Block successful! No damage taken."]);
            } else {
                setPlayer(playerHit(player, currentMonster));
                setBattleLog(prev => [...prev, "Block failed! You took damage."]);
            }
            setIsAnimating(false);
        }, 500);
    }

    function attack(): void {
        if (!currentMonster) return;
        
        setIsAnimating(true);
        if (window.playSoundEffect) {
            window.playSoundEffect("attack");
        }
        setTimeout(() => {
            if (Math.random() < 0.5) {
                const updatedMonster = monsterHit(currentMonster, player);
                setCurrentMonster(updatedMonster);
                setBattleLog(prev => [...prev, `You hit the ${monster} for ${player.power} damage!`]);
                
                // Check if monster is defeated
                if (updatedMonster.health <= 0) {
                    if (window.playSoundEffect) {
                        window.playSoundEffect("monsterDefeat");
                    }
                }
            } else {
                setPlayer(playerHit(player, currentMonster));
                setBattleLog(prev => [...prev, `You missed! The ${monster} counterattacks!`]);
            }
            setIsAnimating(false);
        }, 500);
    }

    function monsterDefeated(): void {
        if (!currentMonster) return;
        
        const oldLevel = player.level;
        const newPlayer = addPlayerXp(player, currentMonster);
        setPlayer(newPlayer);
        
        if (newPlayer.level > oldLevel) {
            setLevelUpMessage(`🎉 Level Up! You are now level ${newPlayer.level}! 🎉`);
            if (window.playSoundEffect) {
                window.playSoundEffect("levelUp");
            }
            setTimeout(() => setLevelUpMessage(""), 5000);
        }
    }

    function fightNewMonster(): void {
        const monsters = getMonsters();
        const aliveMonsters = monsters.filter(m => m.health > 0);
        
        if (aliveMonsters.length > 0) {
            const randomMonster = aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
            setMonster(randomMonster.name);
            setBattleLog([`A new ${randomMonster.name} appears!`]);
        } else {
            // All monsters defeated
            setMonster("");
            setBattleStarted(false);
        }
    }

    function backToWorld(): void {
        setMonster("");
        setBattleStarted(false);
    }

    return (
        <div className="space-y-6">
            {levelUpMessage && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
                    <p className="text-yellow-400 font-bold text-lg">{levelUpMessage}</p>
                </div>
            )}
            
            {currentMonster && currentMonster.health > 0 && player.health > 0 && !lostGame && (
                <div className={`battle-field rounded-2xl p-8 ${isAnimating ? 'battle-animation' : ''}`}>
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-red-400 mb-2">⚔️ Battle Field ⚔️</h2>
                        <p className="text-gray-400">Fight for your life, Guardian!</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <MonsterStats currentMonsterStats={currentMonster} />
                        <PlayerStats playerStats={player} />
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 mb-6 max-h-32 overflow-y-auto">
                        <h4 className="text-green-400 font-semibold mb-2">Battle Log:</h4>
                        {battleLog.slice(-5).map((log, index) => (
                            <p key={index} className="text-sm text-gray-300 mb-1">• {log}</p>
                        ))}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={runAway}
                            className="button-danger text-white font-bold py-3 px-6 rounded-xl"
                        >
                            🏃 Run Away
                        </button>
                        <button 
                            onClick={block}
                            className="button-secondary text-white font-bold py-3 px-6 rounded-xl"
                        >
                            🛡️ Block
                        </button>
                        <button 
                            onClick={attack}
                            className="button-primary text-white font-bold py-3 px-6 rounded-xl"
                        >
                            ⚔️ Attack
                        </button>
                    </div>
                </div>
            )}
            
            {currentMonster && currentMonster.health <= 0 && player.health > 0 && !lostGame && (
                <div className="victory-field rounded-2xl p-8 text-center">
                    <div className="mb-6">
                        <div className="w-24 h-24 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-4xl">🏆</span>
                        </div>
                        <h2 className="text-3xl font-bold text-green-400 mb-2">Victory!</h2>
                        <p className="text-xl text-gray-300 mb-4">
                            The {monster} has been defeated!
                        </p>
                        {monsterDefeated()}
                        <div className="bg-green-500/20 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl text-yellow-400 mb-1">💰</div>
                                    <p className="text-yellow-400 font-semibold">+{currentMonster.power} Gold</p>
                                </div>
                                <div>
                                    <div className="text-2xl text-blue-400 mb-1">⭐</div>
                                    <p className="text-blue-400 font-semibold">+{Math.floor(currentMonster.power * 1.5)} XP</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={fightNewMonster}
                            className="button-primary text-white font-bold py-3 px-6 rounded-xl"
                        >
                            ⚔️ Fight Another Monster
                        </button>
                        <button 
                            onClick={backToWorld}
                            className="button-secondary text-white font-bold py-3 px-6 rounded-xl"
                        >
                            🌍 Return to World
                        </button>
                    </div>
                </div>
            )}
            {player.health <= 0 && !lostGame && (
                lost()
            )}
        </div>
    );
}

export default BattleField;
