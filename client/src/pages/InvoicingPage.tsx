import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Send,
    Check,
    X,
    Clock,
    Eye,
    Loader2,
    AlertCircle,
    Calendar,
    User,
    Settings,
    Trash2,
    Save,
    ChevronDown,
    Download
} from 'lucide-react';
import { api } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../components/finance/InvoicePDF';

interface Invoice {
    id: string;
    invoiceNumber: string;
    member: {
        id: string;
        name: string;
        email: string;
    };
    description: string;
    items: InvoiceItem[];
    totalAmount: number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    dueDate: string;
    createdAt: string;
    paidAt?: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface Member {
    id: string;
    name: string;
    email: string;
}

// Mock data removed - using real API

export default function InvoicingPage() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [recipients, setRecipients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Recipient Selector State
    const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [clubProfile, setClubProfile] = useState<any>(null);

    // Create form state
    const [newInvoice, setNewInvoice] = useState({
        memberId: '',
        memberIds: [] as string[],
        isBulk: false,
        description: '',
        amount: 0,
        items: [{ description: '', quantity: 1, unitPrice: 0 }] as { description: string; quantity: number; unitPrice: number }[],
        dueDate: ''
    });

    // Template state
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isSaveTemplate, setIsSaveTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');

    // UI State
    const [activeTab, setActiveTab] = useState<'invoices' | 'templates'>('invoices');
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, recipientsRes, profileRes, templatesRes] = await Promise.all([
                api.get('/finance/payments'),
                api.get('/finance/recipients'),
                api.get('/clubs/profile').catch(() => ({ data: { data: null } })),
                api.get('/finance/templates')
            ]);

            // Map finance/payments data to Invoice interface
            const rawPayments = invoicesRes.data.data || [];
            const mappedInvoices = rawPayments.map((fee: any) => ({
                id: fee.id,
                invoiceNumber: `INV-${new Date(fee.createdAt).getFullYear()}-${String(fee.id).slice(-4).toUpperCase()}`,
                member: {
                    id: fee.athleteId || fee.recipientId,
                    name: fee.athlete?.user?.name || fee.recipientName || 'Unknown',
                    email: fee.athlete?.user?.email || ''
                },
                description: fee.description,
                totalAmount: fee.amount,
                status: fee.status,
                dueDate: fee.dueDate,
                createdAt: fee.createdAt,
                paidAt: fee.transactionDate,
                items: [{ description: fee.description, quantity: 1, unitPrice: fee.amount, total: fee.amount }] // Simplified for now
            }));

            setInvoices(mappedInvoices);

