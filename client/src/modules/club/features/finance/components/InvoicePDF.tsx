import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        color: '#1e293b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#f59e0b', // Amber-500
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f59e0b',
        marginBottom: 4,
    },
    clubName: {
        fontSize: 12,
        color: '#64748b',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    invoiceTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        textTransform: 'uppercase',
    },
    invoiceMeta: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    metaLabel: {
        fontSize: 10,
        color: '#64748b',
        width: 80,
        textAlign: 'right',
        marginRight: 10,
    },
    metaValue: {
        fontSize: 10,
        color: '#1e293b',
        fontWeight: 'bold',
    },
    billToSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    billColumn: {
        flex: 1,
    },
    billLabel: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    billName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    billText: {
        fontSize: 10,
        color: '#475569',
        marginBottom: 2,
    },
    table: {
        width: '100%',
        marginBottom: 30,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    headerText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#475569',
    },
    rowText: {
        fontSize: 10,
        color: '#334155',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        marginBottom: 5,
        alignItems: 'center',
    },
    totalLabel: {
        width: 100,
        textAlign: 'right',
        fontSize: 10,
        color: '#64748b',
        marginRight: 15,
    },
    totalValue: {
        width: 100,
        textAlign: 'right',
        fontSize: 10,
        color: '#1e293b',
    },
    grandTotal: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#f59e0b',
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    grandTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 20,
    },
    footerText: {
        fontSize: 9,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 4,
    },
    paymentInfo: {
        backgroundColor: '#fef3c7',
        padding: 15,
        borderRadius: 4,
        marginTop: 20,
    },
    paymentTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: 5,
    },
    paymentDetail: {
        fontSize: 10,
        color: '#92400e',
    },
});

interface InvoicePDFProps {
    invoice: any; // Using any for flexibility, ideally match Invoice interface
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Parse items if they are JSON string
    const items = typeof invoice.items === 'string'
        ? JSON.parse(invoice.items)
        : (invoice.items || []);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.logoText}>ARCHERY CLUB</Text>
                        <Text style={styles.clubName}>
                            <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>S</Text>istem{' '}
                            <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>I</Text>ntegrasi{' '}
                            <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>P</Text>anahan
                        </Text>
                        <Text style={[styles.clubName, { marginTop: 10 }]}>Jakarta, Indonesia</Text>
                        <Text style={styles.clubName}>contact@archeryclub.id</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <View style={styles.invoiceMeta}>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Invoice No:</Text>
                                <Text style={styles.metaValue}>{invoice.id.substring(0, 8).toUpperCase()}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Date:</Text>
                                <Text style={styles.metaValue}>{formatDate(invoice.createdAt)}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Due Date:</Text>
                                <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Status:</Text>
                                <Text style={[styles.metaValue, {
                                    color: invoice.status === 'PAID' ? '#059669' : '#dc2626'
                                }]}>{invoice.status}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bill To */}
                <View style={styles.billToSection}>
                    <View style={styles.billColumn}>
                        <Text style={styles.billLabel}>BILL TO:</Text>
                        <Text style={styles.billName}>
                            {invoice.member?.name || invoice.recipientName || invoice.athlete?.user?.name || 'Valued Member'}
                        </Text>
                        {(invoice.member?.email || invoice.athlete?.user?.email) && (
                            <Text style={styles.billText}>
                                {invoice.member?.email || invoice.athlete?.user?.email}
                            </Text>
                        )}
                        {invoice.billingPeriod && (
                            <Text style={[styles.billText, { marginTop: 5 }]}>
                                Period: {invoice.billingPeriod}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, styles.colDesc]}>Description</Text>
                        <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
                        <Text style={[styles.headerText, styles.colPrice]}>Price</Text>
                        <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
                    </View>

                    {items.map((item: any, index: number) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.rowText, styles.colDesc]}>{item.description}</Text>
                            <Text style={[styles.rowText, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.rowText, styles.colPrice]}>
                                {formatCurrency(item.unitPrice || item.amount || 0)}
                            </Text>
                            <Text style={[styles.rowText, styles.colTotal]}>
                                {formatCurrency(item.total || ((item.quantity || 1) * (item.unitPrice || item.amount || 0)))}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(invoice.amount)}</Text>
                        </View>
                        <View style={[styles.totalRow, styles.grandTotal]}>
                            <Text style={[styles.totalLabel, styles.grandTotalLabel]}>Total:</Text>
                            <Text style={[styles.totalValue, styles.grandTotalValue]}>{formatCurrency(invoice.amount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Payment Instructions:</Text>
                    <Text style={styles.paymentDetail}>Bank: BCA</Text>
                    <Text style={styles.paymentDetail}>Account Name: Archery Club Indonesia</Text>
                    <Text style={styles.paymentDetail}>Account No: 123 456 7890</Text>
                    <Text style={[styles.paymentDetail, { marginTop: 5 }]}>
                        Please include Invoice No. in the transfer description.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                    <Text style={styles.footerText}>Terms & Conditions Apply</Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;
