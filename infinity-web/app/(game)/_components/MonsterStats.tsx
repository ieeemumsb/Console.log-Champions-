import Image from "next/image";
import { Monster } from "../types";
import { cn } from "@/lib/utils";

interface MonsterStatsProps {
  currentMonsterStats: Monster;
}

export function MonsterStats({ currentMonsterStats }: MonsterStatsProps) {
  const healthPercentage = Math.max(
    0,
    Math.min(
      100,
      (currentMonsterStats.health / currentMonsterStats.maxHealth) * 100
    )
  );

  return (
    <div className="stats-card p-6">
      <div className="text-center mb-6">
        <div className="mb-4 flex justify-center">
          <Image
            width={32}
            height={32}
            src={currentMonsterStats.image.replace("../public", "")}
            alt={currentMonsterStats.name}
            className="w-32 h-32 mx-auto rounded-lg shadow-lg border-2 border-red-500/30 "
          />
        </div>
        <h3 className="text-2xl font-bold text-red-400 mb-2">
          {currentMonsterStats.name}
        </h3>
        <p className="text-gray-400 text-sm">Fearsome Enemy</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 font-semibold">Health</span>
            <span className="text-red-400 font-bold">
              {currentMonsterStats.health}/{currentMonsterStats.maxHealth}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={cn(
                  "health-bar h-3 rounded-full transition-all duration-300",
                  {
                    "bg-red-500": healthPercentage < 50,
                    "bg-yellow-500":
                      healthPercentage >= 50 && healthPercentage < 75,
                    "bg-green-500": healthPercentage >= 75,
                  }
                )}
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-600">
          <div className="text-center">
            <div className="text-2xl text-orange-400 mb-1">⚔️</div>
            <div className="text-orange-400 font-bold text-xl">
              {currentMonsterStats.power}
            </div>
            <div className="text-xs text-gray-400">Attack Power</div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-red-400 text-sm text-center font-semibold">
            ⚠️ This monster is dangerous!
          </p>
        </div>
      </div>
    </div>
  );
}

export default MonsterStats;
