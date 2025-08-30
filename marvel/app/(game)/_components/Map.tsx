"use client";
import { getMonsters } from "../_lib/Monsters";
import { Monster } from "../types";

interface MapProps {
    setBattleStarted: (started: boolean) => void;
    setMonster: (monster: string) => void;
}

export function Map({ setBattleStarted, setMonster }: MapProps){
    const monsters = getMonsters();

    function handleMonsterClick(monsterName: string): void {
        const monster = monsters.find(m => m.name === monsterName);
        if (monster && monster.health > 0) {
            // Play battle start sound effect
            if (window.playSoundEffect) {
                window.playSoundEffect("attack");
            }
            
            setMonster(monsterName);
            setBattleStarted(true);
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-green-400 mb-2">World Map</h2>
                <p className="text-gray-400">Click on monster locations to start battles</p>
            </div>

            <div className="map-container justify-center flex">
                <img
                    src="/map.png"
                    alt="Game Map"
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg border-2 border-green-500/30"
                />
                
                {/* Monster Markers */}
                {monsters.map((monster) => (
                    <div
                        key={monster.name}
                        className={`monster-marker ${monster.name.toLowerCase()} ${monster.health <= 0 ? 'opacity-50' : ''}`}
                        onClick={() => handleMonsterClick(monster.name)}
                        title={monster.health <= 0 ? `${monster.name} defeated!` : `Click to battle ${monster.name}`}
                    >
                        <img
                            src={monster.image}
                            alt={monster.name}
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 shadow-lg ${
                                monster.health <= 0 ? 'border-gray-500 grayscale' : 'border-red-500'
                            }`}
                        />
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            monster.health <= 0 ? 'bg-gray-500' : 'bg-red-500'
                        }`}>
                            {monster.health <= 0 ? 'Defeated' : monster.name}
                        </div>
                        {monster.health > 0 && (
                            <div className="absolute -top-2 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
                                {monster.health}
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Groot Icon on Map */}
                <div className="absolute top-10 left-10">
                    <div className="bg-green-500 rounded-full p-2 shadow-lg">
                        <span className="text-2xl">🌳</span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        You
                    </div>
                </div>
            </div>
            
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">Monster Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {monsters.map((monster) => (
                        <div key={monster.name} className={`stats-card p-4 text-center ${monster.health <= 0 ? 'opacity-60' : ''}`}>
                            <img
                                src={monster.image}
                                alt={monster.name}
                                className={`w-16 h-16 mx-auto mb-2 rounded-lg ${monster.health <= 0 ? 'grayscale' : ''}`}
                            />
                            <h4 className={`font-bold ${monster.health <= 0 ? 'text-gray-400' : 'text-red-400'}`}>
                                {monster.name}
                            </h4>
                            <p className="text-sm text-gray-400">{monster.description}</p>
                            <div className="mt-2 text-xs text-gray-500">
                                Power: {monster.power} | Health: {monster.health}/{monster.maxHealth}
                            </div>
                            {monster.health <= 0 && (
                                <div className="mt-2 text-xs text-green-400 font-semibold">
                                    ✅ Defeated!
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Map;
