import { useState } from "react";
import { Player } from "../src/types";

interface StoreProps {
    player: Player;
    setPlayer: (player: Player) => void;
    isOpen: boolean;
    onClose: () => void;
}

interface StoreItem {
    id: number;
    name: string;
    description: string;
    price: number;
    icon: string;
    effect: () => Player;
}

function Store({ player, setPlayer, isOpen, onClose }: StoreProps): JSX.Element | null {
    const [purchaseMessage, setPurchaseMessage] = useState("");

    const storeItems: StoreItem[] = [
        {
            id: 1,
            name: "Health Potion",
            description: "Restore 50 health points",
            price: 25,
            icon: "❤️",
            effect: () => {
                const newHealth = Math.min(player.maxHealth, player.health + 50);
                return { ...player, health: newHealth };
            }
        },
        {
            id: 2,
            name: "Power Sword",
            description: "Increase attack power by 10",
            price: 100,
            icon: "⚔️",
            effect: () => {
                return { ...player, power: player.power + 10 };
            }
        },
        {
            id: 3,
            name: "Shield of Protection",
            description: "Increase max health by 20",
            price: 150,
            icon: "🛡️",
            effect: () => {
                return { 
                    ...player, 
                    maxHealth: player.maxHealth + 20,
                    health: player.health + 20
                };
            }
        },
        {
            id: 4,
            name: "Mystic Elixir",
            description: "Restore full health and increase power by 5",
            price: 200,
            icon: "🧪",
            effect: () => {
                return { 
                    ...player, 
                    health: player.maxHealth,
                    power: player.power + 5
                };
            }
        }
    ];

    function purchaseItem(item: StoreItem): void {
        if (player.gold >= item.price) {
            const updatedPlayer = item.effect();
            updatedPlayer.gold -= item.price;
            setPlayer(updatedPlayer);
            setPurchaseMessage(`✅ Purchased ${item.name}!`);
            
            // Play purchase sound effect
            if (window.playSoundEffect) {
                window.playSoundEffect("purchase");
            }
            
            setTimeout(() => setPurchaseMessage(""), 3000);
        } else {
            setPurchaseMessage("❌ Not enough gold!");
            
            // Play error sound effect
            if (window.playSoundEffect) {
                window.playSoundEffect("block"); // Using block sound for error
            }
            
            setTimeout(() => setPurchaseMessage(""), 3000);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="store-card rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-yellow-400">🏪 Guardian's Store</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Your Gold: {player.gold} 💰</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Health:</span>
                            <span className="text-green-400 ml-2">{player.health}/{player.maxHealth}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Power:</span>
                            <span className="text-orange-400 ml-2">{player.power}</span>
                        </div>
                    </div>
                </div>

                {purchaseMessage && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
                        <p className="text-green-400 font-semibold">{purchaseMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storeItems.map((item) => (
                        <div key={item.id} className="store-item p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl">{item.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                        <p className="text-sm text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-yellow-400 font-bold">{item.price} 💰</div>
                                </div>
                            </div>
                            <button
                                onClick={() => purchaseItem(item)}
                                disabled={player.gold < item.price}
                                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                                    player.gold >= item.price
                                        ? 'button-secondary text-white hover:scale-105'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {player.gold >= item.price ? 'Purchase' : 'Not Enough Gold'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        💡 Tip: Defeat monsters to earn gold and become stronger!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Store;
