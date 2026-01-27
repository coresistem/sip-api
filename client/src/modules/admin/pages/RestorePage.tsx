import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    History, RotateCcw, GitBranch, GitCommit, AlertTriangle,
    CheckCircle, X, Clock, User
} from 'lucide-react';
import { gitApi, CommitInfo } from '../../core/lib/api/git.api';

export default function RestorePage() {
    const [commits, setCommits] = useState<CommitInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);
    const [selectedCommit, setSelectedCommit] = useState<CommitInfo | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await gitApi.getHistory(50); // Fetch last 50 commits
            if (response.success) {
                setCommits(response.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch git history', error);
            toast.error(error.response?.data?.message || 'Failed to load version history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreClick = (commit: CommitInfo) => {
        setSelectedCommit(commit);
        setShowConfirmModal(true);
    };

    const confirmRestore = async () => {
        if (!selectedCommit) return;

        setIsRestoring(true);
        try {
            const response = await gitApi.restore(selectedCommit.hash);
            if (response.success) {
                toast.success('System restored successfully! Reloading...');
                setShowConfirmModal(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error: any) {
            console.error('Restore failed', error);
            toast.error(error.message || 'Failed to restore system');
            setIsRestoring(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="card p-6 border-l-4 border-l-purple-500">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                        <RotateCcw size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Time Travel (Restore Point)</h2>
                        <p className="text-dark-400 leading-relaxed">
                            This feature allows you to revert the system code to a previous version.
                            <br />
                            <span className="text-orange-400 font-bold flex items-center gap-1 mt-2">
                                <AlertTriangle size={16} />
                                WARNING: This action changes the running source code. Database schema changes are NOT reverted.
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-dark-700/50">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <History className="w-5 h-5 text-primary-400" />
                        Commit History
                    </h3>
                    <button
                        onClick={fetchHistory}
                        disabled={isLoading}
                        className="btn-ghost text-sm"
                    >
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-800 text-dark-400 font-medium">
                            <tr>
                                <th className="p-4">Commit</th>
                                <th className="p-4">Message</th>
                                <th className="p-4">Author</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-dark-400">
                                        Loading history...
                                    </td>
                                </tr>
                            ) : commits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-dark-400">
                                        No history found.
                                    </td>
                                </tr>
                            ) : (
                                commits.map((commit) => (
                                    <tr
                                        key={commit.hash}
                                        className={`group hover:bg-dark-700/30 transition-colors ${commit.isCurrent ? 'bg-emerald-500/10' : ''}`}
                                    >
                                        <td className="p-4 font-mono text-primary-400 text-xs flex items-center gap-2">
                                            <GitCommit size={14} />
                                            {commit.shortHash}
                                        </td>
                                        <td className="p-4 max-w-md">
                                            <p className="truncate font-medium text-white">{commit.message}</p>
                                        </td>
                                        <td className="p-4 text-dark-300">
                                            <div className="flex items-center gap-2">
                                                <User size={14} />
                                                {commit.author}
                                            </div>
                                        </td>
                                        <td className="p-4 text-dark-400 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {new Date(commit.date).toLocaleDateString()} {new Date(commit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            {commit.isCurrent ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                                                    <CheckCircle size={12} />
                                                    Current
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleRestoreClick(commit)}
                                                    className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-purple-600 hover:text-white text-dark-300 transition-all text-xs font-medium opacity-0 group-hover:opacity-100"
                                                >
                                                    Restore
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && selectedCommit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-full bg-red-500/20 text-red-500">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Confirm Restore</h3>
                                </div>

                                <p className="text-dark-300 mb-6">
                                    Are you sure you want to revert the system to commit <span className="font-mono text-primary-400">{selectedCommit.shortHash}</span>?
                                    <br /><br />
                                    <span className="text-white italic">"{selectedCommit.message}"</span>
                                    <br /><br />
                                    This will trigger a system restart.
                                </p>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        disabled={isRestoring}
                                        className="px-4 py-2 rounded-lg text-dark-300 hover:bg-dark-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmRestore}
                                        disabled={isRestoring}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isRestoring ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                Restoring...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw size={16} />
                                                Yes, Restore
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
