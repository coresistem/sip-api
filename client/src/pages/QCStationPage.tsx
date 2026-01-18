import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardCheck, Package, CheckCircle, XCircle, AlertTriangle,
    Eye, Send, Camera, ArrowLeft, Tag, Clock, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../services/jerseyApi';

// Types
interface QCInspection {
    id: string;
    orderId: string;
    inspectorId: string;
    totalQty: number;
    passedQty: number;
    rejectedQty: number;
    status: string;
    result: string | null;
    notes: string | null;
    inspectedAt: string | null;
    createdAt: string;
    order: {
        id: string;
        orderNo: string;
        status: string;
    };
    rejections: QCRejection[];
}

interface QCRejection {
    id: string;
    quantity: number;
    defectType: string;
    description: string;
    imageUrl: string | null;
    responsibleDept: string;
    status: string;
    repairRequest?: RepairRequest | null;
}

interface RepairRequest {
    id: string;
    description: string;
    estimatedCost: number;
    status: string;
    supplierNotes: string | null;
    decidedAt: string | null;
}

const DEPARTMENTS = [
    { id: 'GRADING', label: 'Grading', icon: '📐' },
    { id: 'PRINTING', label: 'Printing', icon: '🖨️' },
    { id: 'CUTTING', label: 'Cutting', icon: '✂️' },
    { id: 'PRESS', label: 'Press', icon: '🔥' },
    { id: 'SEWING', label: 'Sewing', icon: '🧵' },
];

const DEFECT_TYPES = [
    { id: 'STITCHING', label: 'Jahitan Rusak' },
    { id: 'PRINT_QUALITY', label: 'Kualitas Print Buruk' },
    { id: 'CUT_ERROR', label: 'Kesalahan Potong' },
    { id: 'FABRIC_DEFECT', label: 'Kain Cacat' },
    { id: 'COLOR_MISMATCH', label: 'Warna Tidak Sesuai' },
    { id: 'SIZE_ERROR', label: 'Ukuran Salah' },
    { id: 'OTHER', label: 'Lainnya' },
];

