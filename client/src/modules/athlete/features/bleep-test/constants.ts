import { LevelData } from './types';

// Standard 20m Shuttle Run Protocol
// Level 1: 8.5 km/h, then +0.5 km/h per level
// Shuttle distance: 20m

export const SHUTTLE_DISTANCE_METERS = 20;

const generateLevels = (): LevelData[] => {
    const levels: LevelData[] = [];
    let accumulatedDistance = 0;
    let accumulatedTime = 0;

    // Standard usually goes up to level 21 or 23. We'll generate 21.
    for (let l = 1; l <= 21; l++) {
        const speed = 8.0 + (0.5 * l); // L1=8.5, L2=9.0
        const mps = speed / 3.6; // meters per second
        const timePerShuttle = SHUTTLE_DISTANCE_METERS / mps;

        // Calculate shuttles per level based on ~60 seconds per level logic 
        // or standard lookups. Using standard lookup approximation here:
        let shuttlesInLevel = 0;

        if (l === 1) shuttlesInLevel = 7;
        else if (l === 2) shuttlesInLevel = 8;
        else if (l === 3) shuttlesInLevel = 8;
        else if (l === 4) shuttlesInLevel = 9;
        else if (l === 5) shuttlesInLevel = 9;
        else if (l === 6) shuttlesInLevel = 10;
        else if (l === 7) shuttlesInLevel = 10;
        else if (l === 8) shuttlesInLevel = 11;
        else if (l === 9) shuttlesInLevel = 11;
        else if (l === 10) shuttlesInLevel = 11;
        else if (l === 11) shuttlesInLevel = 12;
        else if (l === 12) shuttlesInLevel = 12;
        else if (l === 13) shuttlesInLevel = 13;
        else if (l === 14) shuttlesInLevel = 13;
        else if (l === 15) shuttlesInLevel = 13;
        else shuttlesInLevel = 14 + (l - 16); // Incrementing slowly after 15

        levels.push({
            level: l,
            shuttles: shuttlesInLevel,
            speed: Number(speed.toFixed(1)),
            timePerShuttle: timePerShuttle,
            levelDistance: shuttlesInLevel * SHUTTLE_DISTANCE_METERS,
            accumulatedDistance,
            accumulatedTime
        });

        accumulatedDistance += shuttlesInLevel * SHUTTLE_DISTANCE_METERS;
        accumulatedTime += shuttlesInLevel * timePerShuttle;
    }
    return levels;
};

export const BLEEP_LEVELS = generateLevels();

export const VO2_FORMULA = {
    intercept: 31.025,
    speedFactor: 3.238,
    ageFactor: -3.248,
    interactionFactor: 0.1536
};
