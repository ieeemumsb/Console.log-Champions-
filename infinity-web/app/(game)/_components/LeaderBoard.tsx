"use client"
import { useState } from "react";
import { LeaderboardPlayer } from "../types"; 

export function LeaderBoard() {
    const [leaderboardData] = useState<LeaderboardPlayer[]>([
        { name: "GrootMaster", level: 15, xp: 1450, gold: 2500, rank: 1 },
        { name: "GuardianPro", level: 12, xp: 1180, gold: 2100, rank: 2 },
        { name: "TreeWarrior", level: 10, xp: 950, gold: 1800, rank: 3 },
        { name: "GalaxyHero", level: 8, xp: 720, gold: 1400, rank: 4 },
        { name: "CosmicGuard", level: 6, xp: 580, gold: 1100, rank: 5 },
    ]);

    return (
        <div className="game-container min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="groot-title text-6xl font-bold text-green-500 mb-4">
                        Leaderboard
                    </h1>
                    <p className="text-xl text-gray-300">Top Guardians of the Galaxy</p>
                </div>
                
                <div className="glass-effect rounded-2xl shadow-2xl p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    <th className="text-left py-4 px-6 text-green-400 font-bold">Rank</th>
                                    <th className="text-left py-4 px-6 text-green-400 font-bold">Guardian</th>
                                    <th className="text-left py-4 px-6 text-green-400 font-bold">Level</th>
                                    <th className="text-left py-4 px-6 text-green-400 font-bold">Experience</th>
                                    <th className="text-left py-4 px-6 text-green-400 font-bold">Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((player, index) => (
                                    <tr 
                                        key={player.rank} 
                                        className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${
                                            index === 0 ? 'bg-yellow-500/10' : ''
                                        }`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                                                {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                                                {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                                                <span className={`font-bold ${
                                                    index === 0 ? 'text-yellow-400' : 
                                                    index === 1 ? 'text-gray-300' : 
                                                    index === 2 ? 'text-orange-400' : 'text-gray-400'
                                                }`}>
                                                    #{player.rank}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-3">🌳</span>
                                                <span className="font-semibold text-gray-200">{player.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                Level {player.level}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-blue-400 font-semibold">{player.xp} XP</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-yellow-400 font-semibold">{player.gold} 💰</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Compete with other Guardians and climb the ranks!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeaderBoard;
