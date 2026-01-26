import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield, User, MapPin, Phone, Mail, Calendar, Award,
    Check, X, Clock, AlertTriangle, Building2, Users, Loader2
} from 'lucide-react';
import { ROLE_CODE_TO_NAME, parseSipId } from '../../core/types/territory';
import { getProvinceById, getCityById } from '../../core/types/territoryData';
import axios from 'axios';

// API URL from env or default
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Role status interface
interface RoleStatus {
    role: string;
    sipId: string;
    status: string;
    verifiedBy?: string;
    verifiedAt?: string;
    proposedTo?: string;
}

interface UserData {
    sipId: string;
    name: string;
    photo: string | null;
    email: string;
    phone: string;
    gender: string;
    birthDate: string;
    address: string;
    roles: RoleStatus[];
    club: string;
    achievements: { title: string; position: string }[];
}

type IDStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PROPOSED' | 'PENDING';

const STATUS_CONFIG: Record<IDStatus, { color: string; bgColor: string; icon: typeof Check; label: string }> = {
    ACTIVE: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30', icon: Check, label: 'Active' },
    INACTIVE: { color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/30', icon: X, label: 'Not Active' },
    SUSPENDED: { color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30', icon: AlertTriangle, label: 'Suspended' },
    PROPOSED: { color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/30', icon: Clock, label: 'Proposed' },
    PENDING: { color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/30', icon: Clock, label: 'Pending' },
};

export default function ProfileVerificationPage() {
    const { sipId } = useParams<{ sipId: string }>();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Decode the SIP ID from URL (replace - with .)
    const decodedSipId = sipId?.replace(/-/g, '.') || '';

    // Parse SIP ID for display
    const parsedId = parseSipId(decodedSipId);
    const province = parsedId ? getProvinceById(parsedId.provinceId) : null;
    const city = parsedId ? getCityById(`${parsedId.provinceId}${parsedId.cityCode}`) : null;

    useEffect(() => {
        const fetchData = async () => {
            if (!decodedSipId) return;

            setLoading(true);
            try {
                // Use plain axios or fetch to avoid AuthContext interceptors if simpler
                const response = await axios.get(`${API_URL}/public/verify/${decodedSipId}`);
                if (response.data.success) {
                    setUserData(response.data.data);
                } else {
                    setError('ID Not Found');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('ID Not Found in System');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [decodedSipId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <X size={48} className="text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">ID Not Found</h1>
                    <p className="text-dark-400 mb-4">SIP ID: {decodedSipId}</p>
                    <p className="text-dark-500 text-sm">{error || 'This ID does not exist in our system.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header with Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <img src="/logo.png" alt="SIP Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-primary-400">Csystem</h1>
                    <p className="text-sm text-dark-400">Profile Verification</p>
                </motion.div>

                {/* Main Card - CV Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6">
                        <div className="flex items-center gap-4">
                            {/* Photo */}
                            <div className="w-24 h-24 rounded-xl bg-dark-800 border-4 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {userData.photo ? (
                                    <img src={userData.photo} alt={userData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-white">{userData.name.charAt(0)}</span>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 text-white">
                                <h2 className="text-2xl font-bold">{userData.name}</h2>
                                <p className="text-white/80 font-mono text-lg">{userData.sipId}</p>
                                {(province || city) && (
                                    <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                                        <MapPin size={14} />
                                        {city?.name}, {province?.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="p-6 border-b border-dark-700">
                        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail size={16} className="text-primary-400" />
                                <span>{userData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone size={16} className="text-primary-400" />
                                <span>{userData.phone}</span>
                            </div>
                            {userData.birthDate && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar size={16} className="text-primary-400" />
                                    <span>{new Date(userData.birthDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <Building2 size={16} className="text-primary-400" />
                                <span>{userData.club || 'No Club'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Role Statuses */}
                    <div className="p-6 border-b border-dark-700">
                        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Users size={16} />
                            Role Status
                        </h3>
                        <div className="space-y-3">
                            {userData.roles.map((role, idx) => {
                                const statusKey = (role.status in STATUS_CONFIG) ? role.status as IDStatus : 'INACTIVE';
                                const statusConfig = STATUS_CONFIG[statusKey];
                                const StatusIcon = statusConfig.icon;
                                const roleLabel = ROLE_CODE_TO_NAME[role.sipId.substring(0, 2)] || role.role;

                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border ${statusConfig.bgColor}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Shield size={18} className={statusConfig.color} />
                                                <span className="font-semibold">{roleLabel}</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${statusConfig.color}`}>
                                                <StatusIcon size={16} />
                                                <span className="text-sm font-medium">{statusConfig.label}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-mono text-dark-400">{role.sipId}</p>
                                        {role.status === 'ACTIVE' && role.verifiedBy && (
                                            <p className="text-xs text-dark-400 mt-1">
                                                Verified by {role.verifiedBy} on {role.verifiedAt ? new Date(role.verifiedAt).toLocaleDateString('id-ID') : '-'}
                                            </p>
                                        )}
                                        {role.status === 'PROPOSED' && role.proposedTo && (
                                            <p className="text-xs text-dark-400 mt-1">
                                                Pending approval from {role.proposedTo}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Achievements */}
                    {userData.achievements && userData.achievements.length > 0 && (
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Award size={16} />
                                Achievements
                            </h3>
                            <div className="space-y-2">
                                {userData.achievements.map((ach, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                                        <span className="text-sm">{ach.title}</span>
                                        <span className="text-xs font-medium text-amber-400">{ach.position}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="bg-dark-900/50 px-6 py-4 text-center">
                        <p className="text-xs text-dark-500">
                            Verified by Csystem • Sistem Integrasi Panahan
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
