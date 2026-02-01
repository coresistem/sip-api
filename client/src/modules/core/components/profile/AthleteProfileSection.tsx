import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IdCard from './IdCard';
import {
    User, Mail, Calendar, Users, Building2, CreditCard, Phone,
    GraduationCap, Plus, ChevronDown, Shield, Loader2,
    History, Check, ExternalLink, School as SchoolIcon, AlertCircle, Trophy, Search
} from 'lucide-react';
import { calculateUnderAgeCategory, getAgeCategoryColor, formatAge, UnderAgeCategory } from '../../utils/ageCalculator';
import { UpdateProfileData, joinClub } from '../../services/profileApi';
import { PROVINCES, getCitiesByProvince } from '../../types/territoryData';
import IntegrationStatusBadge from '../ui/IntegrationStatusBadge';
import { api } from '../../contexts/AuthContext';

interface AthleteProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        whatsapp?: string;
        coreId?: string;
        nik?: string;
        nikVerified?: boolean;
        isStudent?: boolean;
        clubId?: string;
        dateOfBirth?: string;
        gender?: string;
        division?: string;
        provinceId?: string;
        cityId?: string;
        role?: string;
        avatarUrl?: string;
        isActive?: boolean;
    };
    onSave?: (data: UpdateProfileData) => Promise<boolean>;
    isSaving?: boolean;
}


const DIVISIONS = ['Barebow', 'Nasional', 'Recurve', 'Compound', 'Traditional'];
const GENDERS = ['Male', 'Female'];

interface AthleteData {
    email: string; // Notification email can be different from account email
    division: string;
    isStudent: boolean;
    schoolId: string;
    schoolSourceUrl: string;
    nisn: string;
    currentClass: string;
}

