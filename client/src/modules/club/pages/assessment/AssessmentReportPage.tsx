import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    Download,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    Target,
    TrendingUp,
    Award,
    Printer
} from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Types
interface AssessmentField {
    id: string;
    fieldName: string;
    sectionName: string;
    value: boolean | string | number | null;
    isScored: boolean;
    maxScore: number;
    earnedScore: number;
    feedbackWhenChecked: string;
    feedbackWhenUnchecked: string;
}

interface AssessmentRecord {
    id: string;
    athleteId: string;
    athleteName: string;
    moduleId: string;
    moduleName: string;
    assessorId: string;
    assessorName: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    status: 'completed' | 'in_progress' | 'draft';
    completedAt: string;
    fields: AssessmentField[];
}

// PDF Styles
const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottom: 2,
        borderBottomColor: '#f59e0b',
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    dateText: {
        fontSize: 10,
        color: '#64748b',
    },
    athleteInfo: {
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    athleteName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        marginTop: 5,
    },
    infoLabel: {
        fontSize: 10,
        color: '#64748b',
        width: 80,
    },
    infoValue: {
        fontSize: 10,
        color: '#1e293b',
    },
    scoreCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fef3c7',
        padding: 20,
        borderRadius: 8,
        marginBottom: 25,
    },
    scoreItem: {
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#92400e',
    },
    scoreLabel: {
        fontSize: 10,
        color: '#92400e',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        backgroundColor: '#e2e8f0',
        padding: 8,
        marginTop: 15,
        marginBottom: 10,
    },
    fieldRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottom: 1,
        borderBottomColor: '#e2e8f0',
    },
    fieldName: {
        flex: 1,
        fontSize: 11,
        color: '#374151',
    },
    fieldStatus: {
        width: 60,
        fontSize: 11,
        textAlign: 'center',
    },
    fieldStatusPassed: {
        color: '#059669',
        fontWeight: 'bold',
    },
    fieldStatusFailed: {
        color: '#dc2626',
    },
    fieldScore: {
        width: 60,
        fontSize: 11,
        textAlign: 'right',
        color: '#64748b',
    },
    feedbackSection: {
        marginTop: 25,
        padding: 15,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
    },
    feedbackTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 10,
    },
    feedbackItem: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    feedbackBullet: {
        fontSize: 10,
        color: '#22c55e',
        marginRight: 8,
    },
    feedbackText: {
        fontSize: 10,
        color: '#1e293b',
        flex: 1,
    },
    improvementSection: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    },
    improvementTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#991b1b',
        marginBottom: 10,
    },
    improvementBullet: {
        fontSize: 10,
        color: '#dc2626',
        marginRight: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTop: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 15,
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
    },
});

