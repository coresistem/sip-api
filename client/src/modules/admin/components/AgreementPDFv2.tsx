import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 30,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: '#0f172a',
        paddingBottom: 10,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    logoContainer: {
        width: 40,
        height: 40,
        marginRight: 10,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    brandTextContainer: {
        flexDirection: 'column',
    },
    brandTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    brandSub: {
        fontSize: 6,
        letterSpacing: 2,
        color: '#2563eb',
        textTransform: 'uppercase',
        marginTop: 1,
    },
    docTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#0f172a',
    },
    docNumber: {
        fontSize: 7,
        color: '#64748b',
        marginTop: 2,
        fontFamily: 'Courier',
    },
    dateRow: {
        fontSize: 8.5,
        marginTop: 10,
        marginBottom: 8,
    },
    partiesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    partyColumn: {
        width: '48%',
    },
    partyHeader: {
        fontSize: 9,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#0f172a',
        paddingBottom: 2,
        marginBottom: 4,
    },
    partyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1.5,
    },
    partyLabel: {
        fontSize: 7.5,
        color: '#64748b',
    },
    partyValue: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    summaryBox: {
        fontSize: 7,
        fontStyle: 'italic',
        color: '#64748b',
        textAlign: 'justify',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 6,
        marginBottom: 8,
        lineHeight: 1.3,
    },
    section: {
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    sectionContent: {
        fontSize: 8,
        lineHeight: 1.3,
        color: '#334155',
        paddingLeft: 8,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 1,
    },
    listBullet: {
        width: 10,
        fontSize: 8,
    },
    listText: {
        fontSize: 8,
        flex: 1,
    },
    signatureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    signatureBox: {
        width: '40%',
        alignItems: 'center',
    },
    signatureLabel: {
        fontSize: 8.5,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    qrPlaceholder: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    qrText: {
        fontSize: 5,
        color: '#94a3b8',
    },
    signName: {
        fontSize: 9,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#0f172a',
        paddingBottom: 2,
        width: '100%',
        textAlign: 'center',
    },
    signRole: {
        fontSize: 7.5,
        color: '#64748b',
        marginTop: 1,
    },
    debugText: {
        fontSize: 6,
        color: '#cbd5e1',
        textAlign: 'center',
        marginTop: 20
    }
});

interface AgreementPDFProps {
    data: {
        agreementNumber: string;
        currentDate: string;
        user: {
            name: string;
            coreId: string;
            whatsapp: string;
            role: string;
            qrCodeDataUrl?: string;
        };
        pasals: {
            id: number;
            title: string;
            items?: string[];
            content?: string;
            subsections?: { header: string; list?: string[]; content?: string; }[];
        }[];
    }
}

