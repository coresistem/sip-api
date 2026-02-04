import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileCheck, CheckCircle2, User, Building2, Calendar, FileText, Loader2, XCircle } from 'lucide-react';
import SIPText from '../../core/components/ui/SIPText';
import AnimatedHexLogo from '../../core/components/ui/AnimatedHexLogo';

// Mock Verification Service (Replace with real API later)
const verifyDocument = async (code: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // DPA Verification Pattern: SIP/LEGAL/YYYYMMDD/RANDOM
    if (code.includes('SIP-LEGAL')) {
        return {
            valid: true,
            type: 'LEGAL',
            docName: 'PERJANJIAN AKSES DAN PEMROSESAN DATA',
            docNumber: code,
            timestamp: new Date().toISOString(),
            signer: {
                name: 'BUDI SANTOSO', // In real app, fetch from DB based on ID in code
                role: 'CLUB ADMIN',
                entity: 'CROW ARCHERY JKT',
                status: 'ACTIVE'
            },
            issuer: {
                name: 'Corelink Technology',
                system: 'Corelink Integrity Engine v2'
            }
        };
    }

    // Future: Certificate Pattern
    if (code.includes('CERT')) {
        return { valid: true, type: 'CERTIFICATE', /* ... */ };
    }

    return { valid: false };
};

const UnifiedVerificationPage = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'LOADING' | 'VALID' | 'INVALID'>('LOADING');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!code) {
            setStatus('INVALID');
            return;
        }

        verifyDocument(code)
            .then(res => {
                if (res.valid) {
                    setData(res);
                    setStatus('VALID');
                } else {
                    setStatus('INVALID');
                }
            })
            .catch(() => setStatus('INVALID'));
    }, [code]);

    if (status === 'LOADING') {
        return (
            <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
                <AnimatedHexLogo className="w-16 h-16 mb-6" />
                <div className="flex items-center gap-3 text-primary-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-mono text-sm tracking-widest">VERIFYING SIGNATURE...</span>
                </div>
            </div>
        );
    }

    if (status === 'INVALID') {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
                <div className="card w-full max-w-md text-center border-red-500/30 bg-red-500/5">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Dokumen Tidak Valid</h1>
                    <p className="text-dark-400 text-sm mb-6">QR Code ini tidak dikenali atau dokumen telah dicabut oleh sistem.</p>
                    <div className="p-3 bg-dark-900 rounded-lg font-mono text-xs text-dark-500 break-all border border-dark-800">
                        CODE: {code}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto space-y-8"
            >
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <AnimatedHexLogo className="w-12 h-12" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-white">
                        <span className="text-primary-500">Corelink</span> Trust Center
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        Dokumen Asli & Terverifikasi
                    </div>
                </div>

                {/* Main Card */}
                <div className="card border-t-4 border-t-emerald-500 shadow-2xl shadow-emerald-500/10">
                    {/* Document Info */}
                    <div className="flex items-start gap-4 pb-6 border-b border-white/5">
                        <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
                            <FileCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-primary-500 tracking-wider uppercase mb-1">Jenis Dokumen</p>
                            <h2 className="text-lg font-bold text-white leading-tight">{data.docName}</h2>
                            <p className="font-mono text-xs text-dark-400 mt-2">{data.docNumber}</p>
                        </div>
                    </div>

                    {/* Signer Info */}
                    <div className="py-6 space-y-4">
                        <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Informasi Penanda Tangan</p>

                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                                <User className="w-5 h-5 text-dark-400" />
                                <div>
                                    <p className="text-xs text-dark-500">Nama Lengkap</p>
                                    <p className="font-medium text-white">{data.signer.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                                <Shield className="w-5 h-5 text-dark-400" />
                                <div>
                                    <p className="text-xs text-dark-500">Role & Kewenangan</p>
                                    <p className="font-medium text-white">{data.signer.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                                <Building2 className="w-5 h-5 text-dark-400" />
                                <div>
                                    <p className="text-xs text-dark-500">Entitas / Organisasi</p>
                                    <p className="font-medium text-white">{data.signer.entity}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Meta */}
                    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-2 text-dark-400">
                            <Calendar className="w-4 h-4" />
                            <span>Ditandatangani: {new Date(data.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <Shield className="w-4 h-4" />
                            {data.issuer.system}
                        </div>
                    </div>
                </div>

                {/* Secure Disclaimer */}
                <div className="text-center max-w-sm mx-auto">
                    <SIPText className="text-[10px] text-dark-500 leading-relaxed">
                        Dokumen ini telah diamankan menggunakan kriptografi standar industri.
                        Validasi ini menjamin bahwa dokumen tersebut diterbitkan secara sah oleh Sistem Integrasi Panahan (SIP) Corelink.
                    </SIPText>
                </div>

            </motion.div>
        </div>
    );
};

export default UnifiedVerificationPage;
