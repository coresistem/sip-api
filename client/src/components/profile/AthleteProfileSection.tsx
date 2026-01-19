import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IdCard from './IdCard';
import {
    User, Mail, Calendar, Users, Building2, CreditCard, Phone,
    GraduationCap, Plus, ChevronDown, Shield, Loader2,
    History, Check, ExternalLink, School as SchoolIcon, AlertCircle, Trophy
} from 'lucide-react';
import { calculateUnderAgeCategory, getAgeCategoryColor, formatAge, UnderAgeCategory } from '../../utils/ageCalculator';
import { UpdateProfileData } from '../../services/profileApi';
import { PROVINCES, getCitiesByProvince } from '../../types/territoryData';

interface AthleteProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        whatsapp?: string;
        sipId?: string;
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
    email: string;
    dateOfBirth: string;
    gender: string;
    division: string;
    nik: string;
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

    // Form state
    const [formData, setFormData] = useState<AthleteData>({
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender === 'MALE' ? 'Male' : user.gender === 'FEMALE' ? 'Female' : '',
        division: user.division || '',
        nik: user.nik || '',
        isStudent: user.isStudent || false,
        schoolId: '',
        schoolSourceUrl: '', // Kemendikdasmen URL
        nisn: '',
        currentClass: '',
    });





    const [schoolSearch, setSchoolSearch] = useState('');

    const underAgeCategory: UnderAgeCategory | null = formData.dateOfBirth
        ? calculateUnderAgeCategory(formData.dateOfBirth)
        : null;

    const handleChange = (field: keyof AthleteData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!onSave) {
            setIsEditing(false);
            return;
        }

        const updateData: UpdateProfileData = {
            nik: formData.nik || undefined,
            isStudent: formData.isStudent,
            athleteData: {
                dateOfBirth: formData.dateOfBirth || undefined,
                gender: formData.gender === 'Male' ? 'MALE' : formData.gender === 'Female' ? 'FEMALE' : undefined,
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
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-dark-700 pb-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'profile'
                        ? 'bg-dark-700 text-white'
                        : 'text-dark-400 hover:text-white'
                        }`}
                >
                    <User size={18} />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('idcard')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'idcard'
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
                        className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'school'
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
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'history'
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
                            {/* Full Name - Read Only */}
                            <div>
                                <label className="label">Full Name</label>
                                <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                                    <User className="w-5 h-5 text-dark-400" />
                                    <span>{user.name}</span>
                                </div>
                            </div>

                            {/* SIP ID - Read Only */}
                            <div>
                                <label className="label">SIP ID</label>
                                <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                                    <CreditCard className="w-5 h-5 text-dark-400" />
                                    <span className="font-mono text-primary-400">{user.sipId || 'Not set'}</span>
                                </div>
                            </div>

                            {/* WhatsApp - Read Only */}
                            <div>
                                <label className="label">WhatsApp</label>
                                <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                                    <Phone className="w-5 h-5 text-dark-400" />
                                    <span>{user.whatsapp || 'Not set'}</span>
                                    {user.whatsapp && (
                                        <a
                                            href={`https://wa.me/${user.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center gap-1"
                                        >
                                            Chat <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Location - Read Only */}
                            <div className="md:col-span-2">
                                <label className="label">Location (Province / City)</label>
                                <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                                    <Building2 className="w-5 h-5 text-dark-400" />
                                    <span>
                                        {provinceName} / {cityName}
                                    </span>
                                </div>
                                <p className="text-xs text-dark-500 mt-1">Location is based on KTP/KK and cannot be changed.</p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="label">Email</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 z-10" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="input w-full"
                                            style={{ paddingLeft: '2.75rem' }}
                                            placeholder="Enter email"
                                        />
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3">
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

                            {/* Date of Birth */}
                            <div>
                                <label className="label">Date of Birth</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 z-10" />
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                            className="input w-full"
                                            style={{ paddingLeft: '2.75rem' }}
                                        />
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-dark-400" />
                                        <span>
                                            {formData.dateOfBirth
                                                ? new Date(formData.dateOfBirth).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })
                                                : 'Not set'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* UnderAge Category - Auto Calculated */}
                            <div>
                                <label className="label">Age Category</label>
                                <div className="input flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-dark-400" />
                                        <span>
                                            {formData.dateOfBirth
                                                ? `${formatAge(formData.dateOfBirth)} years old`
                                                : 'Set DOB first'}
                                        </span>
                                    </div>
                                    {underAgeCategory && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAgeCategoryColor(underAgeCategory)}`}>
                                            {underAgeCategory}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="label">Gender</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className="input w-full appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Gender</option>
                                            {GENDERS.map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3">
                                        <Users className="w-5 h-5 text-dark-400" />
                                        <span>{formData.gender || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Division */}
                            <div>
                                <label className="label">Division</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <select
                                            value={formData.division}
                                            onChange={(e) => handleChange('division', e.target.value)}
                                            className="input w-full appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Division</option>
                                            {DIVISIONS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="input flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-dark-400" />
                                        <span>{formData.division || 'Not set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Club - Read Only */}
                            <div>
                                <label className="label">Club</label>
                                <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                                    <Building2 className="w-5 h-5 text-dark-400" />
                                    <span>{user.clubId || 'Not assigned'}</span>
                                    {user.clubId && (
                                        <span className="ml-auto px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* NIK */}
                            <div className="md:col-span-2">
                                <label className="label">NIK (Nomor Induk Kependudukan)</label>
                                {isEditing ? (
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 z-10" />
                                        <input
                                            type="text"
                                            value={formData.nik}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                handleChange('nik', value);
                                            }}
                                            className="input w-full font-mono"
                                            style={{ paddingLeft: '2.75rem' }}
                                            placeholder="16 digit NIK"
                                            maxLength={16}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-dark-400">
                                            {formData.nik.length}/16
                                        </span>
                                    </div>
                                ) : (
                                    <div className="input flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-dark-400" />
                                            <span className="font-mono">
                                                {formData.nik || 'Not set'}
                                            </span>
                                        </div>
                                        {formData.nik && (
                                            <span className={`px-2 py-0.5 rounded text-xs ${user.nikVerified
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {user.nikVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        )}
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
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-primary-400" />
                                School Information
                            </h2>

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
                                    <input
                                        type="url"
                                        value={formData.schoolSourceUrl}
                                        onChange={(e) => handleChange('schoolSourceUrl', e.target.value)}
                                        className="input w-full"
                                        placeholder="https://sekolah.data.kemendikdasmen.go.id/sekolah/..."
                                    />
                                    <p className="text-xs text-dark-500 mt-1">
                                        Paste your school's URL from Kemendikdasmen for SuperAdmin verification
                                    </p>
                                </div>

                                {/* Search in SIP */}
                                <div>
                                    <label className="label">Search School in SIP Database</label>
                                    <input
                                        type="text"
                                        value={schoolSearch}
                                        onChange={(e) => setSchoolSearch(e.target.value)}
                                        onFocus={() => setShowSchoolSearch(true)}
                                        className="input w-full"
                                        placeholder="🔍 Search school by SIP ID or name..."
                                    />

                                    {/* School Search Results */}
                                    {showSchoolSearch && schoolSearch && (
                                        <div className="mt-2 p-4 rounded-lg bg-dark-800 border border-dark-700">
                                            <div className="flex items-center justify-between text-dark-400 mb-3">
                                                <span className="text-sm">No school found in SIP database</span>
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

                                {/* NISN */}
                                <div>
                                    <label className="label">NISN (Nomor Induk Siswa Nasional)</label>
                                    <input
                                        type="text"
                                        value={formData.nisn}
                                        onChange={(e) => handleChange('nisn', e.target.value)}
                                        className="input w-full font-mono"
                                        placeholder="Enter NISN"
                                    />
                                </div>

                                {/* Current Class */}
                                <div>
                                    <label className="label">Current Class/Grade</label>
                                    <input
                                        type="text"
                                        value={formData.currentClass}
                                        onChange={(e) => handleChange('currentClass', e.target.value)}
                                        className="input w-full"
                                        placeholder="e.g., Kelas 10, SMA"
                                    />
                                </div>
                            </div>

                            {/* Add New School Modal */}
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
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <SchoolIcon className="w-5 h-5 text-primary-400" />
                                                Add New School
                                            </h3>

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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
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

                        <div className="py-8">
                            <IdCard
                                user={{
                                    name: user.name,
                                    sipId: user.sipId,
                                    role: user.role || 'ATHLETE',
                                    provinceName: provinceName,
                                    cityName: cityName,
                                    photoUrl: user.avatarUrl,
                                    status: user.isActive !== false ? 'ACTIVE' : 'INACTIVE',
                                    division: user.division,
                                    clubName: user.clubId
                                }}
                            />
                        </div>

                        <div className="text-center max-w-md mt-4 text-sm text-dark-400">
                            <p>This is your official digital ID card. Tap the card to view the back with your verification QR code.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