            // Map members API response to simple form
            setRecipients(recipientsRes.data.data || []);
            setClubProfile(profileRes.data.data);
            setTemplates(templatesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch invoicing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.put('/clubs/profile', clubProfile);
            setShowSettingsModal(false);
            // Optionally show success toast
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setNewInvoice(prev => ({
                ...prev,
                description: template.description || '',
                items: JSON.parse(template.items || '[]').length > 0
                    ? JSON.parse(template.items || '[]')
                    : [{ description: template.description || 'Service', quantity: 1, unitPrice: template.amount }]
            }));
            setSelectedTemplateId(templateId);
        }
    };

    const handleCreateInvoice = async (status: 'DRAFT' | 'PENDING' = 'PENDING') => {
        setActionLoading(true);
        try {
            // Calculate totals for local logic (though backend might recalculate)
            const items = newInvoice.items.map(item => ({
                ...item,
                total: item.quantity * item.unitPrice
            }));
            const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

            // Payload builder helper
            const buildPayload = (recipient: any, overrides: any = {}) => {
                // Generate billing period from due date or current date
                const dateObj = newInvoice.dueDate ? new Date(newInvoice.dueDate) : new Date();
                const billingPeriod = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

                const base = {
                    ...newInvoice,
                    status, // 'DRAFT' or 'PENDING'
                    items: JSON.stringify(newInvoice.items),
                    amount: totalAmount,
                    billingPeriod, // Required by backend
                    saveAsTemplate: isSaveTemplate,
                    templateName: isSaveTemplate ? templateName : undefined,
                    ...overrides
                };

                // Determine correct ID field
                if (recipient.type === 'ATHLETE') {
                    return { ...base, athleteId: recipient.id };
                } else {
                    return { ...base, recipientId: recipient.id };
                }
            };

            if (newInvoice.isBulk) {
                // Bulk Creation
                const selectedRecipients = recipients.filter(r => newInvoice.memberIds.includes(r.id));

                await Promise.all(selectedRecipients.map(recipient =>
                    api.post('/finance/payments', buildPayload(recipient))
                ));
                toast.success(`Sent to ${selectedRecipients.length} recipients`);
            } else {
                // Single Creation
                const recipient = recipients.find(r => r.id === newInvoice.memberId);
                // Fallback for direct user input if memberId is not in list (edge case)
                // But generally memberId should be in list.
                if (!recipient) {
                    // Try to proceed if memberId is set (maybe it IS the ID)
                    if (!newInvoice.memberId) {
                        toast.error("Recipient not found");
                        return;
                    }
                    // Assumption: Manual ID entry? Unlikely in this UI.
                    // But let's handle the "Create Draft" flow where memberId might be set.
                }

                if (recipient) {
                    await api.post('/finance/payments', buildPayload(recipient));
                } else {
                    // Legacy fallback or error
                    toast.error("Invalid recipient");
                    return;
                }

                toast.success(status === 'DRAFT' ? 'Draft saved' : 'Invoice sent');
            }

            setShowCreateModal(false);
            await fetchData();
            // Reset form
            setNewInvoice({
                memberId: '',
                memberIds: [],
                isBulk: false,
                description: '',
                amount: 0,
                dueDate: '',
                items: [{ description: '', quantity: 1, unitPrice: 0 }]
            });
            setIsSaveTemplate(false);
            setTemplateName('');
        } catch (error) {
            console.error('Create invoice error:', error);
            toast.error('Failed to create invoice');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendInvoice = async (invoiceId: string) => {
        setActionLoading(true);
        try {
            await api.patch(`/finance/payments/${invoiceId}`, { status: 'SENT' }); // Use PATCH for updates
            setInvoices(prev => prev.map(inv =>
                inv.id === invoiceId ? { ...inv, status: 'SENT' } : inv
            ));
        } catch (error) {
            console.error('Failed to send invoice:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkPaid = async (invoiceId: string) => {
        setActionLoading(true);
        try {
            await api.patch(`/finance/payments/${invoiceId}`, { status: 'VERIFIED' }); // Or PAID, backend handles mapping
            setInvoices(prev => prev.map(inv =>
                inv.id === invoiceId ? { ...inv, status: 'PAID', paidAt: new Date().toISOString().split('T')[0] } : inv
            ));
        } catch (error) {
            console.error('Failed to mark paid:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setNewInvoice({
            memberId: '',
            memberIds: [],
            isBulk: false,
            description: '',
            amount: 0,
            items: [{ description: '', quantity: 1, unitPrice: 0 }],
            dueDate: ''
        });
    };

    // Bulk Actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedInvoiceIds(filteredInvoices.map(i => i.id));
        } else {
            setSelectedInvoiceIds([]);
        }
    };

    const handleSelectInvoice = (id: string) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkMarkPaid = async () => {
        if (!confirm(`Mark ${selectedInvoiceIds.length} invoices as PAID?`)) return;
        setActionLoading(true);
        try {
            await Promise.all(selectedInvoiceIds.map(id => api.patch(`/finance/payments/${id}`, { status: 'VERIFIED' })));
            fetchData();
            setSelectedInvoiceIds([]);
        } catch (error) {
            console.error('Bulk mark paid failed', error);
        } finally {
            setActionLoading(false);
        }
    };

    const addItem = () => {
        setNewInvoice(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        setNewInvoice(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        setNewInvoice(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'SENT': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'PAID': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'OVERDUE': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'CANCELLED': return 'bg-dark-700 text-dark-400';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const filteredInvoices = invoices.filter(inv => {
        const memberName = inv.member?.name || '';
        const invoiceNumber = inv.invoiceNumber || '';

        const matchesSearch = memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Summary stats
    const totalPending = invoices.filter(i => i.status === 'SENT').reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
    const totalOverdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.totalAmount, 0);

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
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">
                        <span className="gradient-text">Invoicing</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Create and manage member invoices
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="btn-secondary p-2"
                        title="Invoice Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </button>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-sm text-dark-400">Pending</div>
                            <div className="text-xl font-bold text-white">{formatCurrency(totalPending)}</div>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm text-dark-400">Collected</div>
                            <div className="text-xl font-bold text-white">{formatCurrency(totalPaid)}</div>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <div className="text-sm text-dark-400">Overdue</div>
                            <div className="text-xl font-bold text-white">{formatCurrency(totalOverdue)}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters & Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4"
            >
                {/* Main Tabs */}
                <div className="flex border-b border-dark-700">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'invoices' ? 'border-primary-500 text-primary-400' : 'border-transparent text-dark-400 hover:text-white'}`}
                    >
                        Invoices
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'templates' ? 'border-primary-500 text-primary-400' : 'border-transparent text-dark-400 hover:text-white'}`}
                    >
                        Templates
                    </button>
                </div>

                {activeTab === 'invoices' && (
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-10 w-full"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Content Area */}
            {activeTab === 'invoices' ? (
                <>
                    {/* Bulk Action Bar */}
                    <AnimatePresence>
                        {selectedInvoiceIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dark-800 text-white px-6 py-3 rounded-xl shadow-xl border border-dark-600 z-40 flex items-center gap-4"
                            >
                                <span className="font-medium text-dark-300">{selectedInvoiceIds.length} selected</span>
                                <div className="h-6 w-px bg-dark-600" />
                                <button
                                    onClick={handleBulkMarkPaid}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                                >
                                    <Check className="w-4 h-4" /> Mark Paid
                                </button>
                                <button
                                    onClick={() => setSelectedInvoiceIds([])}
                                    className="p-1 hover:bg-dark-700 rounded-full ml-4"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Invoice List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                    >
                        <div className="p-4 border-b border-dark-700 flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={filteredInvoices.length > 0 && selectedInvoiceIds.length === filteredInvoices.length}
                                onChange={handleSelectAll}
                            />
                            <span className="text-sm text-dark-400">Select All</span>
                        </div>
                        {filteredInvoices.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                                <h3 className="text-lg font-medium text-white mb-2">No Invoices Found</h3>
                                <p className="text-dark-400">Create your first invoice to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-dark-700">
                                {filteredInvoices.map(invoice => (
                                    <div key={invoice.id} className={`p-4 hover:bg-dark-800/50 transition-colors border-b border-dark-700/50 last:border-0 ${selectedInvoiceIds.includes(invoice.id) ? 'bg-primary-500/5' : ''}`}>
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedInvoiceIds.includes(invoice.id)}
                                                    onChange={() => handleSelectInvoice(invoice.id)}
                                                />
                                                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{invoice.invoiceNumber}</div>
                                                    <div className="text-sm text-dark-400">{invoice.member?.name || 'Unknown Member'}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white">{formatCurrency(invoice.totalAmount)}</div>
                                                <div className="text-sm text-dark-400">Due: {new Date(invoice.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                                <button
                                                    onClick={() => { setSelectedInvoice(invoice); setShowDetailModal(true); }}
                                                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {invoice.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleSendInvoice(invoice.id)}
                                                        disabled={actionLoading}
                                                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {invoice.status === 'SENT' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(invoice.id)}
                                                        disabled={actionLoading}
                                                        className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            ) : (
                /* Templates Tab */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="p-4 border-b border-dark-700 flex justify-between items-center">
                        <h3 className="font-semibold text-white">Saved Templates</h3>
                    </div>
                    {templates.length === 0 ? (
                        <div className="p-12 text-center text-dark-400">
                            <p>No templates found. Save a template when creating an invoice.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-dark-700">
                            {templates.map(template => (
                                <div key={template.id} className="p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{template.name}</div>
                                            <div className="text-sm text-dark-400">{template.description} • {formatCurrency(template.amount)}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                handleLoadTemplate(template.id);
                                                setShowCreateModal(true);
                                                setPreviewMode(false);
                                            }}
                                            className="px-3 py-1.5 text-xs font-medium bg-primary-500/10 text-primary-400 rounded hover:bg-primary-500/20 border border-primary-500/20"
                                        >
                                            Use Template
                                        </button>
                                        <button
                                            // TODO: Add delete functionality
                                            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Create Invoice Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">
                                    {previewMode ? 'Preview Invoice' : 'Create New Invoice'}
                                </h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-dark-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {!previewMode ? (
                                /* Edit Mode */
                                <div className="space-y-4">
                                    {/* Template Loader */}
                                    {templates.length > 0 && !newInvoice.items.length && (
                                        <div className="bg-dark-800 p-3 rounded-lg border border-dark-700">
                                            <label className="text-sm text-primary-400 font-medium mb-1 block">Load from Template</label>
                                            <select
                                                className="input w-full text-sm"
                                                value={selectedTemplateId}
                                                onChange={(e) => handleLoadTemplate(e.target.value)}
                                            >
                                                <option value="">Select a template...</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name} - {formatCurrency(t.amount)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Member Select */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm text-dark-400">Recipients</label>
                                            <button
                                                onClick={() => setNewInvoice(prev => ({ ...prev, isBulk: !prev.isBulk, memberId: '', memberIds: [] }))}
                                                className="text-xs text-primary-400 hover:text-primary-300"
                                            >
                                                {newInvoice.isBulk ? 'Switch to Single' : 'Switch to Collective'}
                                            </button>
                                        </div>

                                        {newInvoice.isBulk ? (
                                            /* ... Bulk UI ... */
                                            <div className="card bg-dark-800 border border-dark-700">
                                                {/* Search Bar for Bulk */}
                                                <div className="p-2 border-b border-dark-700">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search all columns..."
                                                            value={recipientSearch}
                                                            onChange={(e) => setRecipientSearch(e.target.value)}
                                                            className="input w-full pl-9 h-8 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Table Header */}
                                                <div className="grid grid-cols-12 px-3 py-2 bg-dark-900/50 text-xs font-medium text-dark-400 border-b border-dark-700">
                                                    <div className="col-span-1">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox w-3.5 h-3.5"
                                                            checked={
                                                                recipients.filter(r =>
                                                                    r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                                                                    (r.email && r.email.toLowerCase().includes(recipientSearch.toLowerCase())) ||
                                                                    (r.type && r.type.toLowerCase().includes(recipientSearch.toLowerCase()))
                                                                ).length > 0 &&
                                                                recipients.filter(r =>
                                                                    r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                                                                    (r.email && r.email.toLowerCase().includes(recipientSearch.toLowerCase())) ||
                                                                    (r.type && r.type.toLowerCase().includes(recipientSearch.toLowerCase()))
                                                                ).every(r => newInvoice.memberIds.includes(r.id))
                                                            }
                                                            onChange={(e) => {
                                                                const filtered = recipients.filter(r =>
                                                                    r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                                                                    (r.email && r.email.toLowerCase().includes(recipientSearch.toLowerCase())) ||
                                                                    (r.type && r.type.toLowerCase().includes(recipientSearch.toLowerCase()))
                                                                );
                                                                if (e.target.checked) {
                                                                    setNewInvoice(prev => ({
                                                                        ...prev,
                                                                        memberIds: [...new Set([...prev.memberIds, ...filtered.map(r => r.id)])]
                                                                    }));
                                                                } else {
                                                                    const idsToRemove = filtered.map(r => r.id);
                                                                    setNewInvoice(prev => ({
                                                                        ...prev,
                                                                        memberIds: prev.memberIds.filter(id => !idsToRemove.includes(id))
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-span-3">ROLE</div>
                                                    <div className="col-span-8">NAME</div>
                                                </div>

                                                {/* List */}
                                                <div className="max-h-48 overflow-y-auto">
                                                    {recipients
                                                        .filter(r =>
                                                            r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                                                            (r.email && r.email.toLowerCase().includes(recipientSearch.toLowerCase())) ||
                                                            (r.type && r.type.toLowerCase().includes(recipientSearch.toLowerCase()))
                                                        )
                                                        .map(member => (
                                                            <label key={member.id} className="grid grid-cols-12 px-3 py-2 hover:bg-dark-700/50 cursor-pointer items-center border-b border-dark-700/50 last:border-0 transition-colors">
                                                                <div className="col-span-1 flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="checkbox w-3.5 h-3.5"
                                                                        checked={newInvoice.memberIds.includes(member.id)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setNewInvoice(prev => ({ ...prev, memberIds: [...prev.memberIds, member.id] }));
                                                                            } else {
                                                                                setNewInvoice(prev => ({ ...prev, memberIds: prev.memberIds.filter(id => id !== member.id) }));
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${member.type === 'ATHLETE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                        member.type === 'CLUB' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                            'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                                        }`}>
                                                                        {member.type || 'USER'}
                                                                    </span>
                                                                </div>
                                                                <div className="col-span-8 text-sm text-white truncate">
                                                                    {member.name}
                                                                    {member.subtext && <span className="text-dark-400 ml-1 text-xs">({member.subtext})</span>}
                                                                </div>
                                                            </label>
                                                        ))}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Single Select */
                                            <div className="relative">
                                                <div
                                                    className="input w-full flex items-center justify-between cursor-pointer"
                                                    onClick={() => setIsRecipientDropdownOpen(!isRecipientDropdownOpen)}
                                                >
                                                    <span className={newInvoice.memberId ? 'text-white' : 'text-dark-400'}>
                                                        {newInvoice.memberId
                                                            ? recipients.find(r => r.id === newInvoice.memberId)?.name || 'Unknown Recipient'
                                                            : 'Select recipient...'}
                                                    </span>
                                                    <ChevronDown className="w-4 h-4 text-dark-400" />
                                                </div>

                                                {isRecipientDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50">
                                                        <div className="p-2 border-b border-dark-700">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search name..."
                                                                    value={recipientSearch}
                                                                    onChange={(e) => setRecipientSearch(e.target.value)}
                                                                    className="input w-full pl-9 h-9 text-sm"
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {recipients
                                                                .filter(r => r.name.toLowerCase().includes(recipientSearch.toLowerCase()))
                                                                .map(member => (
                                                                    <div
                                                                        key={member.id}
                                                                        className="grid grid-cols-12 px-3 py-2 hover:bg-dark-700 cursor-pointer items-center border-b border-dark-700/50 last:border-0"
                                                                        onClick={() => {
                                                                            setNewInvoice(prev => ({ ...prev, memberId: member.id }));
                                                                            setIsRecipientDropdownOpen(false);
                                                                            setRecipientSearch('');
                                                                        }}
                                                                    >
                                                                        <div className="col-span-4 flex items-center gap-2">
                                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${member.type === 'ATHLETE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                                member.type === 'CLUB' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                                    'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                                                }`}>
                                                                                {member.type || 'USER'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="col-span-8 font-medium text-white truncate">
                                                                            {member.name}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {newInvoice.isBulk && (
                                            <p className="text-xs text-dark-400 mt-1">{newInvoice.memberIds.length} recipients selected</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={newInvoice.description}
                                            onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="e.g., Monthly Training Fee - January 2026"
                                            className="input w-full"
                                        />
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-2">Due Date</label>
                                        <input
                                            type="date"
                                            value={newInvoice.dueDate}
                                            onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                                            className="input w-full"
                                        />
                                    </div>

                                    {/* Line Items */}
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-2">Items</label>
                                        <div className="space-y-2">
                                            {newInvoice.items.map((item, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Description"
                                                        className="input flex-1"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        placeholder="Qty"
                                                        className="input w-20"
                                                        min="1"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                                                        placeholder="Price"
                                                        className="input w-32"
                                                        min="0"
                                                    />
                                                    {newInvoice.items.length > 1 && (
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={addItem}
                                            className="text-sm text-primary-400 hover:text-primary-300 mt-2"
                                        >
                                            + Add Item
                                        </button>
                                    </div>

                                    {/* Total */}
                                    <div className="pt-4 border-t border-dark-700">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-dark-400">Total:</span>
                                            <span className="text-white">
                                                {formatCurrency(newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
                                            </span>
                                        </div>

                                        {/* Save as Template */}
                                        <div className="bg-dark-800 p-3 rounded-lg border border-dark-700 mt-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={isSaveTemplate}
                                                    onChange={(e) => setIsSaveTemplate(e.target.checked)}
                                                />
                                                <span className="text-sm text-white">Save as Template</span>
                                            </label>
                                            {isSaveTemplate && (
                                                <input
                                                    type="text"
                                                    placeholder="Template Name"
                                                    className="input w-full mt-2"
                                                    value={templateName}
                                                    onChange={(e) => setTemplateName(e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Preview Mode */
                                <div className="space-y-6 bg-dark-800/50 p-6 rounded-lg border border-dark-700">
                                    <div className="flex justify-between items-start border-b border-dark-700 pb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-white">INVOICE DRAFT</h4>
                                            <p className="text-sm text-dark-400 mt-1">
                                                To: {newInvoice.isBulk
                                                    ? `${newInvoice.memberIds.length} Recipients (Collective)`
                                                    : recipients.find(r => r.id === newInvoice.memberId)?.name || 'Unknown'
                                                }
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-dark-400">Due Date</p>
                                            <p className="font-medium text-white">{newInvoice.dueDate ? new Date(newInvoice.dueDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-sm font-medium text-dark-300 border-b border-dark-700 pb-2 flex justify-between">
                                            <span>Description</span>
                                            <span>Amount</span>
                                        </div>
                                        {newInvoice.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span>{item.description} <span className="text-dark-400">x{item.quantity}</span></span>
                                                <span className="text-white font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-dark-700 pt-4 flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-xl font-bold text-primary-400">
                                            {formatCurrency(newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                {previewMode ? (
                                    <button
                                        onClick={() => setPreviewMode(false)}
                                        className="btn-secondary flex-1"
                                    >
                                        Back to Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setPreviewMode(true)}
                                        disabled={(newInvoice.isBulk ? newInvoice.memberIds.length === 0 : !newInvoice.memberId) || !newInvoice.description || !newInvoice.dueDate}
                                        className="btn-secondary flex-1"
                                    >
                                        Preview Invoice
                                    </button>
                                )}

                                <button
                                    onClick={() => handleCreateInvoice('DRAFT')}
                                    disabled={(newInvoice.isBulk ? newInvoice.memberIds.length === 0 : !newInvoice.memberId) || !newInvoice.description || !newInvoice.dueDate || actionLoading}
                                    className="btn-secondary flex-none px-6"
                                    title="Save as Draft"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleCreateInvoice('PENDING')}
                                    disabled={(newInvoice.isBulk ? newInvoice.memberIds.length === 0 : !newInvoice.memberId) || !newInvoice.description || !newInvoice.dueDate || actionLoading}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {newInvoice.isBulk ? 'Send to All' : 'Send Invoice'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettingsModal && clubProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowSettingsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Invoice Settings</h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={clubProfile.name || ''}
                                        onChange={e => setClubProfile({ ...clubProfile, name: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={clubProfile.phone || ''}
                                            onChange={e => setClubProfile({ ...clubProfile, phone: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={clubProfile.email || ''}
                                            onChange={e => setClubProfile({ ...clubProfile, email: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Address</label>
                                    <textarea
                                        value={clubProfile.address || ''}
                                        onChange={e => setClubProfile({ ...clubProfile, address: e.target.value })}
                                        className="input w-full min-h-[80px]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">City</label>
                                        <input
                                            type="text"
                                            value={clubProfile.city || ''}
                                            onChange={e => setClubProfile({ ...clubProfile, city: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            value={clubProfile.postalCode || ''}
                                            onChange={e => setClubProfile({ ...clubProfile, postalCode: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSettingsModal(false)}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invoice Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedInvoice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card p-6 max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">{selectedInvoice.invoiceNumber}</h3>
                                <span className={`px-3 py-1 text-xs font-medium rounded border ${getStatusBadge(selectedInvoice.status)}`}>
                                    {selectedInvoice.status}
                                </span>
                            </div>

                            {clubProfile && (
                                <div className="mb-6 p-4 bg-dark-800/50 rounded-lg text-sm">
                                    <div className="font-bold text-white mb-1">{clubProfile.name}</div>
                                    <div className="text-dark-400">{clubProfile.address}</div>
                                    <div className="text-dark-400">{clubProfile.city} {clubProfile.postalCode}</div>
                                    <div className="text-dark-400 mt-2">{clubProfile.email} • {clubProfile.phone}</div>
                                </div>
                            )}

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-dark-400" />
                                    <div>
                                        <div className="font-medium text-white">{selectedInvoice.member.name}</div>
                                        <div className="text-sm text-dark-400">{selectedInvoice.member.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-dark-400" />
                                    <div className="text-sm text-dark-400">
                                        Due: {new Date(selectedInvoice.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-dark-800/50 rounded-lg p-4 mb-6">
                                <div className="text-sm text-dark-400 mb-3">{selectedInvoice.description}</div>
                                <div className="space-y-2">
                                    {selectedInvoice.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-dark-300">{item.description} x{item.quantity}</span>
                                            <span className="text-white">{formatCurrency(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-dark-700 mt-3 pt-3 flex justify-between font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-primary-400">{formatCurrency(selectedInvoice.totalAmount)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Close
                                </button>
                                <PDFDownloadLink
                                    document={<InvoicePDF invoice={selectedInvoice} />}
                                    fileName={`Invoice-${selectedInvoice.invoiceNumber || 'DRAFT'}.pdf`}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {({ loading }) => (
                                        <>
                                            <Download size={18} />
                                            {loading ? 'Generating...' : 'Download PDF'}
                                        </>
                                    )}
                                </PDFDownloadLink>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
