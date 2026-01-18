import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    GraduationCap,
    Trophy,
    ChevronRight,
    Loader2,
    User,
    Clock,
    FileText,
    Award
} from 'lucide-react';
import { api } from '../../context/AuthContext';

interface StudentAthlete {
    id: string;
    name: string;
    avatarUrl?: string;
    grade: string;
    archeryCategory: string;
    skillLevel: string;
    enrollmentDate: string;
}

interface ProgramSchedule {
    id: string;
    title: string;
    day: string;
    time: string;
    venue?: string;
    studentCount: number;
}

interface SchoolStats {
    totalStudents: number;
    activePrograms: number;
    upcomingEvents: number;
    averageAttendance: number;
}

const SchoolDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<StudentAthlete[]>([]);
    const [programs, setPrograms] = useState<ProgramSchedule[]>([]);
    const [stats, setStats] = useState<SchoolStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch complete school data
                const [studentsRes, o2snRes] = await Promise.all([
                    api.get('/schools/students'),
                    api.get('/schools/o2sn/current')
                ]);

                // Handle Students
                if (studentsRes.data.success) {
                    const rawStudents = studentsRes.data.data;
                    const studentData = rawStudents.map((a: any) => ({
                        id: a.id,
                        name: a.name || 'Unknown',
                        avatarUrl: a.avatarUrl,
                        grade: a.grade || 'N/A',
                        archeryCategory: a.archeryCategory || 'RECURVE',
                        skillLevel: a.skillLevel || 'BEGINNER',
                        enrollmentDate: new Date().toISOString(), // Mock if missing from API
                    }));
                    setStudents(studentData);

                    // Stats calculation from real data
                    setStats((prev) => ({
                        ...prev,
                        totalStudents: rawStudents.length,
                        activePrograms: 2, // Todo: endpoint for programs
                        upcomingEvents: o2snRes.data?.data ? 1 : 0,
                        averageAttendance: 85 // Todo: endpoint for attendance
                    } as SchoolStats));
                }

                // Placeholder for Programs (until we make /schools/programs)
                // setPrograms([]); 

            } catch (err) {
                console.error('Failed to fetch school dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                    icon={Users}
                    label="Student Athletes"
                    color="primary"
                    onClick={() => navigate('/athletes')}
                />
                <QuickAction
                    icon={Calendar}
                    label="Ekskul Schedule"
                    color="amber"
                    onClick={() => navigate('/schedules')}
                />
                <QuickAction
                    icon={Trophy}
                    label="O2SN Events"
                    color="emerald"
                    onClick={() => navigate('/events')}
                />
                <QuickAction
                    icon={FileText}
                    label="Reports"
                    color="purple"
                    onClick={() => navigate('/reports')}
                />
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Student Athletes"
                        value={stats.totalStudents.toString()}
                        icon={Users}
                        color="primary"
                    />
                    <StatCard
                        label="Active Programs"
                        value={stats.activePrograms.toString()}
                        icon={GraduationCap}
                        color="amber"
                    />
                    <StatCard
                        label="Upcoming Events"
                        value={stats.upcomingEvents.toString()}
                        icon={Trophy}
                        color="emerald"
                    />
                    <StatCard
                        label="Avg Attendance"
                        value={`${stats.averageAttendance}%`}
                        icon={Calendar}
                        color="purple"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Athletes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-400" />
                            Student Athletes
                        </h3>
                        <button
                            onClick={() => navigate('/athletes')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {students.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No student athletes enrolled</p>
                            <button
                                onClick={() => navigate('/athletes')}
                                className="mt-3 text-sm text-primary-400 hover:text-primary-300"
                            >
                                Enroll students →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {students.slice(0, 5).map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {student.avatarUrl ? (
                                            <img
                                                src={student.avatarUrl}
                                                alt={student.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                                <User size={16} className="text-primary-400" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm text-white font-medium">{student.name}</div>
                                            <div className="text-xs text-slate-400">{student.grade}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded ${student.skillLevel === 'ADVANCED' ? 'bg-emerald-500/20 text-emerald-400' :
                                            student.skillLevel === 'INTERMEDIATE' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-slate-500/20 text-slate-400'
                                            }`}>
                                            {student.skillLevel}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Ekstrakurikuler Schedule */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-amber-400" />
                            Ekstrakurikuler Schedule
                        </h3>
                        <button
                            onClick={() => navigate('/schedules')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            Manage <ChevronRight size={14} />
                        </button>
                    </div>

                    {programs.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No programs scheduled</p>
                            <button
                                onClick={() => navigate('/schedules')}
                                className="mt-3 text-sm text-primary-400 hover:text-primary-300"
                            >
                                Create program →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {programs.map((program) => (
                                <div
                                    key={program.id}
                                    className="p-3 bg-slate-800/50 rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm text-white font-medium">
                                                {program.title}
                                            </div>
                                            {program.venue && (
                                                <div className="text-xs text-slate-400 mt-1">
                                                    📍 {program.venue}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-amber-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {program.day} • {program.time}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {program.studentCount} students
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* O2SN Notice */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Award size={24} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-medium">O2SN 2026 Registration Open</h4>
                        <p className="text-sm text-slate-400 mt-1">
                            Register your student athletes for the upcoming O2SN (Olimpiade Olahraga Siswa Nasional) archery competition.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/events')}
                        className="btn-primary hidden md:flex"
                    >
                        Register Now
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Quick Action Button Component
const QuickAction: React.FC<{
    icon: React.ElementType;
    label: string;
    color: 'primary' | 'emerald' | 'amber' | 'purple';
    onClick: () => void;
}> = ({ icon: Icon, label, color, onClick }) => {
    const colorClasses = {
        primary: 'from-primary-500/20 to-primary-600/20 border-primary-500/30 text-primary-400 hover:border-primary-400',
        emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-400',
        amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400 hover:border-amber-400',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400 hover:border-purple-400',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                p-4 rounded-xl border bg-gradient-to-br transition-all
                flex flex-col items-center gap-2
                ${colorClasses[color]}
            `}
        >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{label}</span>
        </motion.button>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    label: string;
    value: string;
    icon: React.ElementType;
    color: 'primary' | 'emerald' | 'amber' | 'purple';
}> = ({ label, value, icon: Icon, color }) => {
    const iconColors = {
        primary: 'text-primary-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        purple: 'text-purple-400',
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${iconColors[color]}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
        </div>
    );
};

export default SchoolDashboard;
