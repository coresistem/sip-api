import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Users,
    Check,
    Search,
    Loader2,
    Calendar,
    MapPin,
    FileText,
    Send
} from 'lucide-react';
import { api } from '../../core/contexts/AuthContext';

interface Student {
    id: string;
    name: string;
    grade: string;
    archeryCategory: string;
    skillLevel: string;
    gender: string;
    avgScore?: number;
    selected: boolean;
}

interface Competition {
    id: string;
    name: string;
    type: 'DISTRICT' | 'PROVINCIAL' | 'NATIONAL';
    location: string;
    registrationDeadline: string;
    eventDate: string;
    categories: string[];
    maxParticipants: number;
}

interface Registration {
    id: string;
    competitionName: string;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    submittedAt?: string;
    studentCount: number;
}

// Mock data
const MOCK_STUDENTS: Student[] = [
    { id: '1', name: 'Ahmad Santoso', grade: 'XII', archeryCategory: 'RECURVE', skillLevel: 'INTERMEDIATE', gender: 'MALE', avgScore: 8.2, selected: false },
    { id: '2', name: 'Budi Prasetyo', grade: 'XI', archeryCategory: 'RECURVE', skillLevel: 'BEGINNER', gender: 'MALE', avgScore: 7.5, selected: false },
    { id: '3', name: 'Citra Dewi', grade: 'XII', archeryCategory: 'COMPOUND', skillLevel: 'INTERMEDIATE', gender: 'FEMALE', avgScore: 8.0, selected: false },
    { id: '4', name: 'Dian Permata', grade: 'X', archeryCategory: 'RECURVE', skillLevel: 'BEGINNER', gender: 'FEMALE', avgScore: 6.8, selected: false },
    { id: '5', name: 'Eko Wijaya', grade: 'XI', archeryCategory: 'BAREBOW', skillLevel: 'INTERMEDIATE', gender: 'MALE', avgScore: 7.8, selected: false },
];

const MOCK_COMPETITION: Competition = {
    id: 'o2sn-2026',
    name: 'O2SN Panahan Tingkat Provinsi 2026',
    type: 'PROVINCIAL',
    location: 'GOR Panahan Bandung',
    registrationDeadline: '2026-02-15',
    eventDate: '2026-03-10',
    categories: ['RECURVE', 'COMPOUND', 'BAREBOW'],
    maxParticipants: 10
};

const MOCK_REGISTRATIONS: Registration[] = [
    { id: '1', competitionName: 'O2SN Panahan Tingkat Kabupaten 2025', status: 'APPROVED', submittedAt: '2025-10-15', studentCount: 5 },
    { id: '2', competitionName: 'POPDA Panahan 2025', status: 'SUBMITTED', submittedAt: '2025-11-20', studentCount: 3 },
];

