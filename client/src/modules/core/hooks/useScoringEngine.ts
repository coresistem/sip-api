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
    return score;
};

export const sortScores = (scores: ScoreValue[]): ScoreValue[] => {
    return [...scores].sort((a, b) => {
        const getOrder = (s: ScoreValue): number => {
            if (s === 'X') return 11;
            if (s === 'M' || s === null) return -1;
            return s as number;
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
        const subtotal = currentEndScores.reduce((sum, s) => sum + getScoreValue(s), 0);
        const newEnd: EndData = {
            scores: [...currentEndScores],
            subtotal
        };
        setEnds([...ends, newEnd]);
        setCurrentEndScores([]);
    };

    const resetSession = () => {
        setEnds([]);
        setCurrentEndScores([]);
    };

    const totalScore = ends.reduce((sum, end) => sum + end.subtotal, 0)
        + currentEndScores.reduce((sum, s) => sum + getScoreValue(s), 0);

    const totalArrows = ends.reduce((sum, end) => sum + end.scores.length, 0) + currentEndScores.length;

    // Calculate simple stats
    const allScores = [...ends.flatMap(e => e.scores), ...currentEndScores];
    const xCount = allScores.filter(s => s === 'X').length;
    const tenCount = allScores.filter(s => s === 10).length;
    const average = totalArrows > 0 ? (totalScore / totalArrows).toFixed(2) : '0.00';

    return {
        ends,
        currentEndScores,
        addArrow,
        removeLastArrow,
        completeEnd,
        resetSession,
        stats: {
            totalScore,
            totalArrows,
            average,
            xCount,
            tenCount
        },
        utils: {
            getScoreValue,
            scoreColors
        }
    };
};
