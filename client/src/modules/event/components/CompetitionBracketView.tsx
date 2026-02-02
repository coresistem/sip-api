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
    matchNo: number;
    athlete1Id: string | null;
    athlete2Id: string | null;
    winnerId: string | null;
    score1: number;
    score2: number;
    sets1: string | null; // JSON string of set points [6, 4, 2] or end scores [28, 29, 30]
    sets2: string | null;
    shootOff1?: number;
    shootOff2?: number;
    status: string;
    athlete1?: { user: { name: string }; club?: { name: string }; seed?: number };
    athlete2?: { user: { name: string }; club?: { name: string }; seed?: number };
}

export default function CompetitionBracketView({ eventId }: CompetitionBracketViewProps) {
    const [categories, setCategories] = useState<ExternalCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isScoringOpen, setIsScoringOpen] = useState(false);
    const [setInputs1, setSetInputs1] = useState<number[]>([]);
    const [setInputs2, setSetInputs2] = useState<number[]>([]);
    const [so1, setSo1] = useState<number>(0);
    const [so2, setSo2] = useState<number>(0);
    const [soX1, setSoX1] = useState<boolean>(false); // Closest to center check?
    const [soX2, setSoX2] = useState<boolean>(false);

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

    const handleOpenScoring = (match: Match) => {
        if (match.status === 'BYE') return;
        setSelectedMatch(match);
        setSetInputs1(match.sets1 ? JSON.parse(match.sets1) : [0, 0, 0, 0, 0]);
        setSetInputs2(match.sets2 ? JSON.parse(match.sets2) : [0, 0, 0, 0, 0]);
        setSo1(0);
        setSo2(0);
        setSoX1(false);
        setSoX2(false);
        setIsScoringOpen(true);
    };

    const handleSaveScore = async () => {
        if (!selectedMatch) return;

        try {
            // Calculate total points based on system
            let score1 = 0;
            let score2 = 0;
            let isComplete = false;
            let winnerId = null;

            if (isCompound) {
                // Accumulated
                score1 = setInputs1.reduce((a, b) => a + b, 0);
                score2 = setInputs2.reduce((a, b) => a + b, 0);
                if (score1 !== score2) {
                    winnerId = score1 > score2 ? selectedMatch.athlete1Id : selectedMatch.athlete2Id;
                    isComplete = true; // Simplified for demo
                }
            } else {
                // Set Points
                setInputs1.forEach((s1, i) => {
                    const s2 = setInputs2[i];
                    if (s1 > s2) score1 += 2;
                    else if (s1 < s2) score2 += 2;
                    else if (s1 > 0 || s2 > 0) { score1 += 1; score2 += 1; }
                });

                const target = selectedCategory?.categoryLabel?.toLowerCase().includes('team') ? 5 : 6;
                if (score1 >= target || score2 >= target) {
                    isComplete = true;
                    winnerId = score1 > score2 ? selectedMatch.athlete1Id : selectedMatch.athlete2Id;
                } else if (score1 === target - 1 && score2 === target - 1) {
                    // It's a tie (5-5 for Individual, 4-4 for Team) -> Shoot off!
                    if (so1 !== so2) {
                        winnerId = so1 > so2 ? selectedMatch.athlete1Id : selectedMatch.athlete2Id;
                        isComplete = true;
                    } else if (soX1 || soX2) {
                        winnerId = soX1 ? selectedMatch.athlete1Id : selectedMatch.athlete2Id;
                        isComplete = true;
                    }
                }
            }

            if (isCompound && score1 === score2 && (so1 !== 0 || so2 !== 0)) {
                winnerId = so1 > so2 ? selectedMatch.athlete1Id : selectedMatch.athlete2Id;
                isComplete = true;
            }

            const res = await api.put(`/matches/${selectedMatch.id}/score`, {
                score1,
                score2,
                sets1: setInputs1,
                sets2: setInputs2,
                winnerId,
                isComplete,
                shootOff1: so1,
                shootOff2: so2
            });

            if (res.data.success) {
                toast.success('Score updated');
                setIsScoringOpen(false);
                if (selectedCategoryId) fetchBracket(selectedCategoryId);
            }
        } catch (error) {
            toast.error('Failed to update score');
        }
    };

    // Helper to group matches by round
    const getRounds = () => {
        if (!matches.length) return [];
        // matches have 'round' property: 64, 32, 16, 8, 4, 2 (Final)
        // matches have 'matchNo' or 'match_no' property
        const roundsMap = new Map<number, Match[]>();
        matches.forEach(m => {
            const mNo = m.matchNo ?? (m as any).match_no;
            const updatedMatch = { ...m, matchNo: mNo };
            if (!roundsMap.has(m.round)) roundsMap.set(m.round, []);
            roundsMap.get(m.round)!.push(updatedMatch);
        });

        // Sort match lists by matchNo
        roundsMap.forEach(list => list.sort((a, b) => (a.matchNo || 0) - (b.matchNo || 0)));

        // Return sorted keys (descending)
        const sortedKeys = Array.from(roundsMap.keys()).sort((a, b) => b - a);
        return sortedKeys.map(key => ({
            roundSize: key,
            matches: roundsMap.get(key)!
        }));
    };

    const rounds = getRounds();
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    const isCompound = selectedCategory?.division?.toUpperCase() === 'COMPOUND';

    const getRoundName = (size: number) => {
        if (size === 2) return 'FINAL';
        if (size === 4) return 'SEMI-FINALS (1/2)';
        if (size === 8) return 'QUARTER-FINALS (1/4)';
        if (size === 16) return '1/8th ELIMINATIONS';
        if (size === 32) return '1/16th ELIMINATIONS';
        return `ROUND OF ${size}`;
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

                    {selectedCategory && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-dark-900/50 rounded-full border border-dark-700">
                            <div className={`w-2 h-2 rounded-full ${isCompound ? 'bg-orange-500' : 'bg-primary-500'}`} />
                            <span className="text-[10px] font-bold text-dark-300 uppercase tracking-wider">
                                {isCompound ? 'Accumulated Score' : 'Set Point System'}
                            </span>
                        </div>
                    )}
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
            <div className="overflow-x-auto pb-12 custom-scrollbar">
                {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-dark-500 bg-dark-800/20 rounded-2xl border border-dashed border-dark-700">
                        <Trophy size={64} className="mb-6 opacity-10" />
                        <h3 className="text-xl font-bold text-dark-300">No Bracket Generated</h3>
                        <p className="text-sm opacity-60">Prepare the registration and generate the bracket to start.</p>
                    </div>
                ) : (
                    <div className="flex gap-0 min-w-max px-8 py-4">
                        {rounds.map((round, rIndex) => (
                            <div key={round.roundSize} className="flex flex-col">
                                {/* Round Header */}
                                <div className="w-72 px-4 mb-8">
                                    <div className="bg-primary-600/20 border border-primary-500/30 rounded-lg py-3 px-4 backdrop-blur-md shadow-lg shadow-primary-900/10">
                                        <h4 className="text-center font-bold text-primary-100 text-xs uppercase tracking-[0.2em]">
                                            {getRoundName(round.roundSize)}
                                        </h4>
                                    </div>
                                </div>

                                <div className={`flex flex-col flex-1 h-full min-h-[600px] ${round.roundSize === 2 ? 'justify-center gap-24 py-12' : 'justify-around'}`} style={{ width: '288px' }}>
                                    {round.matches.map((match, mIndex) => {
                                        const isWinner1 = match.winnerId === match.athlete1Id && match.status === 'COMPLETED';
                                        const isWinner2 = match.winnerId === match.athlete2Id && match.status === 'COMPLETED';

                                        const sets1 = match.sets1 ? JSON.parse(match.sets1) : [];
                                        const sets2 = match.sets2 ? JSON.parse(match.sets2) : [];

                                        return (
                                            <div key={match.id} className="relative py-12 px-4 group">
                                                {/* Action Overlay */}
                                                <div
                                                    onClick={() => handleOpenScoring(match)}
                                                    className="absolute inset-x-4 inset-y-12 z-20 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary-500/10 rounded-xl"
                                                >
                                                    <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                                                        SCORE MATCH
                                                    </div>
                                                </div>

                                                {/* Connecting Lines */}
                                                {rIndex < rounds.length - 1 && (
                                                    <>
                                                        {/* Horizontal Exit */}
                                                        <div className="absolute top-1/2 -right-4 w-12 h-[2px] bg-dark-600 z-0 group-hover:bg-primary-500/50 transition-colors" />
                                                        {/* Vertical Bar (Visual Connector) */}
                                                        {mIndex % 2 === 0 ? (
                                                            <div className="absolute top-1/2 -right-4 w-[2px] h-full bg-dark-600 z-0 group-hover:bg-primary-500/50 transition-colors" />
                                                        ) : (
                                                            <div className="absolute bottom-1/2 -right-4 w-[2px] h-full bg-dark-600 z-0 group-hover:bg-primary-500/50 transition-colors" />
                                                        )}
                                                    </>
                                                )}

                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`relative z-10 bg-dark-900 border-2 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${match.status === 'COMPLETED' ? 'border-emerald-500/20' : 'border-dark-700'} hover:border-primary-500/50 hover:shadow-primary-500/10`}
                                                >
                                                    {/* Match Title Badge for Finals */}
                                                    {match.round === 2 && (
                                                        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 px-6 py-1 rounded-b-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl border-x border-b flex items-center gap-2 z-30 ${match.matchNo === 1 ? 'bg-gradient-to-r from-amber-600 to-amber-400 border-amber-300 text-amber-950' : 'bg-gradient-to-r from-slate-600 to-slate-400 border-slate-300 text-slate-100'}`}>
                                                            {match.matchNo === 1 && <Trophy size={12} />}
                                                            {match.matchNo === 1 ? 'GOLD FINAL' : 'BRONZE FINAL'}
                                                        </div>
                                                    )}

                                                    {/* Match Number Badge */}
                                                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-dark-800 border-l border-b border-dark-700 rounded-bl-lg text-[8px] font-bold text-dark-500 tracking-tighter uppercase">
                                                        M{match.matchNo}
                                                    </div>

                                                    {/* Athlete 1 */}
                                                    <div className={`flex flex-col border-b border-dark-800/50 transition-colors ${isWinner1 ? 'bg-emerald-500/5' : ''}`}>
                                                        <div className="flex items-center min-h-[48px]">
                                                            <div className="w-8 h-12 flex items-center justify-center bg-dark-800/30 text-[10px] font-bold text-dark-400 border-r border-dark-800/50">
                                                                {match.athlete1?.seed || '-'}
                                                            </div>
                                                            <div className="flex-1 px-3 py-2 min-w-0">
                                                                <div className={`text-xs truncate font-bold uppercase tracking-tight ${isWinner1 ? 'text-emerald-400' : 'text-white'}`}>
                                                                    {match.athlete1?.user.name || '-'}
                                                                </div>
                                                                <div className="text-[9px] text-primary-400/60 truncate font-black tracking-widest uppercase">
                                                                    {match.athlete1?.club?.name ? (match.athlete1.club.name.length > 5 ? match.athlete1.club.name.substring(0, 5) : match.athlete1.club.name) : '-'}
                                                                </div>
                                                            </div>
                                                            <div className={`w-12 h-12 flex items-center justify-center font-mono font-bold text-base border-l border-dark-800/50 ${isWinner1 ? 'text-emerald-400 bg-emerald-500/10' : 'text-white bg-dark-950/50'}`}>
                                                                {match.score1}
                                                            </div>
                                                        </div>
                                                        {/* End Scores Display (IanSEO Style) */}
                                                        {sets1.length > 0 && (
                                                            <div className="flex bg-dark-950/30 border-t border-dark-800/30">
                                                                <div className="w-8" /> {/* Offset for seed */}
                                                                <div className="flex flex-1 p-1 gap-1">
                                                                    {sets1.map((s: number, i: number) => (
                                                                        <div key={i} className="px-1.5 py-0.5 bg-dark-800/50 rounded text-[9px] font-mono text-dark-400 border border-dark-700/30">
                                                                            {s}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Athlete 2 */}
                                                    <div className={`flex flex-col transition-colors ${isWinner2 ? 'bg-emerald-500/5' : ''}`}>
                                                        <div className="flex items-center min-h-[48px]">
                                                            <div className="w-8 h-12 flex items-center justify-center bg-dark-800/30 text-[10px] font-bold text-dark-400 border-r border-dark-800/50">
                                                                {match.athlete2?.seed || '-'}
                                                            </div>
                                                            <div className="flex-1 px-3 py-2 min-w-0">
                                                                <div className={`text-xs truncate font-bold uppercase tracking-tight ${isWinner2 ? 'text-emerald-400' : 'text-white'}`}>
                                                                    {match.athlete2?.user.name || '-'}
                                                                </div>
                                                                <div className="text-[9px] text-primary-400/60 truncate font-black tracking-widest uppercase">
                                                                    {match.athlete2?.club?.name ? (match.athlete2.club.name.length > 5 ? match.athlete2.club.name.substring(0, 5) : match.athlete2.club.name) : '-'}
                                                                </div>
                                                            </div>
                                                            <div className={`w-12 h-12 flex items-center justify-center font-mono font-bold text-base border-l border-dark-800/50 ${isWinner2 ? 'text-emerald-400 bg-emerald-500/10' : 'text-white bg-dark-950/50'}`}>
                                                                {match.score2}
                                                            </div>
                                                        </div>
                                                        {/* End Scores Display */}
                                                        {sets2.length > 0 && (
                                                            <div className="flex bg-dark-950/30 border-t border-dark-800/30">
                                                                <div className="w-8" />
                                                                <div className="flex flex-1 p-1 gap-1">
                                                                    {sets2.map((s: number, i: number) => (
                                                                        <div key={i} className="px-1.5 py-0.5 bg-dark-800/50 rounded text-[9px] font-mono text-dark-400 border border-dark-700/30">
                                                                            {s}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scoring Modal Placeholder */}
            {isScoringOpen && selectedMatch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-900 border border-dark-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Input Match Score</h3>
                                <p className="text-xs text-dark-400">Match #{selectedMatch.matchNo} • {isCompound ? 'Accumulated' : 'Set System'}</p>
                            </div>
                            <button onClick={() => setIsScoringOpen(false)} className="p-2 hover:bg-dark-800 rounded-lg text-dark-400">
                                <RefreshCw size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8 bg-dark-800/30 p-4 rounded-xl border border-dark-700/50">
                                <div className="text-center flex-1">
                                    <div className="text-xs text-dark-500 font-bold mb-1 uppercase tracking-widest">{selectedMatch.athlete1?.club?.name?.substring(0, 5) || '-'}</div>
                                    <div className="text-lg font-black text-white">{selectedMatch.athlete1?.user.name || '-'}</div>
                                </div>
                                <div className="px-6 py-2 bg-dark-900 rounded-lg border border-primary-500/20 shadow-inner">
                                    <span className="text-2xl font-mono font-black text-primary-400">
                                        {isCompound ? setInputs1.reduce((a, b) => a + b, 0) :
                                            setInputs1.reduce((acc, s, i) => {
                                                if (s > setInputs2[i]) return acc + 2;
                                                if (s < setInputs2[i]) return acc;
                                                return s > 0 ? acc + 1 : acc;
                                            }, 0)
                                        }
                                    </span>
                                    <span className="mx-3 text-dark-600 font-light">—</span>
                                    <span className="text-2xl font-mono font-black text-primary-400">
                                        {isCompound ? setInputs2.reduce((a, b) => a + b, 0) :
                                            setInputs2.reduce((acc, s, i) => {
                                                if (s > setInputs1[i]) return acc + 2;
                                                if (s < setInputs1[i]) return acc;
                                                return s > 0 ? acc + 1 : acc;
                                            }, 0)
                                        }
                                    </span>
                                </div>
                                <div className="text-center flex-1">
                                    <div className="text-xs text-dark-500 font-bold mb-1 uppercase tracking-widest">{selectedMatch.athlete2?.club?.name?.substring(0, 5) || '-'}</div>
                                    <div className="text-lg font-black text-white">{selectedMatch.athlete2?.user.name || '-'}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[0, 1, 2, 3, 4].map((idx) => {
                                    if (idx > 2 && isCompound) return null; // Compound usually 3 or 5 ends, let's stick to 3 for now or dynamic

                                    return (
                                        <div key={idx} className="flex items-center gap-4 bg-dark-800/20 p-3 rounded-lg border border-dark-700/30 hover:border-primary-500/20 transition-all">
                                            <div className="w-12 text-[10px] font-bold text-dark-500 uppercase">SET {idx + 1}</div>
                                            <input
                                                type="number"
                                                className="input text-center font-mono font-bold text-lg"
                                                placeholder="0"
                                                value={setInputs1[idx] || ''}
                                                onChange={(e) => {
                                                    const newSets = [...setInputs1];
                                                    newSets[idx] = parseInt(e.target.value) || 0;
                                                    setSetInputs1(newSets);
                                                }}
                                            />
                                            <div className="flex-1 flex justify-center gap-2">
                                                {!isCompound && (
                                                    <>
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${setInputs1[idx] > setInputs2[idx] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-800 text-dark-500'}`}>
                                                            {setInputs1[idx] > setInputs2[idx] ? '2' : (setInputs1[idx] === setInputs2[idx] && setInputs1[idx] > 0 ? '1' : '0')}
                                                        </div>
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${setInputs2[idx] > setInputs1[idx] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-800 text-dark-500'}`}>
                                                            {setInputs2[idx] > setInputs1[idx] ? '2' : (setInputs2[idx] === setInputs1[idx] && setInputs2[idx] > 0 ? '1' : '0')}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                className="input text-center font-mono font-bold text-lg"
                                                placeholder="0"
                                                value={setInputs2[idx] || ''}
                                                onChange={(e) => {
                                                    const newSets = [...setInputs2];
                                                    newSets[idx] = parseInt(e.target.value) || 0;
                                                    setSetInputs2(newSets);
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Shoot off UI */}
                            {((!isCompound &&
                                setInputs1.reduce((acc, s, i) => {
                                    if (s > setInputs2[i]) return acc + 2;
                                    if (s < setInputs2[i]) return acc;
                                    return s > 0 ? acc + 1 : acc;
                                }, 0) === (selectedCategory?.categoryLabel?.toLowerCase().includes('team') ? 4 : 5) &&
                                setInputs2.reduce((acc, s, i) => {
                                    if (s > setInputs1[i]) return acc + 2;
                                    if (s < setInputs1[i]) return acc;
                                    return s > 0 ? acc + 1 : acc;
                                }, 0) === (selectedCategory?.categoryLabel?.toLowerCase().includes('team') ? 4 : 5)
                            ) || (isCompound && setInputs1.reduce((a, b) => a + b, 0) > 0 && setInputs1.reduce((a, b) => a + b, 0) === setInputs2.reduce((a, b) => a + b, 0))) && (
                                    <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertCircle size={16} className="text-orange-500" />
                                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Shoot Off / Tie-Break</span>
                                        </div>
                                        <div className="flex items-center gap-4 justify-between">
                                            <div className="flex-1 flex gap-2 items-center">
                                                <input
                                                    type="number"
                                                    className="input text-center font-black text-orange-500 border-orange-500/30 bg-orange-500/5"
                                                    placeholder="S.O"
                                                    value={so1 || ''}
                                                    onChange={(e) => setSo1(parseInt(e.target.value) || 0)}
                                                />
                                                <button
                                                    onClick={() => { setSoX1(!soX1); setSoX2(false); }}
                                                    className={`w-10 h-10 rounded border font-black text-xs ${soX1 ? 'bg-orange-500 border-orange-400 text-white' : 'border-orange-500/30 text-orange-500'}`}
                                                >
                                                    X
                                                </button>
                                            </div>
                                            <div className="text-[10px] font-bold text-orange-500 opacity-50 uppercase">ONE ARROW EACH</div>
                                            <div className="flex-1 flex gap-2 items-center">
                                                <button
                                                    onClick={() => { setSoX2(!soX2); setSoX1(false); }}
                                                    className={`w-10 h-10 rounded border font-black text-xs ${soX2 ? 'bg-orange-500 border-orange-400 text-white' : 'border-orange-500/30 text-orange-500'}`}
                                                >
                                                    X
                                                </button>
                                                <input
                                                    type="number"
                                                    className="input text-center font-black text-orange-500 border-orange-500/30 bg-orange-500/5"
                                                    placeholder="S.O"
                                                    value={so2 || ''}
                                                    onChange={(e) => setSo2(parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className="mt-10 pt-6 border-t border-dark-800 flex justify-between items-center">
                                <button
                                    className="text-xs text-red-500/60 hover:text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                                    onClick={() => {
                                        setSetInputs1([0, 0, 0, 0, 0]);
                                        setSetInputs2([0, 0, 0, 0, 0]);
                                    }}
                                >
                                    <RefreshCw size={12} /> Reset Scores
                                </button>
                                <div className="flex gap-3">
                                    <button className="btn-ghost" onClick={() => setIsScoringOpen(false)}>Cancel</button>
                                    <button className="btn-primary px-10 shadow-lg shadow-primary-900/40" onClick={handleSaveScore}>Save Results</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
