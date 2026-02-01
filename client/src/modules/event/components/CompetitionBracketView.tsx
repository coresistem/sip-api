import { useState, useEffect } from 'react';
import { api } from '../../core/contexts/AuthContext';
import { toast } from 'react-toastify';
import { Trophy, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompetitionBracketViewProps {
    eventId: string;
}

interface ExternalCategory {
    id: string;
    division: string;
    ageClass: string;
    gender: string;
    distance: number;
    categoryLabel?: string;
}

interface Match {
    id: string;
    round: number; // 2, 4, 8, 16...
    matchNumber: number;
    athlete1Id: string | null;
    athlete2Id: string | null;
    winnerId: string | null;
    score1: number;
    score2: number;
    athlete1Score: string | null; // Set scores
    athlete2Score: string | null;
    status: string;
    athlete1?: { user: { name: string }; club?: { name: string } };
    athlete2?: { user: { name: string }; club?: { name: string } };
}

export default function CompetitionBracketView({ eventId }: CompetitionBracketViewProps) {
    const [categories, setCategories] = useState<ExternalCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [eventId]);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchBracket(selectedCategoryId);
        } else {
            setMatches([]);
        }
    }, [selectedCategoryId]);

    const fetchCategories = async () => {
        try {
            const res = await api.get(`/eo/events/${eventId}/categories`);
            if (res.data.success) {
                setCategories(res.data.data);
                if (res.data.data.length > 0 && !selectedCategoryId) {
                    setSelectedCategoryId(res.data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };

    const fetchBracket = async (categoryId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/matches/${eventId}/category/${categoryId}`);
            if (res.data.success) {
                setMatches(res.data.data);
            }
        } catch (error) {
            console.error('Fetch bracket error:', error);
            toast.error('Failed to load bracket');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedCategoryId) return;
        if (!confirm('This will wipe any existing matches for this category. Continue?')) return;

        setGenerating(true);
        try {
            const res = await api.post('/matches/generate', {
                competitionId: eventId,
                categoryId: selectedCategoryId
            });
            if (res.data.success) {
                toast.success('Bracket generated successfully');
                fetchBracket(selectedCategoryId);
            }
        } catch (error: any) {
            console.error('Generate error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate bracket');
        } finally {
            setGenerating(false);
        }
    };

    // Helper to group matches by round
    const getRounds = () => {
        if (!matches.length) return [];
        // matches have 'round' property: 64, 32, 16, 8, 4, 2 (Final)
        // We want to sort them: 64 -> 32 -> ... -> 2
        // distinct rounds
        const roundsMap = new Map<number, Match[]>();
        matches.forEach(m => {
            if (!roundsMap.has(m.round)) roundsMap.set(m.round, []);
            roundsMap.get(m.round)!.push(m);
        });

        // Sort match lists by matchNumber
        roundsMap.forEach(list => list.sort((a, b) => a.matchNumber - b.matchNumber));

        // Return sorted keys (descending)
        const sortedKeys = Array.from(roundsMap.keys()).sort((a, b) => b - a);
        return sortedKeys.map(key => ({
            roundSize: key,
            matches: roundsMap.get(key)!
        }));
    };

    const rounds = getRounds();

    const getRoundName = (size: number) => {
        if (size === 2) return 'Final';
        if (size === 4) return 'Semi Finals';
        if (size === 8) return 'Quarter Finals';
        return `Round of ${size}`;
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-700">
                <div className="flex items-center gap-4">
                    <select
                        className="input min-w-[250px]"
                        value={selectedCategoryId || ''}
                        onChange={e => setSelectedCategoryId(e.target.value)}
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.division} - {c.categoryLabel || `${c.ageClass} ${c.gender} ${c.distance}m`}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => selectedCategoryId && fetchBracket(selectedCategoryId)}
                        className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !selectedCategoryId}
                        className="btn-primary flex items-center gap-2"
                    >
                        {generating ? <RefreshCw size={16} className="animate-spin" /> : <Trophy size={16} />}
                        <span>{matches.length > 0 ? 'Regenerate Bracket' : 'Generate Bracket'}</span>
                    </button>
                </div>
            </div>

            {/* Bracket Visual */}
            <div className="overflow-x-auto pb-8">
                {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-dark-500">
                        <Trophy size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-bold">No Bracket Generated</h3>
                        <p className="text-sm opacity-60">Generate a bracket to start the elimination round.</p>
                    </div>
                ) : (
                    <div className="flex gap-12 min-w-max px-4">
                        {rounds.map((round, rIndex) => (
                            <div key={round.roundSize} className="flex flex-col w-64">
                                <h4 className="text-center font-bold text-dark-300 mb-6 sticky top-0 bg-dark-900/90 py-2 backdrop-blur-sm z-10 border-b border-dark-700">
                                    {getRoundName(round.roundSize)}
                                </h4>

                                <div className="flex flex-col justify-around flex-1 gap-6">
                                    {round.matches.map((match) => (
                                        <div
                                            key={match.id}
                                            className={`relative bg-dark-800 border rounded-lg p-3 transition-all ${match.status === 'COMPLETED' ? 'border-emerald-500/30' : 'border-dark-600'} hover:border-primary-500/50 group`}
                                        >
                                            {/* Match Info */}
                                            <div className="flex justify-between items-center text-[10px] text-dark-500 mb-2 border-b border-dark-700/50 pb-1">
                                                <span>Match #{match.matchNumber}</span>
                                                <span className={match.status === 'COMPLETED' ? 'text-emerald-500' : ''}>{match.status}</span>
                                            </div>

                                            {/* Athlete 1 */}
                                            <div className={`flex justify-between items-center mb-2 text-sm ${match.winnerId === match.athlete1Id && match.status === 'COMPLETED' ? 'font-bold text-emerald-400' : 'text-dark-300'}`}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center text-[10px]">
                                                        {/* Seed or Initials */}
                                                        {match.athlete1?.user.name.charAt(0) || '?'}
                                                    </div>
                                                    <span className="truncate">{match.athlete1?.user.name || 'BYE'}</span>
                                                </div>
                                                <span className={`font-mono ${match.winnerId === match.athlete1Id ? 'text-white' : ''}`}>{match.score1}</span>
                                            </div>

                                            {/* Athlete 2 */}
                                            <div className={`flex justify-between items-center text-sm ${match.winnerId === match.athlete2Id && match.status === 'COMPLETED' ? 'font-bold text-emerald-400' : 'text-dark-300'}`}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center text-[10px]">
                                                        {match.athlete2?.user.name.charAt(0) || '?'}
                                                    </div>
                                                    <span className="truncate">{match.athlete2?.user.name || 'BYE'}</span>
                                                </div>
                                                <span className={`font-mono ${match.winnerId === match.athlete2Id ? 'text-white' : ''}`}>{match.score2}</span>
                                            </div>

                                            {/* Quick Actions (only for EO/Admin/Judge - simplified) */}
                                            {/* In a real app, this would open a scoring modal */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
