
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts (using standard fonts for now to avoid loading issues)
// In a real app, you'd register custom fonts here.

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    border: {
        border: '5px solid #D4AF37', // Gold border
        width: '100%',
        height: '100%',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    header: {
        fontSize: 36,
        marginBottom: 20,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    subHeader: {
        fontSize: 18,
        marginBottom: 10,
        color: '#666',
        textAlign: 'center',
    },
    name: {
        fontSize: 48,
        marginVertical: 20,
        color: '#000',
        fontWeight: 'heavy',
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
    },
    details: {
        fontSize: 14,
        marginVertical: 5,
        color: '#444',
        textAlign: 'center',
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    signatureBlock: {
        alignItems: 'center',
        borderTop: '1px solid #333',
        paddingTop: 10,
        width: 150,
    },
    signatureText: {
        fontSize: 12,
        color: '#333',
    },
    qrCode: {
        width: 60,
        height: 60,
        marginTop: 20,
    },
    goldMedalIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 50,
        height: 50,
    }
});

interface CertificateProps {
    eventName: string;
    athleteName: string;
    category: string;
    division: string;
    rank?: string | number;
    date: string;
    clubName?: string;
    qrCodeData?: string; // We will generate QR as image data URL and pass here
}

export const CertificateTemplate: React.FC<CertificateProps> = ({
    eventName,
    athleteName,
    category,
    division,
    rank,
    date,
    clubName,
    qrCodeData
}) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.border}>

                {/* Header Section */}
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <Text style={[styles.subHeader, { letterSpacing: 2, fontSize: 12 }]}>CERTIFICATE OF ACHIEVEMENT</Text>
                    <Text style={styles.header}>{eventName}</Text>

                    <Text style={styles.subHeader}>This certificate is proudly detailsed to</Text>
                </View>

                {/* Name Section */}
                <Text style={styles.name}>{athleteName}</Text>

                {/* Details Section */}
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.details}>for outstanding performance in</Text>
                    <Text style={[styles.details, { fontSize: 18, fontFamily: 'Helvetica-Bold', marginVertical: 10 }]}>
                        {division} - {category}
                    </Text>
                    {rank && (
                        <Text style={[styles.details, { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' }]}>
                            Rank: {rank}
                        </Text>
                    )}
                    {clubName && (
                        <Text style={[styles.details, { marginTop: 10 }]}>Representing: {clubName}</Text>
                    )}
                </View>

                {/* Footer / Signatures */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureText}>Event Organizer</Text>
                    </View>

                    {/* Center Date */}
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, color: '#888' }}>{date}</Text>
                        {qrCodeData && <Image src={qrCodeData} style={styles.qrCode} />}
                    </View>

                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureText}>Competition Manager</Text>
                    </View>
                </View>

            </View>
        </Page>
    </Document>
);

export default CertificateTemplate;
