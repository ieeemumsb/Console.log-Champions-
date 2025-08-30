import { Player } from "../types";

interface PlayerStatsProps {
    playerStats: Player;
}

export function PlayerStats({ playerStats }: PlayerStatsProps) {
    const healthPercentage = Math.max(0, Math.min(100, (playerStats.health / playerStats.maxHealth) * 100));
    const xpPercentage = Math.max(0, Math.min(100, (playerStats.xp % 100)));

    return (
        <div className="stats-card p-6">
            <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🌳</span>
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">{playerStats.name}</h3>
                <p className="text-gray-400 text-sm">Guardian of the Galaxy</p>
                <div className="mt-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Level {playerStats.level}
                    </span>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 font-semibold">Health</span>
                        <span className="text-green-400 font-bold">{playerStats.health}/{playerStats.maxHealth}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                            className="health-bar h-3 rounded-full transition-all duration-300"
                            style={{ width: `${healthPercentage}%` }}
                        ></div>
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 font-semibold">Experience</span>
                        <span className="text-blue-400 font-bold">{playerStats.xp % 100}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                            className="xp-bar h-3 rounded-full transition-all duration-300"
                            style={{ width: `${xpPercentage}%` }}
                        ></div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
                    <div className="text-center">
                        <div className="text-2xl text-yellow-400 mb-1">💰</div>
                        <div className="text-yellow-400 font-bold">{playerStats.gold}</div>
                        <div className="text-xs text-gray-400">Gold</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl text-orange-400 mb-1">⚔️</div>
                        <div className="text-orange-400 font-bold">{playerStats.power}</div>
                        <div className="text-xs text-gray-400">Power</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlayerStats;
