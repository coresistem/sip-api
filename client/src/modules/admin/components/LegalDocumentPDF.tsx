import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 60,
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2pt solid #0f172a',
        paddingBottom: 20,
        textAlign: 'center',
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: 'extrabold',
        color: '#0f172a',
        marginBottom: 5,
    },
    brandSub: {
        fontSize: 10,
        color: '#2563eb',
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    docTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#0f172a',
    },
    content: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#334155',
        textAlign: 'justify',
    },
    footer: {
        marginTop: 40,
        paddingTop: 20,
        borderTop: '1pt solid #e2e8f0',
        fontSize: 9,
        color: '#64748b',
        textAlign: 'center',
    }
});

interface LegalDocumentPDFProps {
    title: string;
    sections: { title: string; content: string }[];
    id: string;
}

const LegalDocumentPDF: React.FC<LegalDocumentPDFProps> = ({ title, sections, id }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.brandTitle}>Sistem Integrasi Panahan</Text>
                <Text style={styles.brandSub}>CORELINK SYSTEM (CSYSTEM)</Text>
                <Text style={styles.docTitle}>{title}</Text>
                <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 5 }}>Ref: {id}</Text>
            </View>

            {sections.map((section, index) => (
                <View key={index} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.content}>{section.content}</Text>
                </View>
            ))}

            <View style={styles.footer}>
                <Text>Dokumen ini dihasilkan secara otomatis oleh Sistem Integrasi Panahan (SIP).</Text>
                <Text>Tanggal Cetak: {new Date().toLocaleString('id-ID')}</Text>
            </View>
        </Page>
    </Document>
);

export default LegalDocumentPDF;