// PDF Document Component
const AssessmentPDF: React.FC<{ record: AssessmentRecord }> = ({ record }) => {
    // Group fields by section
    const fieldsBySection = record.fields.reduce((acc, field) => {
        const section = field.sectionName || 'General';
        if (!acc[section]) acc[section] = [];
        acc[section].push(field);
        return acc;
    }, {} as Record<string, AssessmentField[]>);

    // Get feedback items
    const passedFields = record.fields.filter(f => f.value === true && f.feedbackWhenChecked);
    const failedFields = record.fields.filter(f => f.value === false && f.feedbackWhenUnchecked);

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Header */}
                <View style={pdfStyles.header}>
                    <View style={pdfStyles.headerLeft}>
                        <Text style={pdfStyles.title}>{record.moduleName}</Text>
                        <Text style={pdfStyles.subtitle}>Assessment Report</Text>
                    </View>
                    <View style={pdfStyles.headerRight}>
                        <Text style={pdfStyles.dateText}>
                            Date: {new Date(record.completedAt).toLocaleDateString()}
                        </Text>
                        <Text style={pdfStyles.dateText}>
                            Assessor: {record.assessorName}
                        </Text>
                    </View>
                </View>

                {/* Athlete Info */}
                <View style={pdfStyles.athleteInfo}>
                    <Text style={pdfStyles.athleteName}>{record.athleteName}</Text>
                    <View style={pdfStyles.infoRow}>
                        <Text style={pdfStyles.infoLabel}>Assessment ID:</Text>
                        <Text style={pdfStyles.infoValue}>{record.id}</Text>
                    </View>
                </View>

                {/* Score Card */}
                <View style={pdfStyles.scoreCard}>
                    <View style={pdfStyles.scoreItem}>
                        <Text style={pdfStyles.scoreValue}>{record.totalScore}</Text>
                        <Text style={pdfStyles.scoreLabel}>Total Score</Text>
                    </View>
                    <View style={pdfStyles.scoreItem}>
                        <Text style={pdfStyles.scoreValue}>{record.maxPossibleScore}</Text>
                        <Text style={pdfStyles.scoreLabel}>Max Possible</Text>
                    </View>
                    <View style={pdfStyles.scoreItem}>
                        <Text style={pdfStyles.scoreValue}>{record.percentage}%</Text>
                        <Text style={pdfStyles.scoreLabel}>Percentage</Text>
                    </View>
                </View>

                {/* Fields by Section */}
                {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
                    <View key={sectionName} wrap={false}>
                        <Text style={pdfStyles.sectionTitle}>{sectionName}</Text>
                        {fields.map((field) => (
                            <View key={field.id} style={pdfStyles.fieldRow}>
                                <Text style={pdfStyles.fieldName}>{field.fieldName}</Text>
                                <Text style={[
                                    pdfStyles.fieldStatus,
                                    field.value ? pdfStyles.fieldStatusPassed : pdfStyles.fieldStatusFailed
                                ]}>
                                    {field.value ? '✓ YES' : '✗ NO'}
                                </Text>
                                {field.isScored && (
                                    <Text style={pdfStyles.fieldScore}>
                                        {field.earnedScore}/{field.maxScore}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}

                {/* Feedback - What Went Well */}
                {passedFields.length > 0 && (
                    <View style={pdfStyles.feedbackSection} wrap={false}>
                        <Text style={pdfStyles.feedbackTitle}>✓ Strengths & Positive Observations</Text>
                        {passedFields.slice(0, 5).map((field) => (
                            <View key={field.id} style={pdfStyles.feedbackItem}>
                                <Text style={pdfStyles.feedbackBullet}>•</Text>
                                <Text style={pdfStyles.feedbackText}>
                                    <Text style={{ fontWeight: 'bold' }}>{field.fieldName}:</Text> {field.feedbackWhenChecked}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Improvements Needed */}
                {failedFields.length > 0 && (
                    <View style={pdfStyles.improvementSection} wrap={false}>
                        <Text style={pdfStyles.improvementTitle}>⚡ Areas for Improvement</Text>
                        {failedFields.slice(0, 5).map((field) => (
                            <View key={field.id} style={pdfStyles.feedbackItem}>
                                <Text style={pdfStyles.improvementBullet}>•</Text>
                                <Text style={pdfStyles.feedbackText}>
                                    <Text style={{ fontWeight: 'bold' }}>{field.fieldName}:</Text> {field.feedbackWhenUnchecked}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <View style={pdfStyles.footer} fixed>
                    <Text style={pdfStyles.footerText}>Generated by CORE - Central Archery Online Database</Text>
                    <Text style={pdfStyles.footerText}>
                        {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

// Main Component
const AssessmentReportPage: React.FC = () => {
    const { recordId } = useParams<{ recordId: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<AssessmentRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockRecord: AssessmentRecord = {
                id: recordId || 'ASM-001',
                athleteId: 'ATH-001',
                athleteName: 'Rangga Pratama',
                moduleId: 'MOD-001',
                moduleName: 'Basic Archery Assessment',
                assessorId: 'USR-001',
                assessorName: 'Coach Ahmad',
                totalScore: 475,
                maxPossibleScore: 625,
                percentage: 76,
                status: 'completed',
                completedAt: new Date().toISOString(),
                fields: [
                    // Bow Arm Section
                    { id: 'f1', fieldName: 'Fingers', sectionName: 'Bow Arm', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Good finger placement on the bow grip', feedbackWhenUnchecked: 'Work on proper finger placement' },
                    { id: 'f2', fieldName: 'Wrist', sectionName: 'Bow Arm', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Proper wrist alignment maintained', feedbackWhenUnchecked: 'Focus on wrist alignment' },
                    { id: 'f3', fieldName: 'Elbow Rotate', sectionName: 'Bow Arm', value: false, isScored: true, maxScore: 25, earnedScore: 0, feedbackWhenChecked: 'Excellent elbow rotation', feedbackWhenUnchecked: 'Practice elbow rotation to avoid string slap' },
                    { id: 'f4', fieldName: 'Shoulder Down', sectionName: 'Bow Arm', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Shoulder properly lowered', feedbackWhenUnchecked: 'Keep shoulder down during draw' },
                    // Draw Arm Section
                    { id: 'f5', fieldName: 'Hook', sectionName: 'Draw Arm', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Clean hook on the string', feedbackWhenUnchecked: 'Improve hook technique' },
                    { id: 'f6', fieldName: 'Knuckle', sectionName: 'Draw Arm', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Proper knuckle position', feedbackWhenUnchecked: 'Adjust knuckle angle' },
                    { id: 'f7', fieldName: 'Elbow Height', sectionName: 'Draw Arm', value: false, isScored: true, maxScore: 25, earnedScore: 0, feedbackWhenChecked: 'Elbow at correct height', feedbackWhenUnchecked: 'Raise elbow to shoulder level' },
                    { id: 'f8', fieldName: 'Shoulder Align', sectionName: 'Draw Arm', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Shoulders aligned with target', feedbackWhenUnchecked: 'Work on shoulder alignment' },
                    // Posture Section
                    { id: 'f9', fieldName: 'Stance', sectionName: 'Posture', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Stable athletic stance', feedbackWhenUnchecked: 'Improve stance stability' },
                    { id: 'f10', fieldName: 'Core', sectionName: 'Posture', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Strong core engagement', feedbackWhenUnchecked: 'Engage core muscles' },
                    { id: 'f11', fieldName: 'Head Position', sectionName: 'Posture', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Head position is neutral', feedbackWhenUnchecked: 'Keep head neutral and facing target' },
                    // Aiming Section
                    { id: 'f12', fieldName: 'Anchor Point', sectionName: 'Aiming', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Consistent anchor point', feedbackWhenUnchecked: 'Develop consistent anchor' },
                    { id: 'f13', fieldName: 'Eye Dominance', sectionName: 'Aiming', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Proper use of dominant eye', feedbackWhenUnchecked: 'Work with dominant eye' },
                    { id: 'f14', fieldName: 'Sight Picture', sectionName: 'Aiming', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Clear sight picture acquired', feedbackWhenUnchecked: 'Focus on sight alignment' },
                    // Release Section
                    { id: 'f15', fieldName: 'Follow Through', sectionName: 'Release', value: false, isScored: true, maxScore: 25, earnedScore: 0, feedbackWhenChecked: 'Excellent follow through', feedbackWhenUnchecked: 'Maintain position after release' },
                    { id: 'f16', fieldName: 'Relaxed Release', sectionName: 'Release', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Smooth and relaxed release', feedbackWhenUnchecked: 'Avoid tension during release' },
                    // Mental Section
                    { id: 'f17', fieldName: 'Focus', sectionName: 'Mental', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Strong mental focus maintained', feedbackWhenUnchecked: 'Improve concentration' },
                    { id: 'f18', fieldName: 'Confidence', sectionName: 'Mental', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Shows good confidence', feedbackWhenUnchecked: 'Build confidence through practice' },
                    { id: 'f19', fieldName: 'Breathing', sectionName: 'Mental', value: true, isScored: true, maxScore: 25, earnedScore: 25, feedbackWhenChecked: 'Proper breathing technique', feedbackWhenUnchecked: 'Practice controlled breathing' },
                ],
            };
            setRecord(mockRecord);
            setLoading(false);
        }, 500);
    }, [recordId]);

    // Generate PDF
    const handleDownloadPDF = useCallback(async () => {
        if (!record) return;
        setGenerating(true);
        try {
            const blob = await pdf(<AssessmentPDF record={record} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${record.athleteName.replace(/\s+/g, '_')}_${record.moduleName.replace(/\s+/g, '_')}_Report.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
        setGenerating(false);
    }, [record]);

    // Print
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading assessment report...</p>
                </div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-xl text-slate-400 mb-2">Assessment Not Found</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-amber-400 hover:text-amber-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Group fields by section
    const fieldsBySection = record.fields.reduce((acc, field) => {
        const section = field.sectionName || 'General';
        if (!acc[section]) acc[section] = [];
        acc[section].push(field);
        return acc;
    }, {} as Record<string, AssessmentField[]>);

    const passedCount = record.fields.filter(f => f.value === true).length;
    const failedCount = record.fields.filter(f => f.value === false).length;

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{record.moduleName}</h1>
                            <p className="text-slate-400">Assessment Report</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Athlete Info Card */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{record.athleteName}</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(record.completedAt).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        Assessed by: {record.assessorName}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-500">ID: {record.id}</span>
                        </div>
                    </div>
                </div>

                {/* Score Overview */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/30 p-6 text-center">
                        <Award className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-amber-400">{record.totalScore}</div>
                        <div className="text-sm text-slate-400">Total Score</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 text-center">
                        <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-white">{record.maxPossibleScore}</div>
                        <div className="text-sm text-slate-400">Max Possible</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl border border-emerald-500/30 p-6 text-center">
                        <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-emerald-400">{record.percentage}%</div>
                        <div className="text-sm text-slate-400">Percentage</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 text-center">
                        <div className="flex justify-center gap-4 mb-2">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            <XCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">
                            <span className="text-emerald-400">{passedCount}</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span className="text-red-400">{failedCount}</span>
                        </div>
                        <div className="text-sm text-slate-400">Pass/Fail</div>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">Detailed Assessment</h3>
                    </div>

                    {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
                        <div key={sectionName}>
                            <div className="px-6 py-3 bg-slate-700/50 border-b border-slate-700">
                                <h4 className="font-medium text-amber-400">{sectionName}</h4>
                            </div>
                            <div className="divide-y divide-slate-700/50">
                                {fields.map((field) => (
                                    <div key={field.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {field.value ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-400" />
                                            )}
                                            <span className="text-white">{field.fieldName}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-sm ${field.value ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {field.value ? 'Yes' : 'No'}
                                            </span>
                                            {field.isScored && (
                                                <span className="text-sm text-slate-400">
                                                    {field.earnedScore}/{field.maxScore} pts
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feedback Section */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-6">
                        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Strengths
                        </h3>
                        <ul className="space-y-3">
                            {record.fields
                                .filter(f => f.value === true && f.feedbackWhenChecked)
                                .slice(0, 5)
                                .map(field => (
                                    <li key={field.id} className="text-sm">
                                        <span className="font-medium text-emerald-300">{field.fieldName}:</span>{' '}
                                        <span className="text-slate-300">{field.feedbackWhenChecked}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-6">
                        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {record.fields
                                .filter(f => f.value === false && f.feedbackWhenUnchecked)
                                .slice(0, 5)
                                .map(field => (
                                    <li key={field.id} className="text-sm">
                                        <span className="font-medium text-red-300">{field.fieldName}:</span>{' '}
                                        <span className="text-slate-300">{field.feedbackWhenUnchecked}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentReportPage;
