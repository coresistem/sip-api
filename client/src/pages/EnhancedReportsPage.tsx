import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Calendar,
    Users,
    DollarSign,
    TrendingUp,
    Loader2,
    FileSpreadsheet
} from 'lucide-react';
import { api } from '../context/AuthContext';

interface ReportType {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    category: 'MEMBER' | 'FINANCE' | 'PERFORMANCE' | 'ATTENDANCE';
}

interface GeneratedReport {
    id: string;
    name: string;
    type: string;
    generatedAt: string;
    size: string;
    format: 'PDF' | 'XLSX';
}

const REPORT_TYPES: ReportType[] = [
    { id: 'member-list', name: 'Member List', description: 'Complete list of all club members', icon: Users, category: 'MEMBER' },
    { id: 'member-attendance', name: 'Attendance Report', description: 'Member attendance summary by period', icon: Calendar, category: 'ATTENDANCE' },
    { id: 'financial-summary', name: 'Financial Summary', description: 'Income, expenses, and balance', icon: DollarSign, category: 'FINANCE' },
    { id: 'invoice-report', name: 'Invoice Report', description: 'All invoices with payment status', icon: FileText, category: 'FINANCE' },
    { id: 'performance-summary', name: 'Performance Summary', description: 'Member scoring and progress', icon: TrendingUp, category: 'PERFORMANCE' },
    { id: 'training-log', name: 'Training Log', description: 'Training sessions and participation', icon: Calendar, category: 'ATTENDANCE' }
];

const MOCK_REPORTS: GeneratedReport[] = [
    { id: '1', name: 'Member List - January 2026', type: 'member-list', generatedAt: '2026-01-10', size: '125 KB', format: 'PDF' },
    { id: '2', name: 'Financial Summary Q4 2025', type: 'financial-summary', generatedAt: '2026-01-05', size: '340 KB', format: 'XLSX' },
    { id: '3', name: 'Attendance Report - December 2025', type: 'member-attendance', generatedAt: '2025-12-31', size: '85 KB', format: 'PDF' }
];

export default function EnhancedReportsPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'XLSX'>('PDF');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchRecentReports();
    }, []);

    const fetchRecentReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/v1/reports/recent');
            setRecentReports(response.data?.length > 0 ? response.data : MOCK_REPORTS);
        } catch (error) {
            console.log('Using mock data');
            setRecentReports(MOCK_REPORTS);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (reportId: string, format: 'PDF' | 'XLSX') => {
        setGenerating(reportId);
        try {
            await api.post('/api/v1/reports/generate', {
                reportType: reportId,
                format,
                dateFrom,
                dateTo
            });
        } catch (error) {
            // Mock success
        }

        // Mock add to recent reports
        const reportType = REPORT_TYPES.find(r => r.id === reportId);
        const newReport: GeneratedReport = {
            id: `new-${Date.now()}`,
            name: `${reportType?.name} - ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
            type: reportId,
            generatedAt: new Date().toISOString().split('T')[0],
            size: `${Math.floor(Math.random() * 500) + 50} KB`,
            format
        };
        setRecentReports(prev => [newReport, ...prev]);
        setGenerating(null);
    };

    const handleDownload = (report: GeneratedReport) => {
        // Mock download - in production would fetch from API
        console.log(`Downloading ${report.name}`);
        alert(`Downloaded: ${report.name}`);
    };

    const filteredReportTypes = REPORT_TYPES.filter(r =>
        categoryFilter === 'ALL' || r.category === categoryFilter
    );

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'MEMBER': return 'bg-blue-500/20 text-blue-400';
            case 'FINANCE': return 'bg-green-500/20 text-green-400';
            case 'PERFORMANCE': return 'bg-purple-500/20 text-purple-400';
            case 'ATTENDANCE': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                    Enhanced <span className="gradient-text">Reports</span>
                </h1>
                <p className="text-dark-400 mt-1">
                    Generate and export reports in PDF or Excel format
                </p>
            </motion.div>

            {/* Filters & Format */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-4"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-dark-400 mb-2">Category</label>
                        <div className="flex gap-2">
                            {['ALL', 'MEMBER', 'FINANCE', 'PERFORMANCE', 'ATTENDANCE'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === cat
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                        }`}
                                >
                                    {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-dark-400 mb-2">Format</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedFormat('PDF')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${selectedFormat === 'PDF'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </button>
                            <button
                                onClick={() => setSelectedFormat('XLSX')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${selectedFormat === 'XLSX'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                    }`}
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Excel
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Report Types */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-lg font-semibold text-white mb-4">Generate Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReportTypes.map(report => {
                        const Icon = report.icon;
                        return (
                            <div key={report.id} className="card p-4 hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg ${getCategoryColor(report.category).split(' ')[0]} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${getCategoryColor(report.category).split(' ')[1]}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-white">{report.name}</h3>
                                        <p className="text-sm text-dark-400 mt-1">{report.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => generateReport(report.id, selectedFormat)}
                                    disabled={generating === report.id}
                                    className="mt-4 w-full btn-primary flex items-center justify-center gap-2 text-sm"
                                >
                                    {generating === report.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Generate {selectedFormat}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Reports */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                <div className="p-4 border-b border-dark-700">
                    <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
                    <p className="text-sm text-dark-400">Previously generated reports</p>
                </div>
                {recentReports.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                        <p className="text-dark-400">No reports generated yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {recentReports.map(report => (
                            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg ${report.format === 'PDF' ? 'bg-red-500/20' : 'bg-green-500/20'} flex items-center justify-center`}>
                                        {report.format === 'PDF' ? (
                                            <FileText className="w-5 h-5 text-red-400" />
                                        ) : (
                                            <FileSpreadsheet className="w-5 h-5 text-green-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{report.name}</div>
                                        <div className="text-sm text-dark-400">
                                            {new Date(report.generatedAt).toLocaleDateString('id-ID')} • {report.size}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownload(report)}
                                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
