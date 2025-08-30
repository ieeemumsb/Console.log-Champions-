"use client"
import { setUpUser } from "../_lib/players"; 

interface WelcomeMessageProps {
    setGameStarted: (started: boolean) => void;
}

export function WelcomeMessage({ setGameStarted }: WelcomeMessageProps) {
    
    function startGame(): void {
        // Play start game sound effect
        if (window.playSoundEffect) {
            window.playSoundEffect("levelUp"); // Using levelUp sound for game start
        }
        
        setGameStarted(true);
        setUpUser();
    }

    return (
        <div className="space-y-6 mx-auto mt-2">
            <div className="mb-8 flex flex-col items-center py-4 px-4">
                <div className="w-32 h-32 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-6xl">🌳</span>
                </div>
                <h2 className="text-3xl font-bold text-green-400 mb-4">Welcome, Guardian!</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                    Assist Groot in his quest to save his home planet by defeating his enemies!
                </p>
            </div>
            
            <div className="space-y-4 text-sm text-gray-400">
                <div className="flex items-center space-x-3">
                    <span className="text-green-400">⚔️</span>
                    <span>Battle fierce monsters</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-green-400">💎</span>
                    <span>Collect gold and experience</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-green-400">🏆</span>
                    <span>Become the mightiest Guardian</span>
                </div>
            </div>
            
            <button 
                className="button-primary text-white font-bold py-4 px-8 rounded-xl text-xl w-full hover:scale-105 transition-all duration-200"
                onClick={startGame}
            >
                Begin Adventure
            </button>
        </div>
    );
}

