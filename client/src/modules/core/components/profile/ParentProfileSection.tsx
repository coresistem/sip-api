import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Users, Phone, Mail, CreditCard, MapPin, Heart, Calendar, Check, Loader2
} from 'lucide-react';

interface ParentProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        coreId?: string;
    };
    onUpdate?: (data: Partial<ParentData>) => void;
}

interface ParentData {
    email: string;
    phone: string;
    nik: string;
    provinceId: string;
    cityId: string;
    address: string;
    occupation: string;
}

interface LinkedAthlete {
    id: string;
    name: string;
    coreId: string;
    relationship: string;
    club: string;
    division: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export default function ParentProfileSection({ user, onUpdate }: ParentProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isValidationTriggered, setIsValidationTriggered] = useState(false);

    const [formData, setFormData] = useState<ParentData>({
        email: user.email || '',
        phone: user.phone || '',
        nik: '',
        provinceId: '',
        cityId: '',
        address: '',
        occupation: '',
    });

    // Mock linked athletes
    const [linkedAthletes] = useState<LinkedAthlete[]>([]);

    const getFieldError = (field: string) => {
        if (!isValidationTriggered) return null;
        switch (field) {
            case 'email': {
                if (!formData.email) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
                return null;
            }
            case 'phone': return !formData.phone ? 'Phone is required' : null;
            case 'nik': {
                if (!formData.nik) return 'NIK is required';
                if (formData.nik.length !== 16) return 'NIK must be 16 digits';
                return null;
            }
            default: return null;
        }
    };

    const isFormValid = !getFieldError('email') && !getFieldError('phone') && !getFieldError('nik');

    const handleChange = (field: keyof ParentData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!isFormValid) {
            setIsValidationTriggered(true);
            return;
        }

        setIsSaving(true);
        // Simulate async save
        await new Promise(resolve => setTimeout(resolve, 800));

        onUpdate?.(formData);
        setIsEditing(false);
        setIsSaving(false);
        setIsValidationTriggered(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
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
                        <User className="w-5 h-5 text-pink-400" />
                        Parent Information
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
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70 bg-dark-900/50 border-white/5">
                            <User className="w-5 h-5 text-dark-400" />
                            <span>{user.name}</span>
                        </div>
                    </div>

                    {/* CORE ID */}
                    <div>
                        <label className="label">Parent CORE ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono border-white/5">
                            <CreditCard className="w-5 h-5 text-pink-400" />
                            <span className="text-pink-400">{user.coreId || 'Not generated'}</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="label">Email</label>
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

                    {/* Phone */}
                    <div>
                        <label className="label">Phone / WhatsApp</label>
                        {isEditing ? (
                            <div className="relative group">
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className={`input w-full ${getFieldError('phone') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                    placeholder="+62..."
                                />
                                {getFieldError('phone') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('phone')}</p>}
                            </div>
                        ) : (
                            <div className="input flex items-center gap-3 bg-dark-900/50 border-white/5">
                                <Phone className="w-5 h-5 text-dark-400" />
                                <span>{formData.phone || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* NIK */}
                    <div>
                        <label className="label">NIK (KTP)</label>
                        {isEditing ? (
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={(e) => handleChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    className={`input w-full font-mono ${getFieldError('nik') ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                                    placeholder="16 digit NIK"
                                    maxLength={16}
                                />
                                {getFieldError('nik') && <p className="text-[10px] text-red-500 ml-1 mt-1 animate-fade-in font-bold">{getFieldError('nik')}</p>}
                            </div>
                        ) : (
                            <div className="input flex items-center gap-3 bg-dark-900/50 border-white/5">
                                <CreditCard className="w-5 h-5 text-dark-400" />
                                <span className="font-mono">{formData.nik || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Occupation */}
                    <div>
                        <label className="label">Occupation</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.occupation}
                                onChange={(e) => handleChange('occupation', e.target.value)}
                                className="input w-full"
                                placeholder="e.g., Teacher, Engineer..."
                            />
                        ) : (
                            <div className="input bg-dark-900/50 border-white/5">
                                <span>{formData.occupation || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="label">Address</label>
                        {isEditing ? (
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="input w-full"
                                rows={2}
                                placeholder="Home address..."
                            />
                        ) : (
                            <div className="input flex items-center gap-3 bg-dark-900/50 border-white/5">
                                <MapPin className="w-5 h-5 text-dark-400" />
                                <span>{formData.address || 'Not set'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Linked Athletes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        My Athletes (Children)
                    </h2>
                    <button className="px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all">
                        + Link Athlete
                    </button>
                </div>

                {linkedAthletes.length > 0 ? (
                    <div className="space-y-3">
                        {linkedAthletes.map((athlete) => (
                            <div key={athlete.id} className="p-4 rounded-lg bg-dark-800/50 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{athlete.name}</p>
                                    <p className="text-sm text-dark-400">
                                        {athlete.relationship} • {athlete.club} • {athlete.division}
                                    </p>
                                </div>
                                <span className="text-xs font-mono text-primary-400">{athlete.coreId}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-dark-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No athletes linked yet</p>
                        <p className="text-sm mt-1">Link your child's athlete profile to manage their activities</p>
                    </div>
                )}
            </motion.div>

            {/* Activity Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    Activity Summary
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-primary-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Upcoming Events</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-green-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Trainings This Month</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-amber-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Total Achievements</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-blue-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Pending Payments</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
