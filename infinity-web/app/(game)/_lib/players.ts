import { Player } from "../types"; 

//this file will contain all the player related logic

function setUpUser(): Player {
    // Logic to set up the user player
    const player: Player = {
        name: "Groot",
        health: 100,
        gold: 50,
        xp: 0,
        power: 20,
        level: 1,
        maxHealth: 100
    };
    return player;
}

function playerDitched(player: Player, monster: { power: number }): Player {
    const damage = monster.power + Math.floor(Math.random() * 10);
    player.health = Math.max(0, player.health - damage);
    return player;
}

function playerHit(player: Player, monster: { power: number }): Player {
    // Logic for when the player is hit
    const damage = Math.max(1, monster.power - Math.floor(Math.random() * player.xp));
    player.health = Math.max(0, player.health - damage);
    console.log(`Player hit! Remaining health: ${player.health}`);
    return player;
}

function getPlayerStats(): Player {
    return setUpUser();
}

function addPlayerXp(player: Player, monster: { power: number }): Player {
    const goldGained = monster.power;
    const xpGained = monster.power + Math.floor(Math.random() * 20);
    
    player.gold += goldGained;
    player.xp += xpGained;
    
    // Level up system
    const newLevel = Math.floor(player.xp / 100) + 1;
    if (newLevel > player.level) {
        player.level = newLevel;
        player.power += 5;
        player.maxHealth += 10;
        player.health = Math.min(player.health + 20, player.maxHealth);
        console.log(`Level up! You are now level ${player.level}!`);
    }
    
    console.log(`Player gained ${xpGained} XP and ${goldGained} Gold! Total XP: ${player.xp}`);
    return player;
}

export { setUpUser, playerHit, getPlayerStats, playerDitched, addPlayerXp };
