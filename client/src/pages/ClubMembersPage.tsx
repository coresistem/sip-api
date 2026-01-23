import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../context/AuthContext';
import {
    Search, Filter, Users, UserPlus, FileText, Check, X,
    ChevronRight, MoreHorizontal, Mail, Phone, Calendar
} from 'lucide-react';

interface Member {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
        phone?: string;
    };
    archeryCategory: string;
    skillLevel: string;
    createdAt: string; // Join Date
    _count?: {
        scores: number;
    };
}

interface JoinRequest {
    id: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
        phone?: string;
    };
    role: string;
    notes?: string;
}

export default function ClubMembersPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'members' | 'requests'>(location.state?.activeTab || 'members');
    const [members, setMembers] = useState<Member[]>([]);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'members') {
                const res = await api.get('/clubs/members');
                setMembers(res.data.data);
            } else {
                const res = await api.get('/clubs/member-requests');
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleApprove = async (id: string) => {
        try {
            await api.post(`/clubs/member-requests/${id}/approve`);
            setRequests(prev => prev.filter(r => r.id !== id));
            // Optional: Move to members list or show toast
        } catch (error) {
            console.error('Failed to approve:', error);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this request?')) return;
        try {
            await api.post(`/clubs/member-requests/${id}/reject`);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to reject:', error);
        }
    };

    // Filtered Members
    const filteredMembers = members.filter(m =>
        m.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Member Management</h1>
                    <p className="text-dark-400">Manage your club members and join requests</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <Users size={18} /> Members
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'} relative`}
                    >
                        <UserPlus size={18} /> Requests
                        {requests.length > 0 && activeTab !== 'requests' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="card overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="p-12 text-center text-dark-400">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                        Loading...
                    </div>
                ) : activeTab === 'members' ? (
                    <MembersList
                        members={filteredMembers}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onMemberClick={(id) => navigate(`/club/members/${id}`)}
                    />
                ) : (
                    <RequestsList
                        requests={requests}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
            </div>
        </div>
    );
}

function MembersList({ members, searchTerm, setSearchTerm, onMemberClick }: any) {
    return (
        <div>
            {/* Toolbar */}
            <div className="p-4 border-b border-dark-700/50 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-dark-800/50 text-dark-400 text-sm">
                        <tr>
                            <th className="p-4">Member</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Level</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-center">Sessions</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/50">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-dark-400">
                                    No members found.
                                </td>
                            </tr>
                        ) : (
                            members.map((m: Member) => (
                                <tr
                                    key={m.id}
                                    className="hover:bg-dark-700/30 transition-colors cursor-pointer group"
                                    onClick={() => onMemberClick(m.id)}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center font-bold text-white">
                                                {m.user.avatarUrl ? (
                                                    <img src={m.user.avatarUrl} alt={m.user.name} className="w-full h-full rounded-full object-cover" />
                                                ) : m.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white group-hover:text-primary-400 transition-colors">{m.user.name}</div>
                                                <div className="text-sm text-dark-400">{m.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="badge badge-primary">{m.archeryCategory}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="badge badge-secondary">{m.skillLevel}</span>
                                    </td>
                                    <td className="p-4 text-dark-400 text-sm">
                                        {new Date(m.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-mono">{m._count?.scores || 0}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-white transition-colors ml-auto" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RequestsList({ requests, onApprove, onReject }: any) {
    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-dark-400">
                <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">All Caught Up!</h3>
                <p>No pending join requests.</p>
            </div>
        );
    }

    return (
        <div className="p-6 grid gap-4">
            {requests.map((req: JoinRequest) => (
                <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-4 border border-dark-700 hover:border-dark-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center text-xl font-bold text-dark-300">
                            {req.user.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">{req.user.name}</h3>
                                <span className="badge badge-primary text-xs">{req.role}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 text-sm text-dark-400">
                                <span className="flex items-center gap-1"><Mail size={14} /> {req.user.email}</span>
                                {req.user.phone && <span className="flex items-center gap-1"><Phone size={14} /> {req.user.phone}</span>}
                                <span className="flex items-center gap-1"><Calendar size={14} /> Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                            {req.notes && (
                                <p className="mt-2 text-sm bg-dark-800/50 p-2 rounded text-dark-300 italic">
                                    "{req.notes}"
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => onReject(req.id)}
                            className="btn btn-secondary flex-1 md:flex-none text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-900/30"
                        >
                            <X size={18} /> Reject
                        </button>
                        <button
                            onClick={() => onApprove(req.id)}
                            className="btn btn-primary flex-1 md:flex-none bg-green-600 hover:bg-green-500 border-none text-white shadow-lg shadow-green-900/20"
                        >
                            <Check size={18} /> Approve
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