const QCStationPage: React.FC = () => {
    const [inspections, setInspections] = useState<QCInspection[]>([]);
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInspection, setSelectedInspection] = useState<QCInspection | null>(null);
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'inspections'>('pending');

    // Reject form state
    const [rejectForm, setRejectForm] = useState({
        quantity: 1,
        defectType: '',
        description: '',
        responsibleDept: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Load orders in PRODUCTION status (ready for QC)
            const ordersRes = await fetch('/api/v1/jersey/orders?status=PRODUCTION', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setPendingOrders(data?.data || data || []);
            }

            // Load existing inspections
            const inspectionsRes = await fetch('/api/v1/jersey/qc/inspections', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (inspectionsRes.ok) {
                const data = await inspectionsRes.json();
                setInspections(data?.data || []);
            }
        } catch (error) {
            console.error('Failed to load QC data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createInspection = async (orderId: string, totalQty: number) => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/jersey/qc/inspections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, totalQty })
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedInspection(data.data);
                setShowInspectionModal(true);
                loadData();
            }
        } catch (error) {
            console.error('Failed to create inspection:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openInspection = (inspection: QCInspection) => {
        setSelectedInspection(inspection);
        setShowInspectionModal(true);
    };

    const updateInspection = async (updates: Partial<QCInspection>) => {
        if (!selectedInspection) return;

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/jersey/qc/inspections/${selectedInspection.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedInspection(data.data);
                loadData();
            }
        } catch (error) {
            console.error('Failed to update inspection:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const markItemsPass = async (qty: number) => {
        if (!selectedInspection) return;
        const newPassedQty = selectedInspection.passedQty + qty;
        const total = newPassedQty + selectedInspection.rejectedQty;
        const isComplete = total >= selectedInspection.totalQty;

        await updateInspection({
            passedQty: newPassedQty,
            status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
            result: isComplete ? (selectedInspection.rejectedQty === 0 ? 'PASSED' : 'PARTIAL') : null
        });
    };

    const createRejection = async () => {
        if (!selectedInspection || !rejectForm.defectType || !rejectForm.responsibleDept) return;

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/jersey/qc/rejections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    inspectionId: selectedInspection.id,
                    ...rejectForm
                })
            });

            if (res.ok) {
                // Update inspection rejected count
                const newRejectedQty = selectedInspection.rejectedQty + rejectForm.quantity;
                const total = selectedInspection.passedQty + newRejectedQty;
                const isComplete = total >= selectedInspection.totalQty;

                await updateInspection({
                    rejectedQty: newRejectedQty,
                    status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
                    result: isComplete ? (selectedInspection.passedQty === 0 ? 'REJECTED' : 'PARTIAL') : null
                });

                setShowRejectModal(false);
                setRejectForm({ quantity: 1, defectType: '', description: '', responsibleDept: '' });
            }
        } catch (error) {
            console.error('Failed to create rejection:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string, result?: string | null) => {
        if (status === 'COMPLETED') {
            if (result === 'PASSED') {
                return <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">✓ Passed</span>;
            } else if (result === 'REJECTED') {
                return <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">✗ Rejected</span>;
            } else {
                return <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">⚠ Partial</span>;
            }
        } else if (status === 'IN_PROGRESS') {
            return <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">🔄 In Progress</span>;
        }
        return <span className="px-2 py-1 rounded text-xs bg-slate-500/20 text-slate-400">⏳ Pending</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ClipboardCheck className="w-7 h-7 text-cyan-400" />
                            QC Station
                        </h1>
                        <p className="text-slate-400 text-sm">Quality Control Inspection</p>
                    </div>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm">Pending QC</p>
                    <p className="text-2xl font-bold text-yellow-400">{pendingOrders.length}</p>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-blue-400 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {inspections.filter(i => i.status === 'IN_PROGRESS').length}
                    </p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <p className="text-green-400 text-sm">Completed Today</p>
                    <p className="text-2xl font-bold text-green-400">
                        {inspections.filter(i => i.status === 'COMPLETED').length}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    Pending Orders
                </button>
                <button
                    onClick={() => setActiveTab('inspections')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inspections'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    My Inspections
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                </div>
            ) : activeTab === 'pending' ? (
                <div className="grid gap-4">
                    {pendingOrders.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Orders Pending QC</h3>
                            <p className="text-slate-500">Orders will appear here when ready for inspection</p>
                        </div>
                    ) : (
                        pendingOrders.map((order: any) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-semibold">{order.orderNo}</h3>
                                        <p className="text-slate-400 text-sm">
                                            {order.itemCount || order.items?.length || 0} items •
                                            {formatCurrency(order.totalAmount)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => createInspection(order.id, order.itemCount || order.items?.length || 1)}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50"
                                    >
                                        <ClipboardCheck className="w-4 h-4" />
                                        Start Inspection
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {inspections.length === 0 ? (
                        <div className="text-center py-20">
                            <ClipboardCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Inspections Yet</h3>
                            <p className="text-slate-500">Start inspecting orders from the Pending tab</p>
                        </div>
                    ) : (
                        inspections.map(inspection => (
                            <motion.div
                                key={inspection.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 cursor-pointer hover:bg-slate-800"
                                onClick={() => openInspection(inspection)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                            {inspection.order.orderNo}
                                            {getStatusBadge(inspection.status, inspection.result)}
                                        </h3>
                                        <p className="text-slate-400 text-sm">
                                            {inspection.passedQty} passed • {inspection.rejectedQty} rejected •
                                            {inspection.totalQty - inspection.passedQty - inspection.rejectedQty} remaining
                                        </p>
                                    </div>
                                    <Eye className="w-5 h-5 text-slate-500" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Inspection Modal */}
            <AnimatePresence>
                {showInspectionModal && selectedInspection && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowInspectionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-700">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                                    QC Inspection
                                </h2>
                                <p className="text-slate-400 text-sm">{selectedInspection.order.orderNo}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Progress */}
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Progress</span>
                                        <span className="text-white">
                                            {selectedInspection.passedQty + selectedInspection.rejectedQty} / {selectedInspection.totalQty}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-600 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                                            style={{
                                                width: `${((selectedInspection.passedQty + selectedInspection.rejectedQty) / selectedInspection.totalQty) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <span className="text-green-400">✓ {selectedInspection.passedQty} Passed</span>
                                        <span className="text-red-400">✗ {selectedInspection.rejectedQty} Rejected</span>
                                    </div>
                                </div>

                                {/* Rejections List */}
                                {selectedInspection.rejections.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-400 mb-2">Rejections</h4>
                                        <div className="space-y-2">
                                            {selectedInspection.rejections.map(rej => (
                                                <div key={rej.id} className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-white text-sm">{rej.defectType}</span>
                                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-600 text-slate-300">
                                                            {DEPARTMENTS.find(d => d.id === rej.responsibleDept)?.icon} {rej.responsibleDept}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-400 text-xs mt-1">{rej.description}</p>
                                                    {rej.repairRequest && (
                                                        <div className={`mt-2 text-xs px-2 py-1 rounded ${rej.repairRequest.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                                rej.repairRequest.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                                    'bg-yellow-500/20 text-yellow-400'
                                                            }`}>
                                                            Repair: {rej.repairRequest.status}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {selectedInspection.status !== 'COMPLETED' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => markItemsPass(1)}
                                            disabled={isSubmitting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Pass Item
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={isSubmitting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Item
                                        </button>
                                    </div>
                                )}

                                {selectedInspection.status === 'COMPLETED' && (
                                    <div className={`p-4 rounded-lg text-center ${selectedInspection.result === 'PASSED' ? 'bg-green-500/20 text-green-400' :
                                            selectedInspection.result === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        <p className="font-medium">
                                            Inspection Complete: {selectedInspection.result}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-700">
                                <button
                                    onClick={() => setShowInspectionModal(false)}
                                    className="w-full px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]"
                        onClick={() => setShowRejectModal(false)}
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
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    Record Rejection
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={rejectForm.quantity}
                                        onChange={e => setRejectForm({ ...rejectForm, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Defect Type</label>
                                    <select
                                        value={rejectForm.defectType}
                                        onChange={e => setRejectForm({ ...rejectForm, defectType: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                                    >
                                        <option value="">Select defect type</option>
                                        {DEFECT_TYPES.map(dt => (
                                            <option key={dt.id} value={dt.id}>{dt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Responsible Department</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {DEPARTMENTS.map(dept => (
                                            <button
                                                key={dept.id}
                                                type="button"
                                                onClick={() => setRejectForm({ ...rejectForm, responsibleDept: dept.id })}
                                                className={`p-2 rounded-lg text-center transition-colors ${rejectForm.responsibleDept === dept.id
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                    }`}
                                            >
                                                <span className="text-lg">{dept.icon}</span>
                                                <p className="text-xs mt-1">{dept.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                                    <textarea
                                        value={rejectForm.description}
                                        onChange={e => setRejectForm({ ...rejectForm, description: e.target.value })}
                                        rows={2}
                                        placeholder="Describe the defect..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-slate-700">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createRejection}
                                    disabled={isSubmitting || !rejectForm.defectType || !rejectForm.responsibleDept}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    <Tag className="w-4 h-4" />
                                    Submit Rejection
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QCStationPage;
