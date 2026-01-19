import { useState, useEffect } from 'react';
import { api } from '../../../context/AuthContext';
import { Target, CheckCircle, XCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';

// A strict list of known routes to compare against
// This manually maintained list acts as the "Total Scope" of the application
const KNOWN_ROUTES = [
    { path: '/dashboard', label: 'Dashboard Home' },
    { path: '/profile', label: 'User Profile' },
    { path: '/scoring', label: 'Scoring Page' },
    { path: '/scoring/history', label: 'Scoring History' },
    { path: '/training/schedule', label: 'Training Schedule' },
    { path: '/club/members', label: 'Club Members' },
    { path: '/club/finance', label: 'Club Finance' },
    { path: '/admin/users', label: 'User Management' },
    { path: '/admin/approvals', label: 'Pending Approvals' },
    { path: '/settings', label: 'Settings' },
    { path: '/notifications', label: 'Notifications' },
];

export default function PageCoverageWidget() {
    const [stats, setStats] = useState<{ path: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/analytics/page-coverage');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch coverage', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Calculate coverage
    const visitedSet = new Set(stats.map(s => s.path));
    const visitedCount = KNOWN_ROUTES.filter(r => visitedSet.has(r.path)).length;
    const totalRoutes = KNOWN_ROUTES.length;
    const coveragePercent = Math.round((visitedCount / totalRoutes) * 100);

    return (
        <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    Feature Coverage
                </h3>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${coveragePercent === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {coveragePercent}% Tested
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {KNOWN_ROUTES.map((route) => {
                    const isVisited = visitedSet.has(route.path);
                    const visitCount = stats.find(s => s.path === route.path)?.count || 0;

                    return (
                        <div
                            key={route.path}
                            className={`flex items-center justify-between p-2 rounded-lg text-sm border ${isVisited
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-red-500/5 border-red-500/20'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {isVisited ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <div>
                                    <p className={isVisited ? 'text-white' : 'text-dark-300'}>
                                        {route.label}
                                    </p>
                                    <p className="text-xs text-dark-500 font-mono">
                                        {route.path}
                                    </p>
                                </div>
                            </div>
                            {isVisited && (
                                <span className="text-xs bg-dark-800 px-2 py-1 rounded-full text-dark-400">
                                    {visitCount} views
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
