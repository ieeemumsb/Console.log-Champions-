import { getMonsters } from "../services/monsters";

function Monsters({ setBattleStarted, setMonster }) {
    const monsters = getMonsters();

    function handleClick(monster) {
        setMonster(monster.name);
        setBattleStarted(true);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monsters.map((monster) => (
                <div 
                    key={monster.name}
                    className="stats-card p-6 text-center cursor-pointer monster-hover"
                    onClick={() => handleClick(monster)}
                >
                    <div className="mb-4">
                        <img
                            src={monster.image.replace('../public', '')}
                            alt={monster.name}
                            className="w-24 h-24 mx-auto rounded-lg shadow-md"
                        />
                    </div>
                    <h4 className="text-xl font-bold text-red-400 mb-2">{monster.name}</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                            <span>Power:</span>
                            <span className="text-orange-400 font-semibold">{monster.power}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Health:</span>
                            <span className="text-green-400 font-semibold">{monster.health}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs text-gray-400">Click to battle</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Monsters;