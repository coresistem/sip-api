import { useState } from 'react';

export type ScoreValue = number | 'X' | 'M' | null;

export interface EndData {
    scores: ScoreValue[];
    subtotal: number;
}

export const scoreColors: Record<string, { bg: string; text: string; border?: string }> = {
    'X': { bg: '#FFD700', text: '#000000' },
    '10': { bg: '#FFD700', text: '#000000' },
    '9': { bg: '#FFD700', text: '#000000' },
    '8': { bg: '#FF0000', text: '#FFFFFF' },
    '7': { bg: '#FF0000', text: '#FFFFFF' },
    '6': { bg: '#2563EB', text: '#FFFFFF' },
    '5': { bg: '#2563EB', text: '#FFFFFF' },
    '4': { bg: '#1a1a1a', text: '#FFFFFF' },
    '3': { bg: '#1a1a1a', text: '#FFFFFF' },
    '2': { bg: '#FFFFFF', text: '#000000', border: '#ccc' },
    '1': { bg: '#FFFFFF', text: '#000000', border: '#ccc' },
    '0': { bg: '#9CA3AF', text: '#FFFFFF' },
    'M': { bg: '#9CA3AF', text: '#FFFFFF' },
};

export const getScoreValue = (score: ScoreValue): number => {
    if (score === 'X') return 10;
    if (score === 'M' || score === null) return 0;
    if (typeof score === 'number') return score;
    return 0;
};

export const sortScores = (scores: ScoreValue[]): ScoreValue[] => {
    return [...scores].sort((a, b) => {
        const getOrder = (s: ScoreValue): number => {
            if (s === 'X') return 11;
            if (s === 'M' || s === null) return -1;
            if (typeof s === 'number') return s;
            return -1;
        };
        return getOrder(b) - getOrder(a);
    });
};

export const useScoringEngine = (initialArrowsPerEnd: number = 6) => {
    const [ends, setEnds] = useState<EndData[]>([]);
    const [currentEndScores, setCurrentEndScores] = useState<ScoreValue[]>([]);

    const addArrow = (score: ScoreValue) => {
        if (currentEndScores.length < initialArrowsPerEnd) {
            setCurrentEndScores([...currentEndScores, score]);
        }
    };

    const removeLastArrow = () => {
        setCurrentEndScores(currentEndScores.slice(0, -1));
    };

    const completeEnd = () => {
        let total: number = 0;
        currentEndScores.forEach((s: ScoreValue) => {
            total += getScoreValue(s);
        });

        const newEnd: EndData = {
            scores: [...currentEndScores],
            subtotal: total
        };
        setEnds([...ends, newEnd]);
        setCurrentEndScores([]);
    };

    const resetSession = () => {
        setEnds([]);
        setCurrentEndScores([]);
    };

    const calculateTotals = () => {
        let tEnds: number = 0;
        ends.forEach(end => {
            tEnds += end.subtotal;
        });

        let tCurrent: number = 0;
        currentEndScores.forEach(s => {
            tCurrent += getScoreValue(s);
        });

        return { tEnds, tCurrent, totalScore: tEnds + tCurrent };
    };

    const { totalScore } = calculateTotals();

    let totalArrowsCount: number = 0;
    ends.forEach(end => {
        totalArrowsCount += end.scores.length;
    });
    totalArrowsCount += currentEndScores.length;

    // Calculate simple stats
    const allScores: ScoreValue[] = [...ends.flatMap(e => e.scores), ...currentEndScores];
    const xCount: number = allScores.filter(s => s === 'X').length;
    const tenCount: number = allScores.filter(s => s === 10).length;
    const average: string = totalArrowsCount > 0 ? (totalScore / totalArrowsCount).toFixed(2) : '0.00';

    return {
        ends,
        currentEndScores,
        addArrow,
        removeLastArrow,
        completeEnd,
        resetSession,
        stats: {
            totalScore,
            totalArrows: totalArrowsCount,
            average,
            xCount,
            tenCount
        },
        utils: {
            getScoreValue,
            scoreColors,
            sortScores
        }
    };
};
