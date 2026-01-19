import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, Check, User, FileText } from 'lucide-react';
import { api } from '../context/AuthContext';

// Role options (excluding roles that require special registration)
const ROLE_OPTIONS = [
    { value: 'COACH', label: 'Pelatih (Coach)', requiresCert: true },
    { value: 'JUDGE', label: 'Juri (Judge)', requiresCert: true },
    { value: 'PARENT', label: 'Orang Tua (Parent)', requiresCert: false },
    { value: 'EO', label: 'Event Organizer', requiresCert: true },
];

export default function AddRolePage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedRole, setSelectedRole] = useState('');
    const [nik, setNik] = useState('');
    const [nikFile, setNikFile] = useState<File | null>(null);
    const [certFile, setCertFile] = useState<File | null>(null);

    const selectedRoleInfo = ROLE_OPTIONS.find(r => r.value === selectedRole);

    const handleNikFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNikFile(e.target.files[0]);
        }
    };

    const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedRole || !nik || nik.length !== 16) {
            toast.error('NIK harus 16 digit');
            return;
        }

        if (!nikFile) {
            toast.error('Harap upload foto KTP');
            return;
        }

        if (selectedRoleInfo?.requiresCert && !certFile) {
            toast.error('Harap upload sertifikat');
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload NIK document first
            const nikFormData = new FormData();
            nikFormData.append('file', nikFile);
            nikFormData.append('category', 'KTP');
            const nikUploadRes = await api.post('/upload/document', nikFormData);
            const nikDocumentUrl = nikUploadRes.data.data?.url || nikUploadRes.data.url;

            // Upload certificate if required
            let certDocumentUrl = null;
            if (selectedRoleInfo?.requiresCert && certFile) {
                const certFormData = new FormData();
                certFormData.append('file', certFile);
                certFormData.append('category', 'CERTIFICATE');
                const certUploadRes = await api.post('/upload/document', certFormData);
                certDocumentUrl = certUploadRes.data.data?.url || certUploadRes.data.url;
            }

            // Submit role request
            await api.post('/role-requests', {
                requestedRole: selectedRole,
                nikDocumentUrl,
                certDocumentUrl,
            });

            setStep(3); // Success step
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Gagal mengajukan peran');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur border-b border-dark-700 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold text-white">Ajukan Peran Baru</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-dark-400'
                                }`}
                        >
                            {step > s ? <Check /> : s}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Role */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-white mb-2">Pilih Peran</h2>
                            <p className="text-dark-400">Pilih peran yang ingin Anda ajukan</p>
                        </div>

                        <div className="space-y-3">
                            {ROLE_OPTIONS.map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => setSelectedRole(role.value)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition ${selectedRole === role.value
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <User className={`w-5 h-5 ${selectedRole === role.value ? 'text-primary-400' : 'text-dark-400'}`} />
                                        <span className={selectedRole === role.value ? 'text-white' : 'text-dark-300'}>
                                            {role.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedRole}
                            className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanjut
                        </button>
                    </div>
                )}

                {/* Step 2: Upload Documents */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-white mb-2">Upload Dokumen</h2>
                            <p className="text-dark-400">Lengkapi data untuk verifikasi</p>
                        </div>

                        {/* NIK Input */}
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">NIK (16 digit)</label>
                            <input
                                type="text"
                                value={nik}
                                onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                placeholder="3273012345678901"
                                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none"
                            />
                            {nik && nik.length !== 16 && (
                                <p className="text-warning-400 text-sm mt-1">NIK harus 16 digit</p>
                            )}
                        </div>

                        {/* KTP Upload */}
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Foto KTP</label>
                            <label className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-dark-600 bg-dark-800 cursor-pointer hover:border-primary-500 transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleNikFileChange}
                                    className="hidden"
                                />
                                {nikFile ? (
                                    <div className="flex items-center gap-2 text-success-400">
                                        <Check />
                                        <span>{nikFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-dark-400">
                                        <Upload />
                                        <span>Upload foto KTP</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Certificate Upload (if required) */}
                        {selectedRoleInfo?.requiresCert && (
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Sertifikat</label>
                                <label className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-dark-600 bg-dark-800 cursor-pointer hover:border-primary-500 transition">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleCertFileChange}
                                        className="hidden"
                                    />
                                    {certFile ? (
                                        <div className="flex items-center gap-2 text-success-400">
                                            <Check />
                                            <span>{certFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-dark-400">
                                            <FileText />
                                            <span>Upload sertifikat {selectedRoleInfo.label}</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 rounded-xl bg-dark-700 text-white font-semibold"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !nik || nik.length !== 16 || !nikFile}
                                className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Ajukan'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-success-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Pengajuan Terkirim!</h2>
                        <p className="text-dark-400 mb-8">
                            Pengajuan Anda akan dipertimbangkan oleh admin.<br />
                            Anda akan mendapat notifikasi setelah diproses.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 rounded-xl bg-primary-500 text-white font-semibold"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
