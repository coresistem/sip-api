import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench, Package, CheckCircle, XCircle, AlertTriangle,
    DollarSign, ArrowLeft, Clock, RefreshCw, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../services/jerseyApi';

interface RepairRequest {
    id: string;
    description: string;
    estimatedCost: number;
    actualCost: number | null;
    status: string;
    supplierNotes: string | null;
    decidedAt: string | null;
    repairedAt: string | null;
    createdAt: string;
    rejection: {
        id: string;
        defectType: string;
        description: string;
        responsibleDept: string;
        imageUrl: string | null;
        inspection: {
            orderId: string;
            order: {
                id: string;
                orderNo: string;
            };
        };
    };
}

const DEPARTMENTS: Record<string, { label: string; icon: string }> = {
    GRADING: { label: 'Grading', icon: '📐' },
    PRINTING: { label: 'Printing', icon: '🖨️' },
    CUTTING: { label: 'Cutting', icon: '✂️' },
    PRESS: { label: 'Press', icon: '🔥' },
    SEWING: { label: 'Sewing', icon: '🧵' },
};

const RepairApprovalPage: React.FC = () => {
    const [requests, setRequests] = useState<RepairRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [supplierNotes, setSupplierNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('PENDING');

    useEffect(() => {
        loadRequests();
    }, [filterStatus]);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const url = filterStatus
                ? `/api/v1/jersey/repair-requests?status=${filterStatus}`
                : '/api/v1/jersey/repair-requests';

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setRequests(data?.data || []);
            }
        } catch (error) {
            console.error('Failed to load repair requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openDecision = (request: RepairRequest) => {
        setSelectedRequest(request);
        setSupplierNotes('');
        setShowDecisionModal(true);
    };

    const handleDecision = async (action: 'APPROVE' | 'REJECT') => {
        if (!selectedRequest) return;

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/jersey/repair-requests/${selectedRequest.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action, supplierNotes })
            });

            if (res.ok) {
                setShowDecisionModal(false);
                setSelectedRequest(null);
                loadRequests();
            }
        } catch (error) {
            console.error('Failed to update repair request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
            case 'APPROVED':
                return <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case 'REJECTED':
                return <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
            default:
                return <span className="px-2 py-1 rounded text-xs bg-slate-500/20 text-slate-400">{status}</span>;
        }
    };

    const stats = {
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
        totalCost: requests
            .filter(r => r.status === 'APPROVED')
            .reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0)
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/supplier/orders" className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Wrench className="w-7 h-7 text-orange-400" />
                            Repair Approvals
                        </h1>
                        <p className="text-slate-400 text-sm">Review and approve repair requests from QC</p>
                    </div>
                </div>
                <button
                    onClick={loadRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <p className="text-green-400 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                    <p className="text-red-400 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                </div>
                <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-orange-400 text-sm">Total Cost</p>
                    <p className="text-lg font-bold text-orange-400">{formatCurrency(stats.totalCost)}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['PENDING', 'APPROVED', 'REJECTED', ''].map(status => (
                    <button
                        key={status || 'all'}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {status || 'All'}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20">
                    <Wrench className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No Repair Requests</h3>
                    <p className="text-slate-500">Repair requests from QC will appear here</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map(request => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-lg">{DEPARTMENTS[request.rejection.responsibleDept]?.icon || '🔧'}</span>
                                        <h3 className="text-white font-semibold">{request.rejection.inspection.order.orderNo}</h3>
                                        {getStatusBadge(request.status)}
                                    </div>
                                    <p className="text-slate-400 text-sm mb-1">
                                        <strong>Defect:</strong> {request.rejection.defectType} - {request.rejection.description}
                                    </p>
                                    <p className="text-slate-400 text-sm mb-2">
                                        <strong>Department:</strong> {DEPARTMENTS[request.rejection.responsibleDept]?.label}
                                    </p>
                                    <p className="text-slate-300 text-sm">
                                        <strong>Repair:</strong> {request.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-orange-400 font-semibold">
                                            <DollarSign className="w-4 h-4 inline" />
                                            {formatCurrency(request.estimatedCost)}
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {new Date(request.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                                {request.status === 'PENDING' && (
                                    <button
                                        onClick={() => openDecision(request)}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Review
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Decision Modal */}
            <AnimatePresence>
                {showDecisionModal && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowDecisionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-700">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                    Repair Decision
                                </h2>
                                <p className="text-slate-400 text-sm">{selectedRequest.rejection.inspection.order.orderNo}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Defect Info */}
                                <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                                    <p className="text-red-400 text-sm font-medium">{selectedRequest.rejection.defectType}</p>
                                    <p className="text-slate-300 text-sm">{selectedRequest.rejection.description}</p>
                                </div>

                                {/* Repair Request */}
                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <p className="text-slate-400 text-sm mb-1">Repair Description</p>
                                    <p className="text-white">{selectedRequest.description}</p>
                                </div>

                                {/* Cost */}
                                <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20 text-center">
                                    <p className="text-orange-400 text-sm">Estimated Repair Cost</p>
                                    <p className="text-2xl font-bold text-orange-400">
                                        {formatCurrency(selectedRequest.estimatedCost)}
                                    </p>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Your Notes (Optional)</label>
                                    <textarea
                                        value={supplierNotes}
                                        onChange={e => setSupplierNotes(e.target.value)}
                                        rows={2}
                                        placeholder="Add notes for the repair team..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-slate-700">
                                <button
                                    onClick={() => handleDecision('REJECT')}
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleDecision('APPROVE')}
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RepairApprovalPage;
