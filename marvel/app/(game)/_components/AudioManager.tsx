import { useState, useEffect, useRef } from "react";
import { GameState, BattleState } from "../src/types";

interface AudioManagerProps {
    gameState: GameState;
    battleState: BattleState;
    isMuted: boolean;
    onToggleMute: () => void;
}

// Extend Window interface to include playSoundEffect
declare global {
    interface Window {
        playSoundEffect?: (effectName: string) => void;
    }
}

function AudioManager({ gameState, battleState, isMuted, onToggleMute }: AudioManagerProps): JSX.Element {
    const [currentTrack, setCurrentTrack] = useState<string>("menu");
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const battleAudioRef = useRef<HTMLAudioElement | null>(null);
    const effectAudioRef = useRef<HTMLAudioElement | null>(null);

    const audioTracks: Record<string, { src: string; volume: number; loop: boolean }> = {
        menu: {
            src: "/avengers_endgame.mp3",
            volume: 0.2,
            loop: true
        },
        map: {
            src: "https://www.zedge.net/ringtones/6c06ccaf-8575-334d-a940-b5165d35d7bc", 
            volume: 0.15,
            loop: true
        },
        battle: {
            src: "/battle_music.mp3",
            volume: 0.5,
            loop: true
        },
        victory: {
            src: "/avengers_endgame.mp3",
            volume: 0.4,
            loop: false
        }
    };

    const soundEffects: Record<string, string> = {
        attack: "",
        block: "/bell-ringing-05.wav",
        levelUp: "/bell-ringing-05.wav",
        purchase: "/bell-ringing-05.wav",
        monsterDefeat: "/bell-ringing-05.wav",
        victory: "/im_groot_victory.mp3"
    };

    useEffect(() => {
        if (isMuted) {
            if (audioRef.current) audioRef.current.pause();
            if (battleAudioRef.current) battleAudioRef.current.pause();
        } else {
            playBackgroundMusic();
        }
    }, [isMuted, gameState, battleState]);

    function playBackgroundMusic(): void {
        if (isMuted) return;

        let trackToPlay = "menu";

        if (gameState === "playing" && battleState === "battling") {
            trackToPlay = "battle";
        } else if (gameState === "playing" && battleState === "map") {
            trackToPlay = "map";
        } else if (gameState === "victory") {
            trackToPlay = "victory";
        }

        if (trackToPlay !== currentTrack) {
            setCurrentTrack(trackToPlay);
            
            if (audioRef.current) {
                audioRef.current.pause();
            }

            const track = audioTracks[trackToPlay];
            if (track) {
                audioRef.current = new Audio(track.src);
                audioRef.current.volume = track.volume;
                audioRef.current.loop = track.loop;
                audioRef.current.play().catch(e => console.log("Audio play failed:", e));
            }
        }
    }

    function playSoundEffect(effectName: string): void {
        if (isMuted) return;

        const effectSrc = soundEffects[effectName];
        if (effectSrc) {
            effectAudioRef.current = new Audio(effectSrc);
            effectAudioRef.current.volume = 0.3;
            effectAudioRef.current.play().catch(e => console.log("Sound effect failed:", e));
        }
    }

    // Expose playSoundEffect to parent components
    useEffect(() => {
        window.playSoundEffect = playSoundEffect;
        return () => {
            delete window.playSoundEffect;
        };
    }, [isMuted]);

    return (
        <div className="fixed top-4 left-4 z-50">
            <button
                onClick={onToggleMute}
                className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-gray-600/50"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? (
                    <span className="text-xl">🔇</span>
                ) : (
                    <span className="text-xl">🔊</span>
                )}
            </button>
        </div>
    );
}

export default AudioManager;