const AgreementPDFv2: React.FC<AgreementPDFProps> = ({ data }) => {
    // Use the specific transparent PNG found in the archive
    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/assets/csystem-logo-transparent.png` : '/assets/csystem-logo-transparent.png';

    return (
        <Document title={`Perjanjian Akses Data - ${data.agreementNumber}`} author="Corelink System" subject="Legal Agreement" creator="SIP System" producer="SIP PDF Engine" keywords="legal, agreement, sip, corelink">
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.brandContainer}>
                        <View style={styles.logoContainer}>
                            <Image
                                src={logoUrl}
                                style={styles.logoImage}
                            />
                        </View>

                        <View style={styles.brandTextContainer}>
                            <Text style={styles.brandTitle}>Sistem Integrasi Panahan</Text>
                            <Text style={styles.brandSub}>CORELINK SYSTEM (CSYSTEM)</Text>
                        </View>
                    </View>
                    <Text style={styles.docTitle}>PERJANJIAN AKSES DAN PEMROSESAN DATA</Text>
                    <Text style={styles.docNumber}>No: {data.agreementNumber}</Text>
                </View>

                <Text style={styles.dateRow}>
                    Pada hari ini, <Text style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.currentDate}</Text>, telah dibuat dan disepakati perjanjian antara:
                </Text>

                <View style={styles.partiesContainer}>
                    <View style={styles.partyColumn}>
                        <Text style={styles.partyHeader}>PIHAK PERTAMA (Corelink)</Text>
                        <View style={styles.partyRow}>
                            <Text style={styles.partyLabel}>Nama Instansi</Text>
                            <Text style={styles.partyValue}>Corelink Technology</Text>
                        </View>
                        <View style={styles.partyRow}>
                            <Text style={styles.partyLabel}>Alamat</Text>
                            <Text style={styles.partyValue}>Jakarta, Indonesia</Text>
                        </View>
                        <View style={styles.partyRow}>
                            <Text style={styles.partyLabel}>Jabatan</Text>
                            <Text style={styles.partyValue}>System Provider</Text>
                        </View>
                    </View>
                    <View style={styles.partyColumn}>
                        <Text style={styles.partyHeader}>PIHAK KEDUA (Pemegang Akun)</Text>
                        <View style={styles.partyRow}>
                            <Text style={styles.partyLabel}>Core ID</Text>
                            <Text style={[styles.partyValue, { color: '#2563eb' }]}>{data.user.coreId}</Text>
                        </View>
                        <View style={styles.partyRow}>
                            <Text style={styles.partyLabel}>Nama Lengkap</Text>
                            <Text style={[styles.partyValue, { textTransform: 'uppercase' }]}>{data.user.name}</Text>
                        </View>
                        <View style={styles.partyRow}>
                            <Text style={styles.partyLabel}>Whatsapp</Text>
                            <Text style={styles.partyValue}>{data.user.whatsapp}</Text>
                        </View>
                        <View style={styles.partyRow}>
                            <Text style={styles.partyLabel}>Jabatan</Text>
                            <Text style={styles.partyValue}>{data.user.role}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.summaryBox}>
                    Bahwa PIHAK KEDUA setuju untuk mematuhi seluruh ketentuan penggunaan Sistem Integrasi Panahan (SIP), termasuk namun tidak terbatas pada Terms & Conditions serta Privacy Policy (Update: 31 Jan 2026), UU PDP No. 27 Tahun 2022, standar operasional prosedur verifikasi atlet, dan protokol keamanan data yang ditetapkan oleh PIHAK PERTAMA.
                </Text>

                {data.pasals.map((pasal) => (
                    <View key={pasal.id} style={styles.section}>
                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                            <View style={{ width: 3, backgroundColor: '#2563eb', marginRight: 7 }} />
                            <Text style={styles.sectionTitle}>{pasal.title}</Text>
                        </View>

                        {/* RENDER CONTENT IF NO SUBSECTIONS */}
                        {pasal.content && !pasal.subsections && (
                            <Text style={styles.sectionContent}>{pasal.content}</Text>
                        )}

                        {/* RENDER ITEMS */}
                        {pasal.items && pasal.items.map((item, idx) => (
                            <View key={idx} style={[styles.listItem, { marginLeft: 10, marginTop: 2 }]}>
                                <Text style={styles.listBullet}>{idx + 1}.</Text>
                                <Text style={styles.listText}>{item}</Text>
                            </View>
                        ))}

                        {/* RENDER SUBSECTIONS (SIDE BY SIDE) */}
                        {pasal.subsections && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                {pasal.subsections.map((sub, idx) => (
                                    <View key={idx} style={{ width: '48%' }}>
                                        <Text style={[styles.sectionTitle, { fontSize: 8.5, textDecoration: 'underline', marginBottom: 4 }]}>{sub.header}</Text>

                                        {/* Subsection Paragraph Content */}
                                        {sub.content && (
                                            <Text style={[styles.sectionContent, { paddingLeft: 0, textAlign: 'justify' }]}>{sub.content}</Text>
                                        )}

                                        {/* Subsection List Items (Fallback) */}
                                        {sub.list && sub.list.map((item, lidx) => (
                                            <View key={lidx} style={[styles.listItem, { marginBottom: 2 }]}>
                                                <Text style={[styles.listBullet, { width: 8 }]}>•</Text>
                                                <Text style={styles.listText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                <View style={styles.signatureContainer}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>PIHAK PERTAMA</Text>
                        <View style={styles.qrPlaceholder}>
                            <Text style={styles.qrText}>SIP-AUTH-VERIFIED</Text>
                        </View>
                        <Text style={styles.signName}>CORELINK SYSTEM</Text>
                        <Text style={styles.signRole}>SYSTEM PROVIDER</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>PIHAK KEDUA</Text>
                        {data.user.qrCodeDataUrl ? (
                            <Image src={data.user.qrCodeDataUrl} style={{ width: 50, height: 50, marginBottom: 8 }} />
                        ) : (
                            <View style={styles.qrPlaceholder}>
                                <Text style={styles.qrText}>{data.user.coreId}</Text>
                            </View>
                        )}
                        <Text style={styles.signName}>{data.user.name}</Text>
                        <Text style={styles.signRole}>{data.user.role}</Text>
                    </View>
                </View>

                <Text style={styles.debugText}>Corelink PDF Engine v2.2 (Side-by-Side Force) - {new Date().toISOString()}</Text>
            </Page>
        </Document>
    );
};

export default AgreementPDFv2;
