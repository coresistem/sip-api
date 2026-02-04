import React from 'react';
import { motion } from 'framer-motion';
import {
    Scale,
    ShieldCheck,
    FileText,
    ShieldAlert,
    Gavel,
    History,
    ExternalLink,
    Lock,
    Download,
    Eye,
    ClipboardCheck,
    CheckSquare,
    Square,
    Paperclip,
    FilePlus,
    Link as LinkIcon,
    GalleryHorizontal,
    UploadCloud,
    AlertTriangle,
    CheckCircle2,
    Clock,
    UserCheck,
    LockIcon,
    FileCheck
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/modules/core/contexts/AuthContext';
import AdminDPIAPage from './AdminDPIAPage';
import LegalDocumentPDF from '../components/LegalDocumentPDF';
import AgreementPDF from '../components/AgreementPDFv2';
import QRCode from 'qrcode';

const LegalPanelPage = () => {
    const { user: currentUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || 'overview') as 'overview' | 'dpia' | 'docs' | 'registry' | 'checklist';
    const navigate = useNavigate();

    // Simplified System Auto-Discovery for existing modules
    const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set([
        'A.2', 'B.3', 'B.4', 'C.7', 'D.9', 'D.10', 'E.12'
    ]));

    const toggleItem = (id: string) => {
        const next = new Set(checkedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCheckedItems(next);
    };

    // Evidence State - Auto-linked to internal modules with structured IDs (Audit Portal Masking)
    const [evidenceLinks, setEvidenceLinks] = React.useState<Record<string, string>>({
        'A.2': '/audit/verification?view=policy',
        'B.3': '/privacy',
        'B.4': '/terms',
        'C.7-1': '/legal/agreement',
        'D.9': '/audit/verification?view=access',
        'D.10': '/audit/activity-logs',
        'E.12': '/audit/verification?view=risk'
    });
    const [activeEvidenceInput, setActiveEvidenceInput] = React.useState<string | null>(null);
    const [tempLink, setTempLink] = React.useState('');

    const saveEvidence = (id: string) => {
        setEvidenceLinks(prev => ({ ...prev, [id]: tempLink }));
        setActiveEvidenceInput(null);
        setTempLink('');
        toast.success('Bukti Audit berhasil ditautkan.');
    };

    const renderChecklistItem = (id: string, label: string, colorClass: string, isSub = false) => {
        const isChecked = checkedItems.has(id);
        const evidence = evidenceLinks[id];
        const isActiveInput = activeEvidenceInput === id;

        return (
            <div className={`flex items-center gap-2 group/item ${isSub ? '' : 'mt-4'}`}>
                <button
                    onClick={() => toggleItem(id)}
                    className={`flex items-center gap-3 text-left transition-colors flex-1 ${isSub ? 'text-slate-400 hover:text-slate-300' : 'text-white font-bold'}`}
                >
                    <div className={`rounded border flex items-center justify-center transition-colors ${isSub ? 'w-3.5 h-3.5 border-slate-700' : 'w-4 h-4 border-slate-600'} ${colorClass}`}>
                        {isChecked ? <CheckSquare size={isSub ? 10 : 12} /> : <Square size={isSub ? 8 : 10} />}
                    </div>
                    <span className={`${isSub ? 'text-xs italic' : 'text-sm uppercase tracking-tight'}`}>{label}</span>
                </button>

                {/* Evidence / Attachment Button */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setActiveEvidenceInput(isActiveInput ? null : id);
                            setTempLink(evidence || '');
                        }}
                        className={`p-1 rounded bg-white/5 border border-white/5 transition-all ${evidence ? 'text-cyan-400 border-cyan-500/30' : 'text-slate-600 opacity-0 group-hover/item:opacity-100'}`}
                        title={evidence ? "View/Edit Evidence" : "Attach Evidence"}
                    >
                        {evidence ? <Paperclip size={10} /> : <FilePlus size={10} />}
                    </button>

                    {isActiveInput && (
                        <div className="absolute right-0 top-full mt-2 z-50 w-64 p-3 rounded-xl bg-slate-800 border border-white/10 shadow-2xl space-y-2 no-print">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tautkan Bukti Audit</p>
                            <input
                                autoFocus
                                type="text"
                                value={tempLink}
                                onChange={(e) => setTempLink(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] text-white focus:border-cyan-500 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && saveEvidence(id)}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => saveEvidence(id)}
                                    className="flex-1 py-1 rounded-lg bg-cyan-500 text-white text-[10px] font-bold"
                                >Simpan</button>
                                <button
                                    onClick={() => setActiveEvidenceInput(null)}
                                    className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px]"
                                >Batal</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const triggerDownload = (blob: Blob, fileName: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDownload = async (docName: string, extraData?: any) => {
        const toastId = toast.loading(`Generating secure PDF for ${docName}...`, {
            position: "bottom-right",
            theme: "dark"
        });

        try {
            const docId = docName.startsWith('SIP/') ? docName.replace('.pdf', '') : `SIP-LEGAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            const actualDocName = (docName.startsWith('SIP/') || docName.includes("Data Processing Agreement") || docName === "Data Process Agreement") ? "Data Processing Agreement (DPA)" : docName;

            const currentDate = new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            if (actualDocName === "Data Processing Agreement (DPA)" || actualDocName === "Data Process Agreement") {
                // Generate QR Code
                const coreId = extraData?.id || currentUser?.coreId || "00.9999.0001";
                const qrContent = `SIP-VERIFIED|${coreId}|${docId}|${new Date().toISOString()}`;
                const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
                    width: 100,
                    margin: 2,
                    color: {
                        dark: '#0f172a',
                        light: '#ffffff'
                    }
                });

                const pdfData = {
                    agreementNumber: docId,
                    currentDate: currentDate,
                    user: {
                        name: extraData?.name || currentUser?.name || "SUPER ADMINISTRATOR",
                        coreId: coreId,
                        whatsapp: currentUser?.whatsapp || "+628120000001",
                        role: extraData?.role || currentUser?.role || "SUPER ADMINISTRATOR",
                        qrCodeDataUrl: qrCodeDataUrl
                    },
                    pasals: [
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
                                    header: `3.2 PIHAK KEDUA (${extraData?.role || currentUser?.role || 'User'})`,
                                    content: "Wajib menjamin legalitas data, verifikasi dokumen fisik secara mandiri, dan menjaga keamanan kredensial akses."
                                }
                            ]
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
                    ]
                };

                const blob = await pdf(<AgreementPDF data={pdfData} />).toBlob();
                triggerDownload(blob, `${actualDocName.replace(/\s+/g, '_')}_${docId.replace(/\//g, '_')}.pdf`);
            } else {
                let sections: { title: string; content: string }[] = [];

                if (actualDocName === "Terms & Conditions") {
                    sections = [
                        { title: "1. DEFINISI & INTERPRETASI", content: "Sistem: SIP - Platform PWA yang dikelola Corelink. Penyedia Sistem: Csystem bertindak sebagai penyedia sarana teknis. Pihak Berwenang: Klub, EO, PERPANI, KONI, DISPORA. Manpower: Staf operasional atau verifikator yang ditunjuk Pihak Berwenang." },
                        { title: "2. RUANG LINGKUP LAYANAN", content: "Manajemen database profil atlet (One User, Multiple Profiles), digitalisasi dokumen kualifikasi lomba, dan pemberian akses verifikasi kepada penyelenggara event." },
                        { title: "3. PERAN & VALIDASI DOKUMEN", content: "Penyedia hanya menyediakan wadah digital. Validasi dokumen sepenuhnya menjadi tanggung jawab verifikator institusi. Penyedia tidak menjamin keaslian dokumen yang diunggah." },
                        { title: "4. KEAMANAN AKUN & CORE ID", content: "Pengguna bertanggung jawab atas kredensial login dan Core ID. Segala tindakan melalui akun dianggap sebagai tindakan sah pemilik akun." },
                        { title: "5. PEMBATASAN TANGGUNG JAWAB", content: "Penyedia dibebaskan dari tuntutan akibat ketidakcocokan data atlet, keputusan diskualifikasi EO, atau penyalahgunaan data oleh pihak berwenang yang telah diberikan akses sah." },
                        { title: "6. KETERSEDIAAN LAYANAN", content: "Berupaya menjaga uptime 99% melalui infrastruktur cloud. Pemeliharaan sistem akan diberitahukan minimal 24 jam sebelumnya." },
                        { title: "7. HUKUM & YURISDIKSI", content: "Tunduk pada Hukum Indonesia. Perselisihan dibawa ke wilayah hukum Pengadilan Negeri Tangerang Selatan." },
                        { title: "8. PERSETUJUAN ELEKTRONIK", content: "Penggunaan sistem setara dengan tanda tangan basah sesuai UU ITE No. 11/2008." }
                    ];
                } else if (actualDocName === "Privacy Policy") {
                    sections = [
                        { title: "1. RUANG LINGKUP", content: "Berlaku untuk seluruh pemangku kepentingan SIP: Atlet, Wali, Manpower Klub, dan Verifikator Institusi." },
                        { title: "2. KAPASITAS HUKUM", content: "Corelink bertindak sebagai Pemroses Data (Processor). Tanggung jawab hukum Pengendali Data (Controller) berada pada Institusi (Klub/EO)." },
                        { title: "3. INVENTARISASI DATA", content: "Data Identitas biometrik dan NIK. Data Persyaratan scan dokumen kualifikasi event olahraga." },
                        { title: "4. METODOLOGI KEAMANAN", content: "Enkripsi AES-256, Audit Trail akses dokumen sensitif, dan isolasi data antar-tenan." },
                        { title: "5. KEBIJAKAN RETENSI", content: "Prinsip meminimalisir data. Dokumen bukti (scan) dihapus otomatis 30 hari setelah verifikasi event selesai." },
                        { title: "6. HAK PEMILIK DATA", content: "Sesuai Bab V UU PDP No. 27/2022: Mengakses, Memperbaiki, Menghentikan pemrosesan, dan Menghapus data." }
                    ];
                }

                const blob = await pdf(<LegalDocumentPDF title={actualDocName} sections={sections} id={docId} />).toBlob();
                triggerDownload(blob, `${actualDocName.replace(/\s+/g, '_')}_SIP_LEGAL.pdf`);
            }

            toast.update(toastId, {
                render: `${actualDocName} has been downloaded as PDF.`,
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

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };

    const tabs = [
        { id: 'overview', label: 'Legal Overview', icon: Scale },
        { id: 'dpia', label: 'DPIA Assessment', icon: ShieldAlert },
        { id: 'docs', label: 'Document Status', icon: FileText },
        { id: 'registry', label: 'Agreement Registry', icon: History },
        { id: 'checklist', label: 'Go-Live Checklist', icon: ClipboardCheck },
    ];

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Gavel size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tight uppercase">Legal & Compliance Panel</h1>
                        <p className="text-slate-400 text-xs font-medium tracking-wide">Pusat tata kelola hukum dan perlindungan data SIP</p>
                    </div>
                </div>
            </header>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">UU PDP Compliance</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mt-2">
                                    Sistem telah dikonfigurasi mengikuti standar UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Validated
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Security Infrastructure</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mt-2">
                                    Enkripsi AES-256 dan protokol SSL/TLS aktif untuk seluruh pemrosesan dokumen sensitif.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                Secure
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <History size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Data Retention</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mt-2">
                                    Mekanisme auto-purging dokumen lomba (30 hari) dan log akses (12 bulan) berjalan normal.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Healthy
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'dpia' && <AdminDPIAPage />}

                {activeTab === 'docs' && (
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText size={20} className="text-cyan-400" />
                                Legal Document Management
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-white/5 text-slate-300 uppercase text-[12px] font-black tracking-widest border-b border-white/5">
                                        <th className="p-5">Document Name</th>
                                        <th className="p-5">Description</th>
                                        <th className="p-5">Last Updated</th>
                                        <th className="p-5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { id: "1", name: "Terms & Conditions", path: "/terms", updated: "31 Jan 2026", color: "cyan", desc: "Ketentuan layanan dasar untuk seluruh pengguna ekosistem SIP." },
                                        { id: "2", name: "Privacy Policy", path: "/privacy", updated: "31 Jan 2026", color: "emerald", desc: "Kebijakan perlindungan data pribadi dan transparansi pemrosesan." },
                                        { id: "3", name: "Data Processing Agreement (DPA)", path: "/legal/agreement", updated: "03 Feb 2026", color: "blue", desc: "Perjanjian induk pemrosesan data antara Corelink (Processor) dan Institusi (Controller)." }
                                    ].map((doc, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl bg-${doc.color}-500/10 border border-${doc.color}-500/20 flex items-center justify-center text-${doc.color}-400 group-hover:scale-110 transition-transform shadow-lg shadow-${doc.color}-500/5`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <span className="font-black text-lg text-white tracking-tight">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-slate-300 text-sm font-medium leading-relaxed min-w-[350px]">
                                                {doc.desc}
                                            </td>
                                            <td className="p-5 text-slate-400 text-sm font-bold whitespace-nowrap">
                                                {doc.updated}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => navigate(doc.path)}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/20 hover:border-cyan-500"
                                                    >
                                                        <Eye size={16} />
                                                        Preview
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(doc.name)}
                                                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'registry' && (
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <History size={20} className="text-cyan-400" />
                                Signed Agreement Registry
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                                Simulated Data
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                        <th className="p-4">Reg No.</th>
                                        <th className="p-4">Signee</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Date Signed</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { id: "SIP/LEGAL/20260203/0001", name: "Andi Saputra", role: "CLUB OWNER", date: "03 Feb 2026", status: "Active" },
                                        { id: "SIP/LEGAL/20260202/4452", name: "Budi Santoso", role: "EVENT ORGANIZER", date: "02 Feb 2026", status: "Active" },
                                        { id: "SIP/LEGAL/20260130/1288", name: "Siti Aminah", role: "CLUB ADMIN", date: "30 Jan 2026", status: "Active" },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-xs text-cyan-400">{row.id}</td>
                                            <td className="p-4 font-semibold text-white">{row.name}</td>
                                            <td className="p-4 text-slate-400 text-xs">{row.role}</td>
                                            <td className="p-4 text-slate-400 text-xs">{row.date}</td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate('/legal/agreement')}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-all"
                                                        title="Preview Agreement"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(row.id, row)}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'checklist' && (
                    <div className="space-y-6 pb-20">
                        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 shadow-2xl space-y-8">

                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">✅ Checklist Hukum Sebelum Go-Live</h2>
                                    <p className="text-slate-400 text-sm font-medium">Internal Compliance Tracker (UU PDP & PSE Standard)</p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Compliance Level</p>
                                        <p className="text-sm font-bold text-white uppercase italic">Level A: Fundamental</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nested Checklist Grid - 16 Point Complete framework */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                {/* SECTION A */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-3 text-lg font-black text-rose-500 uppercase italic tracking-tighter">
                                        <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">A</span>
                                        Legal Fundamental (WAJIB)
                                    </h3>
                                    <div className="space-y-6 pl-11">
                                        <div className="space-y-3">
                                            {renderChecklistItem(`A.1`, "1. Status Penyelenggara Sistem Elektronik (PSE)", "text-rose-400 group-hover:border-rose-500")}
                                            <div className="pl-7 space-y-2">
                                                {renderChecklistItem(`A.1-1`, "Terdaftar sebagai PSE Lingkup Privat", "text-rose-500/50", true)}
                                                {renderChecklistItem(`A.1-2`, "Nama sistem sesuai branding aplikasi", "text-rose-500/50", true)}
                                                {renderChecklistItem(`A.1-3`, "Penanggung jawab hukum jelas", "text-rose-500/50", true)}
                                                <p className="text-[10px] text-rose-400/40 font-black uppercase pt-1 flex items-center gap-2">
                                                    <AlertTriangle size={10} /> Risiko: Teguran / pemblokiran layanan
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {renderChecklistItem(`A.2`, "2. Posisi Hukum Sistem", "text-rose-400 group-hover:border-rose-500")}
                                            <div className="pl-7 space-y-2">
                                                {renderChecklistItem(`A.2-1`, "Ditulis jelas sebagai PERANTARA TEKNIS", "text-rose-500/50", true)}
                                                {renderChecklistItem(`A.2-2`, "Tidak memverifikasi kebenaran dokumen", "text-rose-500/50", true)}
                                                {renderChecklistItem(`A.2-3`, "Tidak menentukan kelulusan / seleksi atlet", "text-rose-500/50", true)}
                                                <p className="text-[10px] text-rose-400/40 font-black uppercase pt-1 flex items-center gap-2">
                                                    📌 Konsisten di: PP, T&C, DPIA, Perjanjian
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION B */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-3 text-lg font-black text-orange-500 uppercase italic tracking-tighter">
                                        <span className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">B</span>
                                        Perlindungan Data Pribadi (UU PDP)
                                    </h3>
                                    <div className="space-y-6 pl-11">
                                        <div className="space-y-3">
                                            {renderChecklistItem(`B.3`, "3. Privacy Policy Final (Publish)", "text-orange-400 group-hover:border-orange-500")}
                                            <div className="pl-7 space-y-2">
                                                {renderChecklistItem(`B.3-1`, "Sesuai dengan DPIA", "text-orange-500/50", true)}
                                                {renderChecklistItem(`B.3-2`, "Jenis data, Tujuan, Peran Perantara", "text-orange-500/50", true)}
                                                {renderChecklistItem(`B.3-3`, "Bahasa mudah dipahami", "text-orange-500/50", true)}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {renderChecklistItem(`B.4`, "4. Terms & Conditions Final", "text-orange-400 group-hover:border-orange-500")}
                                            <div className="pl-7 space-y-1">
                                                {["Pembatasan tanggung jawab", "Kewajiban pengakses", "Sanksi penyalahgunaan"].map((s, i) => renderChecklistItem(`B.4-${i + 1}`, s, "text-orange-500/50", true))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {renderChecklistItem(`B.5`, "5. DPIA Internal Lengkap", "text-orange-400 group-hover:border-orange-500")}
                                            <div className="pl-7 space-y-1">
                                                {["Analisis risiko data anak", "Mitigasi kebocoran", "Review internal disetujui"].map((s, i) => renderChecklistItem(`B.5-${i + 1}`, s, "text-orange-500/50", true))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {renderChecklistItem(`B.6`, "6. Consent Management", "text-orange-400 group-hover:border-orange-500")}
                                            <div className="pl-7 space-y-1">
                                                {["Persetujuan eksplisit upload", "Consent wali (<18th)", "Consent data sensitif"].map((s, i) => renderChecklistItem(`B.6-${i + 1}`, s, "text-orange-500/50", true))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION C & D */}
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h3 className="flex items-center gap-3 text-lg font-black text-amber-500 uppercase italic tracking-tighter">
                                            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">C</span>
                                            Dokumen & Perjanjian
                                        </h3>
                                        <div className="space-y-6 pl-11">
                                            <div className="space-y-2">
                                                {renderChecklistItem('C.7', "7. Perjanjian Antar Instansi", "text-amber-400 group-hover:border-amber-500")}
                                                <div className="pl-7 space-y-1">
                                                    {["Klub", "EO", "Perpani", "KONI / DISPORA"].map((t, i) => renderChecklistItem(`C.7-${i + 1}`, t, "text-amber-500/30", true))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {renderChecklistItem('C.8', "8. Tanda Tangan Elektronik", "text-amber-400 group-hover:border-amber-500")}
                                                <div className="pl-7 space-y-1">
                                                    {["PSrE (PrivyID/VIDA/dll)", "Dokumen terkunci pasca-TTD", "Arsip digital tersimpan"].map((t, i) => renderChecklistItem(`C.8-${i + 1}`, t, "text-amber-500/30", true))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="flex items-center gap-3 text-lg font-black text-emerald-500 uppercase italic tracking-tighter">
                                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">D</span>
                                            Akses & Keamanan
                                        </h3>
                                        <div className="space-y-4 pl-11">
                                            {renderChecklistItem('D.9', "9. Role & Access Control (RBAC)", "text-emerald-400 group-hover:border-emerald-500")}
                                            {renderChecklistItem('D.10', "10. Audit Log (Siapa, Kapan, IP)", "text-emerald-400 group-hover:border-emerald-500")}
                                            {renderChecklistItem('D.11', "11. SOP Insiden Data", "text-emerald-400 group-hover:border-emerald-500")}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION E, F, G */}
                                <div className="space-y-10">
                                    {/* SECTION E */}
                                    <div className="space-y-6">
                                        <h3 className="flex items-center gap-3 text-lg font-black text-blue-500 uppercase italic tracking-tighter">
                                            <span className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">E</span>
                                            Data Anak (Vulnerable)
                                        </h3>
                                        <div className="space-y-4 pl-11">
                                            {renderChecklistItem('E.12', "12. Perlindungan Anak", "text-blue-400 group-hover:border-blue-500")}
                                            <div className="pl-7 space-y-1">
                                                {["Data tidak terbuka publik", "Wali dapat cabut consent", "Retensi terbatas"].map((s, i) => renderChecklistItem(`E.12-${i + 1}`, s, "text-blue-500/30", true))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION F */}
                                    <div className="space-y-6">
                                        <h3 className="flex items-center gap-3 text-lg font-black text-indigo-500 uppercase italic tracking-tighter">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">F</span>
                                            Teknis Legal Support
                                        </h3>
                                        <div className="space-y-4 pl-11">
                                            {renderChecklistItem('F.13', "13. Retensi & Penghapusan Data", "text-indigo-400 group-hover:border-indigo-500")}
                                            {renderChecklistItem('F.14', "14. Disclaimer & Informasi Publik", "text-indigo-400 group-hover:border-indigo-500")}
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-6 rounded-3xl bg-slate-800/40 border border-white/5 border-dashed">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">🏆 G. FINAL GO-LIVE GATE</h4>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                {renderChecklistItem('G.15', "15. Legal Approval Internal", "text-emerald-400 group-hover:border-emerald-500")}
                                                <div className="pl-7 space-y-1">
                                                    {["Penanggung jawab setuju", "Tanggal go-live dicatat"].map((s, i) => renderChecklistItem(`G.15-${i + 1}`, s, "text-emerald-500/30", true))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {renderChecklistItem('G.16', "16. Snapshot Compliance", "text-emerald-400 group-hover:border-emerald-500")}
                                                <div className="pl-7 space-y-1">
                                                    {["Simpan versi final PP/TC/DPIA", "Backup aman"].map((s, i) => renderChecklistItem(`G.16-${i + 1}`, s, "text-emerald-500/30", true))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Evidence Registry */}
                            {Object.keys(evidenceLinks).length > 0 && (
                                <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <History size={14} /> Audit Evidence Registry
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {Object.entries(evidenceLinks).map(([id, link]) => (
                                            <a
                                                key={id}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
                                            >
                                                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                                    <Paperclip size={14} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase truncate text-left">POIN {id}</p>
                                                    <p className="text-[10px] text-cyan-400/70 truncate text-left">{link}</p>
                                                </div>
                                                <ExternalLink size={12} className="text-slate-600 group-hover:text-white" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary Footer */}
                            <div className="mt-12 p-8 rounded-[2.5rem] bg-emerald-500/5 border-2 border-dashed border-emerald-500/20">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black italic text-emerald-400 uppercase tracking-tighter">🎯 SIAP GO-LIVE JIKA:</h4>
                                        <p className="text-xs text-slate-400 font-medium tracking-wide">Ambang batas keamanan hukum minimum untuk peluncuran publik.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {["Seluruh poin A–C terpenuhi", "Min 80% poin D–F terpenuhi", "Dokumen legal konsisten"].map((check, i) => (
                                            <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase italic border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                                <CheckCircle2 size={14} />
                                                {check}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default LegalPanelPage;