export default function AthleteProfileSection({ user, onSave, isSaving = false }: AthleteProfileSectionProps) {
    // Helper to get location names
    const provinceName = user.provinceId ? PROVINCES.find(p => p.id === user.provinceId)?.name : 'Province not set';
    const cities = user.provinceId ? getCitiesByProvince(user.provinceId) : [];
    const cityName = user.cityId ? cities.find(c => c.id === user.cityId)?.name : 'City not set';

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'school' | 'history' | 'idcard'>('profile');
    const [showSchoolSearch, setShowSchoolSearch] = useState(false);
    const [showAddSchool, setShowAddSchool] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    // Club Join State
    const [showClubSearch, setShowClubSearch] = useState(false);
    const [clubSearchTerm, setClubSearchTerm] = useState('');
    const [allClubs, setAllClubs] = useState<{ id: string; name: string; city: string }[]>([]);
    const [isJoiningClub, setIsJoiningClub] = useState(false);
    const [clubRequestStatus, setClubRequestStatus] = useState<'PENDING' | 'NONE'>('NONE');

    // Form state
    const [formData, setFormData] = useState<AthleteData>({
        email: user.email || '',
        division: user.division || '',
        isStudent: user.isStudent || false,
        schoolId: '',
        schoolSourceUrl: '', // Kemendikdasmen URL
        nisn: '',
        currentClass: '',
    });

    const [schoolSearch, setSchoolSearch] = useState('');

    const underAgeCategory: UnderAgeCategory | null = user.dateOfBirth
        ? calculateUnderAgeCategory(user.dateOfBirth)
        : null;

    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        switch (field) {
            case 'email': {
                if (!formData.email) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
                return null;
            }
            case 'division': return !formData.division ? 'Division is required' : null;
            case 'nisn': return (formData.isStudent && !formData.nisn) ? 'NISN is required' : null;
            case 'currentClass': return (formData.isStudent && !formData.currentClass) ? 'Class/Grade is required' : null;
            default: return null;
        }
    };

    const isFormValid = !getFieldError('email') && !getFieldError('division') &&
        (!formData.isStudent || (!getFieldError('nisn') && !getFieldError('currentClass')));

    const handleChange = (field: keyof AthleteData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clean up validation state if field is modified
        if (isValidationTriggered) {
            // We could refine this, but for now just leave it
        }
    };


    // Fetch clubs when search is active
    useEffect(() => {
        if (showClubSearch && allClubs.length === 0) {
            api.get('/auth/clubs').then(res => {
                setAllClubs(res.data.data);
            }).catch(err => console.error('Failed to fetch clubs', err));
        }
        // Also check if we have a pending request (this would ideally come from profile endpoint but we'll infer or just persist state locally for session)
    }, [showClubSearch, allClubs.length]);

    const handleJoinClub = async (clubId: string) => {
        if (isJoiningClub) return;
        setIsJoiningClub(true);
        try {
            const success = await joinClub(clubId);
            if (success) {
                setClubRequestStatus('PENDING');
                setShowClubSearch(false);
                // We rely on component refresh or local state to show "Pending" badge
                // Since this component uses props for user.clubId, we can't easily update that without parent refresh.
                // But we can show a temporary "Pending" UI.
            }
        } catch (error) {
            console.error('Join club error:', error);
            // Ideally toast here
        } finally {
            setIsJoiningClub(false);
        }
    };

    const handleSave = async () => {
        if (!isFormValid) {
            setIsValidationTriggered(true);
            return;
        }

        if (!onSave) {
            setIsEditing(false);
            return;
        }

        const updateData: UpdateProfileData = {
            isStudent: formData.isStudent,
            athleteData: {
                division: formData.division || undefined,
            },
            studentData: formData.isStudent ? {
                schoolId: formData.schoolId || undefined,
                nisn: formData.nisn || undefined,
                currentClass: formData.currentClass || undefined,
                schoolSourceUrl: formData.schoolSourceUrl || undefined
            } : undefined,
        };

        const success = await onSave(updateData);
        if (success) {
            setSaveSuccess(true);
            setIsEditing(false);
            setIsValidationTriggered(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-dark-700 pb-2 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'profile'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                        }`}
                >
                    <User size={18} />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('idcard')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'idcard'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                        }`}
                >
                    <CreditCard size={18} />
                    ID Card
                </button>
                {formData.isStudent && (
                    <button
                        onClick={() => setActiveTab('school')}
                        className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'school'
                            ? 'bg-dark-700 text-white'
                            : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        <GraduationCap size={18} />
                        School
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'history'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                        }`}
                >
                    <History size={18} />
                    History
                </button>
            </div>

            {/* Profile Tab */}
            <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <User className="w-5 h-5 text-primary-400" />
                                Personal Information
                            </h2>
                            <div className="flex items-center gap-2">
                                {saveSuccess && (
                                    <span className="text-sm text-green-400 flex items-center gap-1">
                                        <Check size={16} />
                                        Saved!
                                    </span>
                                )}
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={isSaving}
                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${isEditing
                                        ? 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50'
                                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : isEditing ? (
                                        'Save Changes'
                                    ) : (
                                        'Edit'
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div>
                                <label className="label">Email Pemberitahuan</label>
                                {isEditing ? (
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className={`input w-full ${getFieldError('email') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                            placeholder="Enter email"
                                        />
                                        {getFieldError('email') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('email')}</p>}
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3 bg-dark-900/50 border-white/5">
                                        <Mail className="w-5 h-5 text-dark-400" />
                                        <span>{formData.email || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Student Toggle */}
                            <div>
                                <label className="label">Student Status</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => isEditing && handleChange('isStudent', true)}
                                        disabled={!isEditing}
                                        className={`flex-1 p-3 rounded-lg border transition-all ${formData.isStudent
                                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                            : 'bg-dark-800 border-dark-700 text-dark-400'
                                            } ${isEditing ? 'cursor-pointer hover:border-primary-500/50' : 'cursor-not-allowed'}`}
                                    >
                                        <GraduationCap className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-sm">Student</span>
                                    </button>
                                    <button
                                        onClick={() => isEditing && handleChange('isStudent', false)}
                                        disabled={!isEditing}
                                        className={`flex-1 p-3 rounded-lg border transition-all ${!formData.isStudent
                                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                            : 'bg-dark-800 border-dark-700 text-dark-400'
                                            } ${isEditing ? 'cursor-pointer hover:border-amber-500/50' : 'cursor-not-allowed'}`}
                                    >
                                        <User className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-sm">Non-Student</span>
                                    </button>
                                </div>
                            </div>

                            {/* Date of Birth & Gender (Read Only Context) */}
                            <div>
                                <label className="label">Date of Birth</label>
                                <div className="input flex items-center gap-3 bg-dark-900/50 border-white/5 opacity-70">
                                    <Calendar className="w-5 h-5 text-dark-400" />
                                    <span>
                                        {user.dateOfBirth
                                            ? new Date(user.dateOfBirth).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })
                                            : 'Not set in Master Profile'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="label">Gender</label>
                                <div className="input flex items-center gap-3 bg-dark-900/50 border-white/5 opacity-70">
                                    <Users className="w-5 h-5 text-dark-400" />
                                    <span>{user.gender === 'MALE' ? 'Male' : user.gender === 'FEMALE' ? 'Female' : 'Not set'}</span>
                                </div>
                            </div>

                            {/* UnderAge Category - Auto Calculated */}
                            <div>
                                <label className="label">Age Category</label>
                                <div className="input flex items-center justify-between bg-dark-900/50 border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-dark-400" />
                                        <span>
                                            {user.dateOfBirth
                                                ? `${formatAge(user.dateOfBirth)} years old`
                                                : 'Set DOB in Master Profile'}
                                        </span>
                                    </div>
                                    {underAgeCategory && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAgeCategoryColor(underAgeCategory)}`}>
                                            {underAgeCategory}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Division */}
                            <div>
                                <label className="label">Division</label>
                                {isEditing ? (
                                    <div className="relative group">
                                        <select
                                            value={formData.division}
                                            onChange={(e) => handleChange('division', e.target.value)}
                                            className={`input w-full appearance-none cursor-pointer ${getFieldError('division') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                        >
                                            <option value="">Select Division</option>
                                            {DIVISIONS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                                        {getFieldError('division') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('division')}</p>}
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3 bg-dark-900/50 border-white/5">
                                        <Shield className="w-5 h-5 text-dark-400" />
                                        <span>{formData.division || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Club - With Integration Badge */}
                            <div>
                                <label className="label">Club</label>

                                {isEditing && !user.clubId && clubRequestStatus !== 'PENDING' ? (
                                    <div className="relative group z-20">
                                        <input
                                            type="text"
                                            value={clubSearchTerm}
                                            onChange={(e) => setClubSearchTerm(e.target.value)}
                                            onFocus={() => setShowClubSearch(true)}
                                            className="input w-full pl-10"
                                            placeholder="Search for a club to join..."
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />

                                        {showClubSearch && (
                                            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/5 bg-dark-800 max-h-60 overflow-y-auto shadow-2xl overflow-hidden">
                                                {allClubs
                                                    .filter(c => c.name.toLowerCase().includes(clubSearchTerm.toLowerCase()))
                                                    .map(club => (
                                                        <button
                                                            key={club.id}
                                                            onClick={() => handleJoinClub(club.id)}
                                                            disabled={isJoiningClub}
                                                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group/item border-b border-white/5 last:border-0"
                                                        >
                                                            <div>
                                                                <div className="font-medium text-white group-hover/item:text-primary-400 transition-colors">{club.name}</div>
                                                                <div className="text-xs text-dark-400">{club.city || 'No city'}</div>
                                                            </div>
                                                            <div className="opacity-0 group-hover/item:opacity-100 text-primary-400 text-xs font-bold uppercase tracking-wider">
                                                                {isJoiningClub ? 'Joining...' : 'Request to Join'}
                                                            </div>
                                                        </button>
                                                    ))}
                                                {allClubs.length === 0 && (
                                                    <div className="text-center p-4 text-dark-400 text-sm flex gap-2 justify-center items-center">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Loading clubs...
                                                    </div>
                                                )}
                                                {allClubs.length > 0 && allClubs.filter(c => c.name.toLowerCase().includes(clubSearchTerm.toLowerCase())).length === 0 && (
                                                    <div className="text-center p-4 text-dark-400 text-sm">
                                                        No clubs found matching "{clubSearchTerm}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        {!user.clubId && clubRequestStatus !== 'PENDING' && (
                                            <motion.div
                                                className="absolute -inset-[1px] rounded-xl border-2 border-amber-400/50 z-0 pointer-events-none"
                                                animate={{
                                                    opacity: [0.1, 0.8, 0.1],
                                                    boxShadow: [
                                                        "0 0 0px rgba(251, 191, 36, 0)",
                                                        "0 0 15px rgba(251, 191, 36, 0.4)",
                                                        "0 0 0px rgba(251, 191, 36, 0)"
                                                    ]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        )}
                                        <div className={`input flex items-center justify-between cursor-default bg-dark-900/50 border-white/5 relative z-10 ${!user.clubId ? 'border-amber-400/20' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <Building2 className={`w-5 h-5 ${!user.clubId ? 'text-amber-400/60' : 'text-dark-400'}`} />
                                                <span className={!user.clubId ? 'text-amber-400/80 font-medium' : ''}>
                                                    {user.clubId || (clubRequestStatus === 'PENDING' ? 'Request Pending' : 'Not assigned')}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <IntegrationStatusBadge
                                                status={user.clubId ? 'VERIFIED' : (clubRequestStatus === 'PENDING' ? 'PENDING' : 'UNLINKED')}
                                                orgName="Club"
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div >
                )
                }

                {/* School Tab */}
                {
                    activeTab === 'school' && formData.isStudent && (
                        <motion.div
                            key="school"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="card"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-primary-400" />
                                    School Information
                                </h2>
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={isSaving}
                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${isEditing
                                        ? 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50'
                                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : isEditing ? (
                                        'Save Changes'
                                    ) : (
                                        'Edit'
                                    )}
                                </button>
                            </div>

                            {/* School Search */}
                            <div className="space-y-4">
                                {/* Find School Button */}
                                <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-primary-400">Find Your School</p>
                                            <p className="text-xs text-dark-400 mt-1">
                                                Search for your school in the official Kemendikdasmen database, then paste the URL below.
                                            </p>
                                        </div>
                                        <a
                                            href="https://sekolah.data.kemendikdasmen.go.id/sekolah"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <ExternalLink size={16} />
                                            Open Kemendikdasmen
                                        </a>
                                    </div>
                                </div>

                                {/* School Source URL */}
                                <div>
                                    <label className="label">School Page URL (from Kemendikdasmen)</label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <input
                                                type="url"
                                                value={formData.schoolSourceUrl}
                                                onChange={(e) => handleChange('schoolSourceUrl', e.target.value)}
                                                className="input w-full"
                                                placeholder="https://sekolah.data.kemendikdasmen.go.id/sekolah/..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="input bg-dark-900/50 border-white/5 truncate">
                                            {formData.schoolSourceUrl || 'Not set'}
                                        </div>
                                    )}
                                    <p className="text-xs text-dark-500 mt-1">
                                        Paste your school's URL from Kemendikdasmen for SuperAdmin verification
                                    </p>
                                </div>

                                {/* Search in SIP */}
                                <div>
                                    <label className="label">Search School in SIP Database</label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={schoolSearch}
                                                onChange={(e) => setSchoolSearch(e.target.value)}
                                                onFocus={() => setShowSchoolSearch(true)}
                                                className="input w-full"
                                                placeholder="🔍 Search school by Core ID or name..."
                                            />

                                            {/* School Search Results */}
                                            {showSchoolSearch && schoolSearch && (
                                                <div className="mt-2 p-4 rounded-lg bg-dark-800 border border-dark-700">
                                                    <div className="flex items-center justify-between text-dark-400 mb-3">
                                                        <span className="text-sm">No school found in Core database</span>
                                                        <button
                                                            onClick={() => setShowAddSchool(true)}
                                                            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                                        >
                                                            <Plus size={14} />
                                                            Add New School
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="input bg-dark-900/50 border-white/5">
                                            {formData.schoolId || 'Search for a school during edit'}
                                        </div>
                                    )}
                                </div>

                                {/* NISN */}
                                <div>
                                    <label className="label">NISN (Nomor Induk Siswa Nasional)</label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={formData.nisn}
                                                onChange={(e) => handleChange('nisn', e.target.value)}
                                                className={`input w-full font-mono ${getFieldError('nisn') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                                placeholder="Enter NISN"
                                            />
                                            {getFieldError('nisn') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('nisn')}</p>}
                                        </div>
                                    ) : (
                                        <div className="input bg-dark-900/50 border-white/5 font-mono">
                                            {formData.nisn || 'Not set'}
                                        </div>
                                    )}
                                </div>

                                {/* Current Class */}
                                <div>
                                    <label className="label">Current Class/Grade</label>
                                    {isEditing ? (
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={formData.currentClass}
                                                onChange={(e) => handleChange('currentClass', e.target.value)}
                                                className={`input w-full ${getFieldError('currentClass') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                                placeholder="e.g., Kelas 10, SMA"
                                            />
                                            {getFieldError('currentClass') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('currentClass')}</p>}
                                        </div>
                                    ) : (
                                        <div className="input bg-dark-900/50 border-white/5">
                                            {formData.currentClass || 'Not set'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* History Tab */}
                {
                    activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* School History */}
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                                    School History
                                </h3>
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-sm min-w-[600px]">
                                        <thead>
                                            <tr className="border-b border-dark-700">
                                                <th className="text-left py-3 px-2">From School</th>
                                                <th className="text-left py-3 px-2">Domicile</th>
                                                <th className="text-left py-3 px-2">To School</th>
                                                <th className="text-left py-3 px-2">Domicile</th>
                                                <th className="text-left py-3 px-2">Date</th>
                                                <th className="text-left py-3 px-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-dark-400">
                                                    No school transfers recorded
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Club History */}
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-400" />
                                    Club History
                                </h3>
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-sm min-w-[600px]">
                                        <thead>
                                            <tr className="border-b border-dark-700">
                                                <th className="text-left py-3 px-2">From Club</th>
                                                <th className="text-left py-3 px-2">Domicile</th>
                                                <th className="text-left py-3 px-2">To Club</th>
                                                <th className="text-left py-3 px-2">Domicile</th>
                                                <th className="text-left py-3 px-2">Date</th>
                                                <th className="text-left py-3 px-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-dark-400">
                                                    No club transfers recorded
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-400" />
                                    Achievements
                                </h3>
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-sm min-w-[600px]">
                                        <thead>
                                            <tr className="border-b border-dark-700">
                                                <th className="text-left py-3 px-2">Year</th>
                                                <th className="text-left py-3 px-2">Level</th>
                                                <th className="text-left py-3 px-2">Achievement</th>
                                                <th className="text-left py-3 px-2">Division</th>
                                                <th className="text-left py-3 px-2">Distance</th>
                                                <th className="text-left py-3 px-2">Event</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-dark-400">
                                                    No achievements recorded
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            <AnimatePresence mode="wait">
                {activeTab === 'idcard' && (
                    <motion.div
                        key="idcard"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card flex flex-col items-center"
                    >
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 self-start">
                            <CreditCard className="w-5 h-5 text-primary-400" />
                            Digital ID Card
                        </h2>

                        <div className="py-8 w-full max-w-lg">
                            <IdCard
                                user={{
                                    name: user.name,
                                    coreId: user.coreId,
                                    role: user.role || 'ATHLETE',
                                    photoUrl: user.avatarUrl,
                                    clubName: user.clubId || 'Not set',
                                    provinceName: provinceName || 'Not set',
                                    cityName: cityName || 'Not set'
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add New School Modal reapplied complete */}
            <AnimatePresence>
                {showAddSchool && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddSchool(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <SchoolIcon className="w-5 h-5 text-primary-400" />
                                    Add New School
                                </h3>
                                <button onClick={() => setShowAddSchool(false)} className="text-dark-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-amber-400 font-medium">Search First</p>
                                        <p className="text-xs text-dark-400 mt-1">
                                            Search for your school at{' '}
                                            <a
                                                href="https://sekolah.data.kemendikdasmen.go.id/sekolah"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-400 underline"
                                            >
                                                Kemendikdasmen Database
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">School Website/Link (optional)</label>
                                    <input type="url" className="input w-full" placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="label">NPSN</label>
                                    <input type="text" className="input w-full" placeholder="8 digit NPSN" />
                                </div>
                                <div>
                                    <label className="label">School Name</label>
                                    <input type="text" className="input w-full" placeholder="Enter school name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Province</label>
                                        <select className="input w-full">
                                            <option value="">Select Province</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">City</label>
                                        <select className="input w-full">
                                            <option value="">Select City</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Address</label>
                                    <textarea className="input w-full" rows={2} placeholder="School address"></textarea>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddSchool(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 btn-primary">
                                    Create School
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function X({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    );
}
