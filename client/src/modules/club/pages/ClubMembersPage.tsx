import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../core/contexts/AuthContext';
import {
    Search, Filter, Users, UserPlus, FileText, Check, X,
    ChevronRight, MoreHorizontal, Mail, Phone, Calendar, MapPin, ChevronDown
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
    unit?: {
        id: string;
        name: string;
    };
    _count?: {
        scores: number;
    };
}

interface ClubUnit {
    id: string;
    name: string;
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
    const [units, setUnits] = useState<ClubUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUnitFilter, setSelectedUnitFilter] = useState('ALL');

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : null;
            const clubId = userData?.clubId;

            if (activeTab === 'members') {
                const [membersRes, unitsRes] = await Promise.all([
                    api.get('/clubs/members'),
                    clubId ? api.get(`/clubs/${clubId}/units`) : Promise.resolve({ data: { data: [] } })
                ]);
                setMembers(membersRes.data.data);
                setUnits(unitsRes.data.data);
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

    const handleAssignUnit = async (memberId: string, unitId: string | null) => {
        try {
            await api.post(`/athletes/${memberId}/unit`, { unitId });
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, unit: units.find(u => u.id === unitId) } : m));
        } catch (error) {
            console.error('Failed to assign unit:', error);
            alert('Failed to reassign member unit');
        }
    };

    // Filtered Members
    const filteredMembers = members.filter(m => {
        const matchesSearch = m.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUnit = selectedUnitFilter === 'ALL' || m.unit?.id === selectedUnitFilter;
        return matchesSearch && matchesUnit;
    });

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
                        units={units}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        unitFilter={selectedUnitFilter}
                        setUnitFilter={setSelectedUnitFilter}
                        onMemberClick={(id: string) => navigate(`/club/members/${id}`)}
                        onAssignUnit={handleAssignUnit}
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

function MembersList({ members, units, searchTerm, setSearchTerm, unitFilter, setUnitFilter, onMemberClick, onAssignUnit }: any) {
    return (
        <div>
            {/* Toolbar */}
            <div className="p-4 border-b border-dark-700/50 flex flex-wrap gap-4 bg-dark-800/20">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>

                <div className="flex items-center gap-2 bg-dark-800/50 px-3 py-1 rounded-lg border border-dark-700">
                    <MapPin size={14} className="text-dark-400" />
                    <select
                        value={unitFilter}
                        onChange={(e) => setUnitFilter(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold focus:ring-0 text-dark-300 py-1 cursor-pointer"
                    >
                        <option value="ALL">All Units</option>
                        {units.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <button className="btn btn-secondary flex items-center gap-2">
                    <Filter size={16} />
                    <span className="hidden sm:inline">More Filters</span>
                </button>
            </div>

            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-dark-800/50 text-dark-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">Member</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Level</th>
                            <th className="p-4">Unit / Venue</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-center">Sessions</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/30">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-dark-400">
                                    No members found.
                                </td>
                            </tr>
                        ) : (
                            members.map((m: Member) => (
                                <tr
                                    key={m.id}
                                    className="hover:bg-primary-500/5 transition-colors cursor-pointer group border-l-2 border-transparent hover:border-primary-500"
                                    onClick={() => onMemberClick(m.id)}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-900/10">
                                                {m.user.avatarUrl ? (
                                                    <img src={m.user.avatarUrl} alt={m.user.name} className="w-full h-full rounded-xl object-cover" />
                                                ) : m.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-primary-400 transition-colors">{m.user.name}</div>
                                                <div className="text-xs text-dark-400">{m.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="badge badge-primary text-[10px]">{m.archeryCategory}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="badge badge-secondary text-[10px]">{m.skillLevel}</span>
                                    </td>
                                    <td className="p-4">
                                        <div onClick={(e) => e.stopPropagation()} className="relative group/unit inline-block min-w-[120px]">
                                            <select
                                                value={m.unit?.id || ''}
                                                onChange={(e) => onAssignUnit(m.id, e.target.value || null)}
                                                className="bg-dark-800/40 border border-dark-700/50 rounded-lg text-[10px] font-bold py-1 px-2 pr-6 w-full hover:border-primary-500/50 transition-all appearance-none cursor-pointer text-dark-300 focus:outline-none"
                                            >
                                                <option value="">Unassigned</option>
                                                {units.map((u: any) => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-dark-500 group-hover/unit:text-primary-400">
                                                <ChevronDown size={10} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-dark-400 text-sm">
                                        {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-dark-800 text-dark-300 font-mono text-sm leading-none border border-dark-700">
                                            {m._count?.scores || 0}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <ChevronRight className="w-5 h-5 text-dark-600 group-hover:translate-x-1 group-hover:text-primary-400 transition-all ml-auto" />
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
