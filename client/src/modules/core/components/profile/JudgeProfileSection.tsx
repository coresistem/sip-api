import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Phone, Mail, CreditCard, Award, Calendar, Target, ClipboardList, Building2
} from 'lucide-react';
import IntegrationStatusBadge from '../ui/IntegrationStatusBadge';

interface JudgeProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        coreId?: string;
        clubId?: string;
    };
    onUpdate?: (data: Partial<JudgeData>) => void;
}

interface JudgeData {
    email: string;
    phone: string;
    nik: string;
    dateOfBirth: string;
    gender: string;
    judgeLevel: string;
    licenseNumber: string;
    licenseExpiry: string;
    specialization: string[];
    eventsJudged: number;
    bio: string;
}

const JUDGE_LEVELS = ['Regional', 'National', 'Continental', 'International', 'World Archery'];
const JUDGE_SPECIALIZATIONS = ['Target', 'Field', '3D', 'Indoor', 'Para-Archery'];

export default function JudgeProfileSection({ user, onUpdate }: JudgeProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState<JudgeData>({
        email: user.email || '',
        phone: user.phone || '',
        nik: '',
        dateOfBirth: '',
        gender: '',
        judgeLevel: '',
        licenseNumber: '',
        licenseExpiry: '',
        specialization: [],
        eventsJudged: 0,
        bio: '',
    });

    const handleChange = (field: keyof JudgeData, value: string | string[] | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSpecialization = (spec: string) => {
        const current = formData.specialization;
        if (current.includes(spec)) {
            handleChange('specialization', current.filter(s => s !== spec));
        } else {
            handleChange('specialization', [...current, spec]);
        }
    };

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
    };

    const levelColors: Record<string, string> = {
        'Regional': 'text-blue-400',
        'National': 'text-green-400',
        'Continental': 'text-purple-400',
        'International': 'text-amber-400',
        'World Archery': 'text-red-400',
    };

    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        Judge / Referee Information
                    </h2>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-4 py-2 rounded-lg transition-all ${isEditing
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                    >
                        {isEditing ? 'Save Changes' : 'Edit'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                        <label className="label">Full Name</label>
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                            <User className="w-5 h-5 text-dark-400" />
                            <span>{user.name}</span>
                        </div>
                    </div>

                    {/* CORE ID */}
                    <div>
                        <label className="label">Judge CORE ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <CreditCard className="w-5 h-5 text-purple-400" />
                            <span className="text-purple-400">{user.coreId || 'Not generated'}</span>
                        </div>
                    </div>

                    {/* Affiliation / Club */}
                    <div className="md:col-span-2">
                        <label className="label">Affiliation (Club / Pengprov)</label>
                        <div className="relative group">
                            {!user.clubId && (
                                <motion.div
                                    className="absolute -inset-[1px] rounded-xl border-2 border-purple-400/50 z-0 pointer-events-none"
                                    animate={{
                                        opacity: [0.1, 0.8, 0.1],
                                        boxShadow: [
                                            "0 0 0px rgba(168, 85, 247, 0)",
                                            "0 0 15px rgba(168, 85, 247, 0.4)",
                                            "0 0 0px rgba(168, 85, 247, 0)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            )}
                            <div className={`input flex items-center justify-between cursor-default bg-dark-900/50 border-white/5 relative z-10 ${!user.clubId ? 'border-purple-400/20' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <Building2 className={`w-5 h-5 ${!user.clubId ? 'text-purple-400/60' : 'text-dark-400'}`} />
                                    <span className={!user.clubId ? 'text-purple-400/80 font-medium' : ''}>
                                        {user.clubId || 'Not assigned'}
                                    </span>
                                </div>

                                {/* Status Badge */}
                                <IntegrationStatusBadge
                                    status={user.clubId ? 'VERIFIED' : 'UNLINKED'}
                                    orgName="Organization"
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="label">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="input w-full"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Mail className="w-5 h-5 text-dark-400" />
                                <span>{formData.email || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="label">Phone / WhatsApp</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                placeholder="62812xxxxxx"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="input w-full"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Phone className="w-5 h-5 text-dark-400" />
                                <span>{formData.phone || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Events Judged */}
                    <div>
                        <label className="label">Total Events Judged</label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={formData.eventsJudged}
                                onChange={(e) => handleChange('eventsJudged', parseInt(e.target.value) || 0)}
                                className="input w-full"
                                min={0}
                            />
                        ) : (
                            <div className="input">
                                <span>{formData.eventsJudged} events</span>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                        <label className="label">Bio / About</label>
                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                className="input w-full"
                                rows={3}
                            />
                        ) : (
                            <div className="input min-h-[80px]">
                                <span>{formData.bio || 'Not set'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Certification & License */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    License & Certification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Judge Level</label>
                        {isEditing ? (
                            <select
                                value={formData.judgeLevel}
                                onChange={(e) => handleChange('judgeLevel', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Select Level</option>
                                {JUDGE_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        ) : (
                            <div className={`input font-semibold ${levelColors[formData.judgeLevel] || ''}`}>
                                <span>{formData.judgeLevel || 'Not certified'}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="label">License Number</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.licenseNumber}
                                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                                className="input w-full"
                            />
                        ) : (
                            <div className="input font-mono">
                                <span>{formData.licenseNumber || 'N/A'}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="label">Expiry Date</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formData.licenseExpiry}
                                onChange={(e) => handleChange('licenseExpiry', e.target.value)}
                                className="input w-full"
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-dark-400" />
                                <span>{formData.licenseExpiry || 'N/A'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Specialization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    Event Specialization
                </h2>

                <div className="flex flex-wrap gap-2">
                    {JUDGE_SPECIALIZATIONS.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => isEditing && toggleSpecialization(spec)}
                            disabled={!isEditing}
                            className={`px-4 py-2 rounded-lg border transition-all ${formData.specialization.includes(spec)
                                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                : 'bg-dark-800 border-dark-700 text-dark-400'
                                } ${isEditing ? 'cursor-pointer hover:border-purple-500/50' : 'cursor-not-allowed'}`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Recent Events */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary-400" />
                    Recent & Upcoming Events
                </h2>

                <div className="text-center py-8 text-dark-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No events assigned yet</p>
                </div>
            </motion.div>
        </div>
    );
}