export default function O2SNRegistrationPage() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, competitionRes, registrationsRes] = await Promise.all([
                api.get('/schools/students'),
                api.get('/schools/o2sn/current'),
                api.get('/schools/registrations')
            ]);

            // Allow empty data, don't force mocks unless error is network related?
            // Actually, let's trust the backend.
            setStudents(studentsRes.data?.data || []);
            setCompetition(competitionRes.data?.data || null);
            setRegistrations(registrationsRes.data?.data || []);

        } catch (error) {
            console.error('Failed to fetch O2SN Data:', error);
            // Fallback for demo purposes if backend is empty (optional)
            // But user requested "Complete", so let's stick to real data or handle empty state UI.
            setStudents([]);
            setCompetition(null);
            setRegistrations([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (studentId: string) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, selected: !s.selected } : s
        ));
    };

    const selectAll = () => {
        const filteredIds = filteredStudents.map(s => s.id);
        setStudents(prev => prev.map(s =>
            filteredIds.includes(s.id) ? { ...s, selected: true } : s
        ));
    };

    const clearSelection = () => {
        setStudents(prev => prev.map(s => ({ ...s, selected: false })));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const selectedStudents = students.filter(s => s.selected);
            const res = await api.post('/schools/o2sn/register', {
                competitionId: competition?.id,
                studentIds: selectedStudents.map(s => s.id)
            });

            if (res.data?.success) {
                // Refresh data
                await fetchData();
                clearSelection();
                setShowConfirmModal(false);
                setActiveTab('history');
            }
        } catch (error) {
            console.error("Registration failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || s.archeryCategory === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const selectedCount = students.filter(s => s.selected).length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'SUBMITTED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                    O2SN <span className="gradient-text">Registration</span>
                </h1>
                <p className="text-dark-400 mt-1">
                    Register students for O2SN archery competition
                </p>
            </motion.div>

            {/* Competition Info */}
            {competition && activeTab === 'register' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">{competition.name}</h2>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-dark-400">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{competition.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Event: {new Date(competition.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-dark-400">Registration Deadline</div>
                            <div className="text-lg font-bold text-yellow-400">
                                {new Date(competition.registrationDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
            >
                <button
                    onClick={() => setActiveTab('register')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'register'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                        }`}
                >
                    New Registration
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'history'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                        }`}
                >
                    History
                </button>
            </motion.div>

            {activeTab === 'register' && (
                <>
                    {/* Filters & Selection Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                    >
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input pl-10 w-full"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="input"
                            >
                                <option value="ALL">All Categories</option>
                                <option value="RECURVE">Recurve</option>
                                <option value="COMPOUND">Compound</option>
                                <option value="BAREBOW">Barebow</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-dark-400">
                                <span className="text-white font-bold">{selectedCount}</span> / {competition?.maxParticipants} selected
                            </div>
                            <button onClick={selectAll} className="text-sm text-primary-400 hover:underline">Select All</button>
                            <button onClick={clearSelection} className="text-sm text-dark-400 hover:underline">Clear</button>
                        </div>
                    </motion.div>

                    {/* Student List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card"
                    >
                        {filteredStudents.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                                <h3 className="text-lg font-medium text-white mb-2">No Students Found</h3>
                                <p className="text-dark-400">No students match your filters.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-dark-700">
                                {filteredStudents.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudent(student.id)}
                                        className={`p-4 cursor-pointer transition-colors ${student.selected ? 'bg-primary-500/10' : 'hover:bg-dark-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${student.selected
                                                ? 'bg-primary-500 border-primary-500'
                                                : 'border-dark-600'
                                                }`}>
                                                {student.selected && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-white">{student.name}</div>
                                                <div className="text-sm text-dark-400">
                                                    Grade {student.grade} • {student.archeryCategory} • {student.skillLevel}
                                                </div>
                                            </div>
                                            {student.avgScore && (
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-white">{student.avgScore}</div>
                                                    <div className="text-xs text-dark-400">Avg Score</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    {selectedCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end"
                        >
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Submit Registration ({selectedCount} students)
                            </button>
                        </motion.div>
                    )}
                </>
            )}

            {activeTab === 'history' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    {registrations.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                            <h3 className="text-lg font-medium text-white mb-2">No Registrations</h3>
                            <p className="text-dark-400">You haven't submitted any registrations yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-dark-700">
                            {registrations.map(reg => (
                                <div key={reg.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{reg.competitionName}</div>
                                                <div className="text-sm text-dark-400">
                                                    {reg.studentCount} students • Submitted {reg.submittedAt && new Date(reg.submittedAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(reg.status)}`}>
                                            {reg.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Confirm Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">Confirm Registration</h3>
                            <p className="text-dark-400 mb-4">
                                You are about to submit <span className="text-white font-medium">{selectedCount} students</span> for {competition?.name}.
                            </p>

                            <div className="bg-dark-800/50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
                                {students.filter(s => s.selected).map(s => (
                                    <div key={s.id} className="flex items-center gap-2 py-1">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-white">{s.name}</span>
                                        <span className="text-xs text-dark-400">({s.archeryCategory})</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Submit
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
