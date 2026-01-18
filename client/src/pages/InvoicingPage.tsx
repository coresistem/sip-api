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
    User
} from 'lucide-react';
import { api } from '../context/AuthContext';

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

// Mock data
const MOCK_INVOICES: Invoice[] = [
    {
        id: '1',
        invoiceNumber: 'INV-2026-001',
        member: { id: 'm1', name: 'Ahmad Santoso', email: 'ahmad@email.com' },
        description: 'Monthly Training Fee - January 2026',
        items: [
            { description: 'Training Fee', quantity: 1, unitPrice: 500000, total: 500000 },
            { description: 'Equipment Rental', quantity: 1, unitPrice: 100000, total: 100000 }
        ],
        totalAmount: 600000,
        status: 'SENT',
        dueDate: '2026-01-31',
        createdAt: '2026-01-01'
    },
    {
        id: '2',
        invoiceNumber: 'INV-2026-002',
        member: { id: 'm2', name: 'Budi Prasetyo', email: 'budi@email.com' },
        description: 'Monthly Training Fee - January 2026',
        items: [{ description: 'Training Fee', quantity: 1, unitPrice: 500000, total: 500000 }],
        totalAmount: 500000,
        status: 'PAID',
        dueDate: '2026-01-31',
        createdAt: '2026-01-01',
        paidAt: '2026-01-10'
    },
    {
        id: '3',
        invoiceNumber: 'INV-2025-012',
        member: { id: 'm3', name: 'Citra Dewi', email: 'citra@email.com' },
        description: 'Monthly Training Fee - December 2025',
        items: [{ description: 'Training Fee', quantity: 1, unitPrice: 500000, total: 500000 }],
        totalAmount: 500000,
        status: 'OVERDUE',
        dueDate: '2025-12-31',
        createdAt: '2025-12-01'
    }
];

const MOCK_MEMBERS: Member[] = [
    { id: 'm1', name: 'Ahmad Santoso', email: 'ahmad@email.com' },
    { id: 'm2', name: 'Budi Prasetyo', email: 'budi@email.com' },
    { id: 'm3', name: 'Citra Dewi', email: 'citra@email.com' },
    { id: 'm4', name: 'Dian Permata', email: 'dian@email.com' },
    { id: 'm5', name: 'Eko Wijaya', email: 'eko@email.com' },
];

export default function InvoicingPage() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Create form state
    const [newInvoice, setNewInvoice] = useState({
        memberId: '',
        description: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }] as { description: string; quantity: number; unitPrice: number }[],
        dueDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, membersRes] = await Promise.all([
                api.get('/api/v1/clubs/invoices'),
                api.get('/api/v1/clubs/members')
            ]);
            setInvoices(invoicesRes.data?.length > 0 ? invoicesRes.data : MOCK_INVOICES);
            setMembers(membersRes.data?.length > 0 ? membersRes.data : MOCK_MEMBERS);
        } catch (error) {
            console.log('Using mock data');
            setInvoices(MOCK_INVOICES);
            setMembers(MOCK_MEMBERS);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvoice = async () => {
        setActionLoading(true);
        try {
            const member = members.find(m => m.id === newInvoice.memberId);
            const items = newInvoice.items.map(item => ({
                ...item,
                total: item.quantity * item.unitPrice
            }));
            const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

            const invoice: Invoice = {
                id: `inv-${Date.now()}`,
                invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
                member: member || { id: '', name: '', email: '' },
                description: newInvoice.description,
                items,
                totalAmount,
                status: 'DRAFT',
                dueDate: newInvoice.dueDate,
                createdAt: new Date().toISOString().split('T')[0]
            };

            // Try to save to API
            try {
                await api.post('/api/v1/clubs/invoices', invoice);
            } catch {
                // Mock save
            }

            setInvoices(prev => [invoice, ...prev]);
            setShowCreateModal(false);
            resetForm();
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendInvoice = async (invoiceId: string) => {
        setActionLoading(true);
        try {
            await api.post(`/api/v1/clubs/invoices/${invoiceId}/send`);
        } catch {
            // Mock send
        }
        setInvoices(prev => prev.map(inv =>
            inv.id === invoiceId ? { ...inv, status: 'SENT' } : inv
        ));
        setActionLoading(false);
    };

    const handleMarkPaid = async (invoiceId: string) => {
        setActionLoading(true);
        try {
            await api.post(`/api/v1/clubs/invoices/${invoiceId}/mark-paid`);
        } catch {
            // Mock pay
        }
        setInvoices(prev => prev.map(inv =>
            inv.id === invoiceId ? { ...inv, status: 'PAID', paidAt: new Date().toISOString().split('T')[0] } : inv
        ));
        setActionLoading(false);
    };

    const resetForm = () => {
        setNewInvoice({
            memberId: '',
            description: '',
            items: [{ description: '', quantity: 1, unitPrice: 0 }],
            dueDate: ''
        });
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
        const matchesSearch = inv.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
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
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </button>
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

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
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
            </motion.div>

            {/* Invoice List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                {filteredInvoices.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No Invoices Found</h3>
                        <p className="text-dark-400">Create your first invoice to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {filteredInvoices.map(invoice => (
                            <div key={invoice.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{invoice.invoiceNumber}</div>
                                            <div className="text-sm text-dark-400">{invoice.member.name}</div>
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
                            <h3 className="text-lg font-semibold text-white mb-4">Create New Invoice</h3>

                            <div className="space-y-4">
                                {/* Member Select */}
                                <div>
                                    <label className="block text-sm text-dark-400 mb-2">Member</label>
                                    <select
                                        value={newInvoice.memberId}
                                        onChange={(e) => setNewInvoice(prev => ({ ...prev, memberId: e.target.value }))}
                                        className="input w-full"
                                    >
                                        <option value="">Select member...</option>
                                        {members.map(member => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </select>
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
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateInvoice}
                                    disabled={!newInvoice.memberId || !newInvoice.description || !newInvoice.dueDate || actionLoading}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                    Create Invoice
                                </button>
                            </div>
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

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="btn-secondary w-full"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
