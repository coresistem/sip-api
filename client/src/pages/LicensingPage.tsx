import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Award,
    Search,
    Plus,
    Loader2,
    Calendar,
    User,
    Building2,
    CheckCircle,
    Clock,
    XCircle,
    Download
} from 'lucide-react';
import { api } from '../context/AuthContext';

interface License {
    id: string;
    type: 'KTA' | 'STTKO';
    holderName: string;
    holderType: 'ATHLETE' | 'COACH';
    clubName: string;
    licenseNumber: string;
    issueDate: string;
    expiryDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'REVOKED';
}

interface LicenseStats {
    totalKTA: number;
    totalSTTKO: number;
    pendingApprovals: number;
    expiringThisMonth: number;
}

// Mock data
const MOCK_STATS: LicenseStats = {
    totalKTA: 1234,
    totalSTTKO: 89,
    pendingApprovals: 15,
    expiringThisMonth: 23
};

const MOCK_LICENSES: License[] = [
    {
        id: '1',
        type: 'KTA',
        holderName: 'Ahmad Santoso',
        holderType: 'ATHLETE',
        clubName: 'Klub Panahan Bandung',
        licenseNumber: 'KTA-2026-001234',
        issueDate: '2026-01-01',
        expiryDate: '2027-12-31',
        status: 'ACTIVE'
    },
    {
        id: '2',
        type: 'STTKO',
        holderName: 'Budi Prasetyo',
        holderType: 'COACH',
        clubName: 'Archery Club Jakarta',
        licenseNumber: 'STTKO-2026-000089',
        issueDate: '2026-01-05',
        expiryDate: '2028-01-04',
        status: 'ACTIVE'
    },
    {
        id: '3',
        type: 'KTA',
        holderName: 'Citra Dewi',
        holderType: 'ATHLETE',
        clubName: 'Perpani Surabaya',
        licenseNumber: 'KTA-2025-001100',
        issueDate: '2025-02-01',
        expiryDate: '2025-12-31',
        status: 'EXPIRED'
    },
    {
        id: '4',
        type: 'KTA',
        holderName: 'Dian Permata',
        holderType: 'ATHLETE',
        clubName: 'Klub Busur Yogya',
        licenseNumber: 'KTA-2026-PENDING',
        issueDate: '',
        expiryDate: '',
        status: 'PENDING'
    }
];

export default function LicensingPage() {
    const [loading, setLoading] = useState(true);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [stats, setStats] = useState<LicenseStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, licensesRes] = await Promise.all([
                api.get('/perpani/licensing/stats'),
                api.get('/perpani/licenses')
            ]);
            setStats(statsRes.data || MOCK_STATS);
            setLicenses(licensesRes.data?.length > 0 ? licensesRes.data : MOCK_LICENSES);
        } catch (error) {
            console.log('Using mock data');
            setStats(MOCK_STATS);
            setLicenses(MOCK_LICENSES);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (id: string) => {
        setLicenses(prev => prev.map(l =>
            l.id === id ? {
                ...l,
                status: 'ACTIVE',
                issueDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                licenseNumber: l.type === 'KTA' ? `KTA-2026-${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}` : `STTKO-2026-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`
            } : l
        ));
    };

    const filteredLicenses = licenses.filter(l => {
        const matchesSearch = l.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'ALL' || l.type === typeFilter;
        const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle };
            case 'PENDING': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock };
            case 'EXPIRED': return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle };
            case 'REVOKED': return { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: XCircle };
            default: return { bg: 'bg-dark-700', text: 'text-dark-400', icon: Clock };
        }
    };

    const getTypeBadge = (type: string) => {
        return type === 'KTA'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-purple-500/20 text-purple-400';
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
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">
                        <span className="gradient-text">Licensing</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Manage KTA and STTKO certificates
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Issue New License
                </button>
            </motion.div>

            {/* Stats */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <div className="card p-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                            <Award className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.totalKTA.toLocaleString()}</div>
                        <div className="text-sm text-dark-400">Active KTA</div>
                    </div>
                    <div className="card p-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                            <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.totalSTTKO}</div>
                        <div className="text-sm text-dark-400">Active STTKO</div>
                    </div>
                    <div className="card p-4">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.pendingApprovals}</div>
                        <div className="text-sm text-dark-400">Pending</div>
                    </div>
                    <div className="card p-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                            <Calendar className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.expiringThisMonth}</div>
                        <div className="text-sm text-dark-400">Expiring Soon</div>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search by name or license number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'KTA', 'STTKO'].map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${typeFilter === type
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'PENDING', 'EXPIRED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${statusFilter === status
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Licenses List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                {filteredLicenses.length === 0 ? (
                    <div className="p-12 text-center">
                        <Award className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No Licenses Found</h3>
                        <p className="text-dark-400">No licenses match your filters.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {filteredLicenses.map(license => {
                            const statusBadge = getStatusBadge(license.status);
                            const StatusIcon = statusBadge.icon;
                            return (
                                <div key={license.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${license.type === 'KTA' ? 'bg-blue-500/20' : 'bg-purple-500/20'} flex items-center justify-center`}>
                                                <Award className={`w-6 h-6 ${license.type === 'KTA' ? 'text-blue-400' : 'text-purple-400'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{license.holderName}</span>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeBadge(license.type)}`}>
                                                        {license.type}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-dark-400">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        <span>{license.holderType}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        <span>{license.clubName}</span>
                                                    </div>
                                                    <span className="font-mono text-xs">{license.licenseNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {license.status === 'ACTIVE' && (
                                                <div className="text-right text-sm">
                                                    <div className="text-dark-400">Expires</div>
                                                    <div className="text-white">{new Date(license.expiryDate).toLocaleDateString('id-ID')}</div>
                                                </div>
                                            )}
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {license.status}
                                            </span>
                                            {license.status === 'ACTIVE' && (
                                                <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                            {license.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleApprove(license.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
