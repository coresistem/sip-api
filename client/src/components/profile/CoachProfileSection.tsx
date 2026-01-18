import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../context/AuthContext';
import {
    User, Users, Phone, Mail, CreditCard, Award, Building2, Calendar, Target,
    Upload, CheckCircle, Clock, XCircle, FileText, ExternalLink
} from 'lucide-react';

interface CoachProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        sipId?: string;
        clubId?: string;
    };
    onUpdate?: (data: Partial<CoachData>) => void;
}

interface CoachData {
    email: string;
    phone: string;
    nik: string;
    dateOfBirth: string;
    gender: string;
    specialization: string[];
    certificationLevel: string;
    certificationNumber: string;
    certificationExpiry: string;
    yearsExperience: number;
    bio: string;
}

interface CoachProfile {
    id: string;
    certificateUrl?: string;
    certificateLevel?: string;
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    verifiedAt?: string;
    rejectionReason?: string;
    bio?: string;
    yearsExperience?: number;
}

const SPECIALIZATIONS = ['Barebow', 'Nasional', 'Recurve', 'Compound', 'Traditional'];
const CERTIFICATION_LEVELS = ['Level 1', 'Level 2', 'Level 3', 'National', 'International'];

export default function CoachProfileSection({ user, onUpdate }: CoachProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CoachData>({
        email: user.email || '',
        phone: user.phone || '',
        nik: '',
        dateOfBirth: '',
        gender: '',
        specialization: [],
        certificationLevel: '',
        certificationNumber: '',
        certificationExpiry: '',
        yearsExperience: 0,
        bio: '',
    });

    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [certificatePreview, setCertificatePreview] = useState<string | null>(null);

    // Fetch coach profile on mount
    useEffect(() => {
        fetchCoachProfile();
    }, []);

    const fetchCoachProfile = async () => {
        try {
            const response = await api.get('/coaches/me');
            if (response.data.success && response.data.data) {
                setCoachProfile(response.data.data);
                // Populate form with existing data
                const profile = response.data.data;
                setFormData(prev => ({
                    ...prev,
                    certificationLevel: profile.certificateLevel || '',
                    yearsExperience: profile.yearsExperience || 0,
                    bio: profile.bio || '',
                }));
                if (profile.certificateUrl) {
                    setCertificatePreview(profile.certificateUrl);
                }
            }
        } catch (error) {
            console.error('Failed to fetch coach profile:', error);
        }
    };

    const handleChange = (field: keyof CoachData, value: string | string[] | number) => {
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCertificateFile(file);
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setCertificatePreview(e.target?.result as string);
                reader.readAsDataURL(file);
            } else {
                setCertificatePreview(null);
            }
        }
    };

    const uploadCertificate = async (): Promise<string | null> => {
        if (!certificateFile) return coachProfile?.certificateUrl || null;

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', certificateFile);
            formDataUpload.append('category', 'CERTIFICATE');

            const response = await api.post('/upload/document', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                return response.data.data.url;
            }
            return null;
        } catch (error) {
            console.error('Failed to upload certificate:', error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitCertification = async () => {
        setSubmitting(true);
        try {
            // Upload file first if selected
            const certificateUrl = await uploadCertificate();

            // Submit certification for verification
            const response = await api.post('/coaches/certification', {
                certificateUrl,
                certificateLevel: formData.certificationLevel,
                bio: formData.bio,
                yearsExperience: formData.yearsExperience,
            });

            if (response.data.success) {
                setCoachProfile(response.data.data);
                setCertificateFile(null);
                alert('Certification submitted for verification!');
            }
        } catch (error) {
            console.error('Failed to submit certification:', error);
            alert('Failed to submit certification');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
    };

    const getStatusBadge = () => {
        const status = coachProfile?.verificationStatus || 'UNVERIFIED';
        const configs = {
            UNVERIFIED: { icon: Clock, color: 'text-dark-400', bg: 'bg-dark-700', label: 'Not Submitted' },
            PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pending Verification' },
            VERIFIED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Verified by Perpani' },
            REJECTED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Rejected' },
        };
        const config = configs[status];
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
        );
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
                        <User className="w-5 h-5 text-green-400" />
                        Coach Information
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

                    {/* SIP ID */}
                    <div>
                        <label className="label">Coach SIP ID</label>
                        <div className="input flex items-center gap-3 bg-dark-800/50 font-mono">
                            <CreditCard className="w-5 h-5 text-green-400" />
                            <span className="text-green-400">{user.sipId || 'Not generated'}</span>
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

                    {/* Club */}
                    <div>
                        <label className="label">Club Affiliation</label>
                        <div className="input flex items-center gap-3 cursor-not-allowed opacity-70">
                            <Building2 className="w-5 h-5 text-dark-400" />
                            <span>{user.clubId || 'Not assigned'}</span>
                        </div>
                    </div>

                    {/* Years Experience */}
                    <div>
                        <label className="label">Years of Experience</label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={formData.yearsExperience}
                                onChange={(e) => handleChange('yearsExperience', parseInt(e.target.value) || 0)}
                                className="input w-full"
                                min={0}
                            />
                        ) : (
                            <div className="input">
                                <span>{formData.yearsExperience} years</span>
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
                                placeholder="Brief description about your coaching experience..."
                            />
                        ) : (
                            <div className="input min-h-[80px]">
                                <span>{formData.bio || 'Not set'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Specialization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    Specialization
                </h2>

                <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => isEditing && toggleSpecialization(spec)}
                            disabled={!isEditing}
                            className={`px-4 py-2 rounded-lg border transition-all ${formData.specialization.includes(spec)
                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                : 'bg-dark-800 border-dark-700 text-dark-400'
                                } ${isEditing ? 'cursor-pointer hover:border-primary-500/50' : 'cursor-not-allowed'}`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Certification & Verification */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        Certification & Verification
                    </h2>
                    {getStatusBadge()}
                </div>

                {/* Rejection Reason */}
                {coachProfile?.verificationStatus === 'REJECTED' && coachProfile.rejectionReason && (
                    <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm">
                            <strong>Rejection Reason:</strong> {coachProfile.rejectionReason}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="label">Certification Level</label>
                        <select
                            value={formData.certificationLevel}
                            onChange={(e) => handleChange('certificationLevel', e.target.value)}
                            className="input w-full"
                            disabled={coachProfile?.verificationStatus === 'VERIFIED'}
                        >
                            <option value="">Select Level</option>
                            {CERTIFICATION_LEVELS.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    {coachProfile?.verifiedAt && (
                        <div>
                            <label className="label">Verified On</label>
                            <div className="input flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                                <span className="text-emerald-400">
                                    {new Date(coachProfile.verifiedAt).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Certificate Upload */}
                {coachProfile?.verificationStatus !== 'VERIFIED' && (
                    <div className="mb-6">
                        <label className="label">Upload Certificate Document</label>
                        <div className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center hover:border-primary-500/50 transition-colors">
                            {certificatePreview ? (
                                <div className="space-y-4">
                                    {certificatePreview.startsWith('data:image') ? (
                                        <img
                                            src={certificatePreview}
                                            alt="Certificate Preview"
                                            className="max-h-48 mx-auto rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center gap-3">
                                            <FileText className="w-12 h-12 text-primary-400" />
                                            <span className="text-dark-300">
                                                {certificateFile?.name || 'Certificate uploaded'}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-primary-400 hover:text-primary-300"
                                    >
                                        Change file
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer"
                                >
                                    <Upload className="w-12 h-12 mx-auto text-dark-500 mb-3" />
                                    <p className="text-dark-400">
                                        Click to upload your coaching certificate
                                    </p>
                                    <p className="text-dark-500 text-sm mt-1">
                                        PDF, JPG, or PNG (max 5MB)
                                    </p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>
                )}

                {/* View Current Certificate */}
                {coachProfile?.certificateUrl && !certificateFile && (
                    <div className="mb-6">
                        <a
                            href={coachProfile.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Current Certificate
                        </a>
                    </div>
                )}

                {/* Submit Button */}
                {coachProfile?.verificationStatus !== 'VERIFIED' && (
                    <button
                        onClick={handleSubmitCertification}
                        disabled={submitting || uploading || !formData.certificationLevel}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting || uploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {uploading ? 'Uploading...' : 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <Award className="w-5 h-5" />
                                {coachProfile?.verificationStatus === 'REJECTED'
                                    ? 'Resubmit for Verification'
                                    : 'Submit for Perpani Verification'}
                            </>
                        )}
                    </button>
                )}

                {coachProfile?.verificationStatus === 'VERIFIED' && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-emerald-400 font-medium">Your certification has been verified by Perpani</p>
                    </div>
                )}
            </motion.div>

            {/* Athletes Under Coaching */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    Athletes Summary
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-primary-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Total Athletes</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-green-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Active</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-amber-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Sessions This Month</p>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                        <p className="text-3xl font-bold text-blue-400">0</p>
                        <p className="text-sm text-dark-400 mt-1">Upcoming Events</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

