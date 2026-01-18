import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Users, Phone, Mail, CreditCard, MapPin, Heart, Calendar
} from 'lucide-react';

interface ParentProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        sipId?: string;
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
    sipId: string;
    relationship: string;
    club: string;
    division: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export default function ParentProfileSection({ user, onUpdate }: ParentProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);

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

    const handleChange = (field: keyof ParentData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
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
                    {/* Full Name - Read Only */}
                    <div>
                        <label className="label">Full Name</label>
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                            <User className="w-5 h-5 text-dark-400" />
                            <span>{user.name}</span>
                        </div>
                    </div>

                    {/* SIP ID */}
                    <div>
                        <label className="label">Parent SIP ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <CreditCard className="w-5 h-5 text-pink-400" />
                            <span className="text-pink-400">{user.sipId || 'Not generated'}</span>
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
                                placeholder="Enter email"
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
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="input w-full"
                                placeholder="+62..."
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
                                <Phone className="w-5 h-5 text-dark-400" />
                                <span>{formData.phone || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    {/* NIK */}
                    <div>
                        <label className="label">NIK (KTP)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.nik}
                                onChange={(e) => handleChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                className="input w-full font-mono"
                                placeholder="16 digit NIK"
                                maxLength={16}
                            />
                        ) : (
                            <div className="input flex items-center gap-3">
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
                            <div className="input">
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
                            <div className="input flex items-center gap-3">
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
                                <span className="text-xs font-mono text-primary-400">{athlete.sipId}</span>
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
