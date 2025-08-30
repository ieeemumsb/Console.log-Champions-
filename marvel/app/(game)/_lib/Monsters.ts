import { Monster } from '../types';

// This file will contain all the monster related logic

const monsters: Monster[] = [
    { 
        name: "Worm", 
        image: "/worm_sprite.png", 
        power: 10, 
        health: 100,
        maxHealth: 100,
        description: "A slimy underground creature"
    },
    { 
        name: "Dragon", 
        image: "/dragon_sprite.png", 
        power: 25, 
        health: 150,
        maxHealth: 150,
        description: "A fearsome fire-breathing beast"
    },
    { 
        name: "Sonath", 
        image: "/sonath_sprite.png", 
        power: 40, 
        health: 200,
        maxHealth: 200,
        description: "A legendary cosmic entity"
    }
];

function setUpMonsters(): Monster[] {
    return monsters;
}

export function getMonsters(): Monster[] {
    return monsters;
}

export function monsterHit(monster: Monster, player: { power: number; xp: number }): Monster {
    if (monster) {
        const damage = player.power + Math.floor(Math.random() * player.xp);
        monster.health = Math.max(0, monster.health - damage);
        console.log(`Monster hit! Remaining health: ${monster.health}`);
        return monster;
    }
    return monster;
}

export function resetMonsters(): Monster[] {
    monsters.forEach(monster => {
        monster.health = monster.maxHealth;
    });
    return monsters;
}
