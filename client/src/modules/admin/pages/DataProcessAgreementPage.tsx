import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    FileSignature,
    Printer,
    ShieldCheck,
    Scale,
    Gavel,
    Download,
    Eye,
    CheckCircle2,
    Calendar,
    MapPin,
    Hash,
    QrCode,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/modules/core/contexts/AuthContext';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'react-toastify';
import AnimatedHexLogo from '@/modules/core/components/ui/AnimatedHexLogo';
import SIPText from '@/modules/core/components/ui/SIPText';
import AgreementPDFV2 from '../components/AgreementPDFv2';

import QRCode from 'qrcode';

import { useProfile } from '@/modules/core/hooks/useProfile';

const DataProcessAgreementPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { profile } = useProfile();
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [systemQrUrl, setSystemQrUrl] = useState('');
    const [userQrUrl, setUserQrUrl] = useState('');

    // Auto-generated Agreement Number: SIP/LEGAL/YYYYMMDD/RANDOM
    const agreementNumber = useMemo(() => {
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `SIP/LEGAL/${datePart}/${randomSuffix}`;
    }, [user]);

    // Generate QR Codes for UI Display
    useEffect(() => {
        const generateQrs = async () => {
            try {
                // 1. System QR (Static / System Auth) - High Error Correction
                const sysUrl = await QRCode.toDataURL(`${window.location.origin}/verify/SYSTEM-AUTH-CL01`, {
                    width: 200, margin: 1, color: { dark: '#0f172a', light: '#ffffff' },
                    errorCorrectionLevel: 'H'
                });
                setSystemQrUrl(sysUrl);

                // 2. User QR (Document Specific)
                const verificationUrl = `${window.location.origin}/verify/${encodeURIComponent(agreementNumber)}`;
                const usrUrl = await QRCode.toDataURL(verificationUrl, {
                    width: 200, margin: 1, color: { dark: '#0f172a', light: '#ffffff' }
                });
                setUserQrUrl(usrUrl);
            } catch (err) {
                console.error("QR Gen Error", err);
            }
        };
        generateQrs();
    }, [agreementNumber]);

    // Check for existing signature on mount
    useEffect(() => {
        if (user?.id) {
            const stored = localStorage.getItem(`SIP_DPA_AGREED_${user.id}`);
            if (stored) {
                setSaveSuccess(true);
                setIsAgreed(true);
            }
        }
    }, [user?.id]);

    const handleDownload = async () => {
        const toastId = toast.loading(`Generating secure PDF Agreement (v2)...`, {
            position: "bottom-right",
            theme: "dark"
        });

        try {
            const verificationUrl = `${window.location.origin}/verify/${encodeURIComponent(agreementNumber)}`;
            const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
                width: 100,
                margin: 2,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            });

            const activeUser = profile?.user || user;
            const coreId = activeUser?.coreId || "00.9999.0001";

            const pdfData = {
                agreementNumber: agreementNumber,
                currentDate: currentDate,
                user: {
                    name: activeUser?.name || "PENGGUNA",
                    coreId: activeUser?.coreId || coreId,
                    whatsapp: (activeUser as any)?.whatsapp || (activeUser as any)?.phone || "-",
                    role: activeUser?.role || "USER",
                    qrCodeDataUrl: qrCodeDataUrl
                },
                pasals: PasalsData
            };

            const blob = await pdf(<AgreementPDFV2 data={pdfData} />).toBlob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Signed_Agreement_${agreementNumber.replace(/\//g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.update(toastId, {
                render: `Agreement has been downloaded as PDF.`,
                type: "success",
                isLoading: false,
                autoClose: 3000,
                closeButton: true
            });
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.update(toastId, {
                render: `Failed to generate PDF. Please try again.`,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const handleSignAgreement = () => {
        if (!isAgreed) {
            toast.warning('Silakan centang persetujuan terlebih dahulu.');
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            if (user?.id) {
                localStorage.setItem(`SIP_DPA_AGREED_${user.id}`, new Date().toISOString());
            }

            setIsSaving(false);
            setSaveSuccess(true);
            toast.success('Persetujuan berhasil ditandatangani dan diarsipkan.');

            const returnUrl = searchParams.get('returnUrl');
            if (returnUrl) {
                setTimeout(() => {
                    navigate(decodeURIComponent(returnUrl));
                }, 1500);
            }
        }, 1500);
    };

    const handlePrint = () => {
        window.print();
    };

    const PasalsData = [
        {
            id: 1,
            title: "PASAL 1: DEFINISI DAN INTERPRETASI",
            items: [
                "Sistem: Sistem Integrasi Panahan (SIP) yang dikelola oleh Corelink.",
                "Data Pribadi: Informasi yang mengidentifikasi individu (Nama, NIK, Foto, Sertifikat).",
                "Pengendali Data (Data Controller): PIHAK KEDUA (Pemegang Akun).",
                "Pemroses Data (Data Processor): PIHAK PERTAMA (Corelink).",
                "Insiden Data: Kejadian kebocoran, kehilangan, atau akses tidak sah terhadap Data Pribadi."
            ]
        },
        {
            id: 2,
            title: "PASAL 2: RUANG LINGKUP LAYANAN",
            content: "Akses Sistem guna pengelolaan administrasi atlet, verifikasi dokumen, dan penyelenggaraan event. Pemrosesan data mencakup pengumpulan, penyimpanan, penampilan, dan verifikasi sertifikat."
        },
        {
            id: 3,
            title: "PASAL 3: KEWAJIBAN PARA PIHAK",
            subsections: [
                {
                    header: "3.1 PIHAK PERTAMA (Corelink)",
                    content: "Wajib menjaga ketersediaan sistem, menerapkan keamanan teknis (AES-256), serta memproses data sesuai instruksi PIHAK KEDUA."
                },
                {
                    header: `3.2 PIHAK KEDUA (${user?.role || 'Klub/EO'})`,
                    content: "Wajib menjamin legalitas data, verifikasi dokumen fisik secara mandiri, dan menjaga keamanan kredensial akses."
                }
            ]
        },
        {
            id: 7, // Unique ID
            title: "PASAL 4: PERLINDUNGAN DATA ANAK",
            content: "Untuk data subjek di bawah usia 18 tahun (Kategori 'Underage Athlete'), PIHAK KEDUA menjamin telah memperoleh Izin Orang Tua (Parental Consent) yang sah sebelum menginput data ke dalam Sistem. Kontak darurat yang dikumpulkan wajib merupakan nomor aktif Orang Tua/Wali yang sah."
        },
        {
            id: 4,
            title: "PASAL 5: PENANGANAN INSIDEN KEBOCORAN DATA",
            content: "PIHAK PERTAMA wajib memberitahukan PIHAK KEDUA dalam 72 jam setelah insiden terkonfirmasi. PIHAK KEDUA bertanggung jawab penuh atas pelaporan kepada pemilik data sesuai UU PDP No. 27/2022."
        },
        {
            id: 5,
            title: "PASAL 6: PEMBATASAN TANGGUNG JAWAB",
            content: "PIHAK PERTAMA dilepaskan dari segala tanggung jawab atas keputusan administratif PIHAK KEDUA atau penyalahgunaan akun oleh personil PIHAK KEDUA."
        },
        {
            id: 6,
            title: "PASAL 8: PENYELESAIAN PERSELISIHAN",
            content: "Segala perselisihan yang timbul akan diselesaikan melalui musyawarah, atau jika gagal, melalui Pengadilan Negeri Tangerang Selatan."
        }
    ];

    if (saveSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-900 border border-emerald-500/20 p-10 rounded-[3rem] text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white italic">TERSIMPAN & DIAKTIVASI</h2>
                        <p className="text-slate-400 text-sm">Legal Agreement dengan nomor <span className="text-emerald-400 font-mono">{agreementNumber}</span> telah berhasil diarsipkan.</p>
                    </div>
                    <div className="pt-4 space-y-3">
                        <button
                            onClick={handleDownload}
                            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2"
                        >
                            <Download size={18} /> Unduh PDF Salinan
                        </button>
                        <button
                            onClick={() => navigate('/legal-panel')}
                            className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 font-bold hover:text-white transition-all"
                        >
                            Kembali ke Panel
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 print:hidden">
                <div className="absolute top-[10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full" />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body { background: white !important; color: black !important; }
                    .min-h-screen { background: white !important; padding: 0 !important; }
                    .print-container { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
                    .no-print { display: none !important; }
                }
            `}} />

            <div className="relative max-w-5xl mx-auto px-6 py-20 print:p-0 print:max-w-none">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 no-print">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-slate-400 hover:text-white group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Kembali
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Perjanjian Akses & <br />
                            <span className="text-blue-400">Pemrosesan Data</span>
                        </h1>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3 text-blue-400 mb-1">
                            <Hash size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Document Registry No.</span>
                        </div>
                        <p className="font-mono text-sm font-bold text-white uppercase">{agreementNumber}</p>
                    </div>
                </div>

                {/* Agreement Document Card */}
                <div className="print-container w-full md:w-[210mm] min-h-[297mm] mx-auto px-[10mm] py-[10mm] md:px-[12mm] md:py-[15mm] rounded-[2px] bg-white text-slate-900 shadow-2xl space-y-6 font-serif relative overflow-hidden print:rounded-none print:shadow-none print:w-full print:m-0">

                    {/* Header */}
                    <div className="flex flex-col items-center justify-center space-y-2 pt-0 border-b-2 border-slate-900 pb-6">
                        <div className="flex items-center gap-6 no-print">
                            <AnimatedHexLogo size={60} />
                            <div className="flex flex-col justify-center">
                                <SIPText variant="legal" className="text-[22px] font-black leading-tight" />
                                <span className="text-[8px] font-black tracking-[0.2em] text-blue-600 -mt-1 ml-1">CORELINK System (Csystem)</span>
                            </div>
                        </div>
                        <div className="hidden print:flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-2xl">C</div>
                            <div className="flex flex-col text-left -space-y-1">
                                <h4 className="text-2xl font-black tracking-tighter">SIP INTEGRASI</h4>
                                <span className="text-[8px] font-black tracking-[0.1em] text-slate-500 uppercase">Corelink System (Csystem)</span>
                            </div>
                        </div>
                        <div className="text-center space-y-1 mt-5">
                            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-slate-800">PERJANJIAN AKSES DAN PEMROSESAN DATA</h2>
                            <p className="text-[10px] font-mono font-bold text-slate-400">No: {agreementNumber}</p>
                            <p className="text-[8px] font-mono text-blue-500/50 no-print uppercase tracking-widest mt-1">Corelink UI Engine v2.2 (Side-by-Side Force)</p>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="space-y-5 text-sm leading-relaxed">
                        <p>Pada hari ini, <strong className="border-b-2 border-slate-900 px-4">{currentDate}</strong>, telah dibuat dan disepakati perjanjian antara:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-2">
                                <h4 className="font-bold text-[15px] border-b-2 border-slate-900 pb-2">PIHAK PERTAMA (Corelink)</h4>
                                <div className="space-y-0 text-slate-700">
                                    <p className="flex justify-between py-0.1"><span>Nama Instansi</span> <span className="font-bold">Corelink Technology</span></p>
                                    <p className="flex justify-between py-0.1"><span>Alamat</span> <span className="font-bold">Jakarta, Indonesia</span></p>
                                    <p className="flex justify-between py-0.1"><span>Jabatan</span> <span className="font-bold">System Provider</span></p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-[15px] border-b-2 border-slate-900 pb-2">PIHAK KEDUA (Pemegang Akun)</h4>
                                <div className="space-y-0 text-slate-700" style={{ fontFamily: "'Calibri', sans-serif" }}>
                                    <p className="flex justify-between py-0.1"><span>Core ID</span> <strong className="text-blue-700 font-mono">{(profile?.user as any)?.coreId || user?.coreId || '---'}</strong></p>
                                    <p className="flex justify-between py-0.1"><span>Nama Lengkap</span> <strong className="uppercase">{profile?.user?.name || user?.name || '---'}</strong></p>
                                    <p className="flex justify-between py-0.1"><span>Whatsapp</span> <span className="font-bold">{(profile?.user as any)?.whatsapp || (profile?.user as any)?.phone || user?.phone || '---'}</span></p>
                                    <p className="flex justify-between py-0.1"><span>Lokasi</span> <span className="font-bold">{(profile?.user as any)?.cityId ? 'Verified Location' : '---'}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pasals Loop */}
                    <div className="space-y-6 py-1">
                        {PasalsData.map((pasal) => (
                            <div key={pasal.id} className="space-y-3">
                                <h4 className="text-lg font-black uppercase text-slate-800 border-l-[6px] border-blue-600 pl-4">{pasal.title}</h4>
                                {pasal.items && (
                                    <ol className="list-decimal pl-10 space-y-1 text-sm text-slate-700 text-justify leading-normal marker:font-bold">
                                        {pasal.items.map((item, idx) => <li key={idx} className="pl-2">{item}</li>)}
                                    </ol>
                                )}
                                {pasal.subsections && (
                                    <div className="grid grid-cols-2 gap-8 pl-4 pt-2">
                                        {pasal.subsections.map((sub, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <h5 className="font-bold text-sm underline decoration-slate-300 underline-offset-4 mb-2">{sub.header}</h5>
                                                {sub.content && <p className="text-sm text-slate-700 leading-normal text-justify">{sub.content}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pasal.content && <p className="pl-5 text-sm leading-normal text-slate-700 text-justify whitespace-pre-line">{pasal.content}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Digital Signature Area */}
                    <div className="pt-1 grid grid-cols-2 gap-20 text-center text-[10px]">
                        {/* Pihak Pertama Signature */}
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-bold uppercase tracking-wider mb-2">PIHAK PERTAMA</p>
                            <div className="w-24 h-24 bg-slate-50 border border-slate-100 flex flex-col items-center justify-center relative p-2 rounded-lg overflow-hidden">
                                {systemQrUrl ? (
                                    <div className="relative w-full h-full">
                                        <img src={systemQrUrl} alt="System QR" className="w-full h-full object-contain" />
                                        {/* C-System Logo Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center p-[2px] shadow-sm border border-slate-100">
                                                <AnimatedHexLogo size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <QrCode size={60} className="text-slate-800" />
                                )}
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] invisible group-hover:visible" />
                            </div>
                            <p className="text-[6px] font-mono mt-1 text-slate-500">SIP-CL-SYSTEM-AUTH</p>
                            <div className="space-y-1 mt-4">
                                <div className="border-b border-slate-900 w-48 font-bold text-xs uppercase underline decoration-2 underline-offset-4">CORELINK SYSTEM</div>
                                <p className="font-medium">([CSYSTEM] & [SYSTEM PROVIDER])</p>
                            </div>
                        </div>

                        {/* Pihak Kedua Signature */}
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-bold uppercase tracking-wider mb-2">PIHAK KEDUA</p>
                            <div className={`w-24 h-24 flex flex-col items-center justify-center p-2 rounded-lg transition-all border-2 ${saveSuccess ? 'bg-blue-50 border-blue-500 border-solid' : 'bg-slate-50 border-slate-300 border-dashed'}`}>
                                {userQrUrl ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {/* QR Image */}
                                        <img
                                            src={userQrUrl}
                                            alt="User QR"
                                            className={`w-full h-full object-contain transition-all ${saveSuccess ? 'opacity-100 mix-blend-multiply' : 'opacity-20 grayscale blur-[0.5px]'}`}
                                        />

                                        {/* Overlay text for Unsigned/Draft state */}
                                        {!saveSuccess && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <p className="text-[8px] font-black text-slate-400 bg-white/80 px-1 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                                                    MENUNGGU<br />TTD
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 gap-1 animate-pulse">
                                        <Loader2 size={24} className="animate-spin opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Signature Name Line */}
                            <div className="space-y-1 mt-4" style={{ fontFamily: "'Calibri', sans-serif" }}>
                                <div className={`border-b w-48 font-bold text-xs uppercase underline decoration-2 underline-offset-4 ${saveSuccess ? 'border-blue-600 text-blue-900' : 'border-slate-300 text-slate-400'}`}>
                                    {user?.name || '---'}
                                </div>
                                <p className={`font-medium ${saveSuccess ? 'text-blue-600' : 'text-slate-400'}`}>
                                    ([{user?.name || 'NAME'}] & [{user?.role || 'ROLE'}])
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-8 text-[10px] text-slate-400 italic no-print">
                        Dokumen ini divalidasi secara digital melalui QR-ID yang terenkripsi pada sistem database SIP.
                    </div>

                    {/* Interactive Sign Area */}
                    {!saveSuccess && (
                        <div className="pt-10 space-y-8 bg-slate-50 p-10 rounded-[2rem] border-2 border-dashed border-slate-200 no-print">
                            <div className="flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                    className="mt-1 w-5 h-5 accent-blue-600 rounded"
                                />
                                <label htmlFor="agree" className="text-sm font-medium text-slate-700 leading-relaxed cursor-pointer">
                                    Saya, <strong className="uppercase">{user?.name}</strong>, menyatakan bahwa saya telah membaca, memahami, dan menyetujui seluruh isi Perjanjian Akses dan Pemrosesan Data ini secara sadar dan tanpa paksaan.
                                </label>
                            </div>

                            <button
                                onClick={handleSignAgreement}
                                disabled={!isAgreed || isSaving}
                                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${isAgreed && !isSaving
                                    ? 'bg-slate-900 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSaving ? (
                                    <>Memproses Dokumen...</>
                                ) : (
                                    <>
                                        <FileSignature />
                                        Tanda Tangani Secara Digital
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Legal Note Footer */}
                <div className="mt-12 flex items-center gap-4 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 no-print">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white mb-0.5">Catatan Penting</p>
                        <p className="text-xs text-slate-400">
                            Perjanjian ini bersifat mengikat secara hukum bagi Akun dengan Otoritas (Klub/EO/Federasi). Setiap pelanggaran penggunaan data akan diselesaikan sesuai dengan hukum Republik Indonesia.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataProcessAgreementPage;
