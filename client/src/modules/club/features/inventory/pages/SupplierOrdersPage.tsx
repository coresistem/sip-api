import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin, XCircle,
    ChevronDown, Eye, Shirt, Search, Filter, CreditCard, CheckCircle2,
    X, ExternalLink, AlertCircle, UserPlus, Briefcase, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    JerseyOrder, listOrders, getOrder, updateOrderStatus, verifyPayment,
    formatCurrency, ORDER_STATUSES, PAYMENT_STATUSES
} from '../../../../admin/services/jerseyApi';

const SupplierOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<JerseyOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<JerseyOrder | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Task Assignment State
    const [manpowerList, setManpowerList] = useState<{ id: string; name: string; specialization?: string }[]>([]);
    const [orderTasks, setOrderTasks] = useState<any[]>([]);
    const [showAssignTask, setShowAssignTask] = useState(false);
    const [selectedManpower, setSelectedManpower] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [taskQuantity, setTaskQuantity] = useState(1);
    const [isAssigning, setIsAssigning] = useState(false);

    const STAGES = [
        { id: 'GRADING', label: 'Grading', icon: '📐' },
        { id: 'PRINTING', label: 'Printing', icon: '🖨️' },
        { id: 'CUTTING', label: 'Cutting', icon: '✂️' },
        { id: 'PRESS', label: 'Press', icon: '🔥' },
        { id: 'SEWING', label: 'Sewing', icon: '🧵' },
        { id: 'QC', label: 'QC', icon: '✅' },
        { id: 'PACKING', label: 'Packing', icon: '📦' },
    ];

    useEffect(() => {
        loadOrders();
    }, [filterStatus]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const data = await listOrders({
                status: filterStatus || undefined,
                limit: 100
            });
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openOrderDetail = async (order: JerseyOrder) => {
        try {
            const fullOrder = await getOrder(order.id);
            setSelectedOrder(fullOrder);
            setShowDetailModal(true);
            loadManpowerAndTasks(order.id);
        } catch (error) {
            console.error('Failed to load order:', error);
        }
    };

    const handleUpdateStatus = async (newStatus: string, description?: string) => {
        if (!selectedOrder) return;

        try {
            setIsUpdating(true);
            const updated = await updateOrderStatus(selectedOrder.id, {
                status: newStatus,
                description: description || `Status diubah ke ${getStatusInfo(newStatus).label}`
            });
            setSelectedOrder(updated);
            loadOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Gagal mengubah status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVerifyPayment = async (action: 'APPROVE' | 'REJECT') => {
        if (!selectedOrder) return;

        try {
            setIsUpdating(true);
            const updated = await verifyPayment(
                selectedOrder.id,
                action,
                action === 'REJECT' ? rejectionReason : undefined
            );
            setSelectedOrder(updated);
            setShowRejectModal(false);
            setRejectionReason('');
            loadOrders();
            alert(action === 'APPROVE' ? 'Pembayaran berhasil diverifikasi!' : 'Pembayaran ditolak');
        } catch (error) {
            console.error('Failed to verify payment:', error);
            alert('Gagal memverifikasi pembayaran');
        } finally {
            setIsUpdating(false);
        }
    };

    const getPaymentStatusInfo = (status: string) => {
        return PAYMENT_STATUSES.find(s => s.value === status) || { value: status, label: status, color: 'gray' };
    };

    // Task Assignment Functions
    const loadManpowerAndTasks = async (orderId: string) => {
        try {
            // Load workers
            const workersRes = await fetch('/api/v1/manpower', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (workersRes.ok) {
                const workersData = await workersRes.json();
                setManpowerList(workersData?.data || []);
            } else {
                setManpowerList([]);
            }

            // Load tasks for this order
            const tasksRes = await fetch(`/api/v1/manpower/tasks?orderId=${orderId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                setOrderTasks(tasksData?.data || []);
            } else {
                setOrderTasks([]);
            }
        } catch (error) {
            console.error('Failed to load workers/tasks:', error);
            setManpowerList([]);
            setOrderTasks([]);
        }
    };

    const handleAssignTask = async () => {
        if (!selectedOrder || !selectedManpower || !selectedStage) return;

        try {
            setIsAssigning(true);
            const response = await fetch('/api/v1/manpower/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    manpowerId: selectedManpower,
                    orderId: selectedOrder.id,
                    stage: selectedStage,
                    quantity: taskQuantity
                })
            });

            if (response.ok) {
                await loadManpowerAndTasks(selectedOrder.id);
                setShowAssignTask(false);
                setSelectedManpower('');
                setSelectedStage('');
                setTaskQuantity(1);
            }
        } catch (error) {
            console.error('Failed to assign task:', error);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!selectedOrder) return;
        try {
            await fetch(`/api/v1/manpower/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            await loadManpowerAndTasks(selectedOrder.id);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const getStatusInfo = (status: string) => {
        return ORDER_STATUSES.find(s => s.value === status) || { value: status, label: status, color: 'gray' };
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-5 h-5" />;
            case 'CONFIRMED': return <CheckCircle className="w-5 h-5" />;
            case 'PRODUCTION': return <Package className="w-5 h-5" />;
            case 'SHIPPED': return <Truck className="w-5 h-5" />;
            case 'DELIVERED': return <MapPin className="w-5 h-5" />;
            case 'CANCELLED': return <XCircle className="w-5 h-5" />;
            default: return <Package className="w-5 h-5" />;
        }
    };

    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            red: 'bg-red-500/20 text-red-400 border-red-500/30',
            gray: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        };
        return colors[color] || colors.gray;
    };

    const getNextStatus = (currentStatus: string): string | null => {
        const flow: Record<string, string> = {
            'PENDING': 'CONFIRMED',
            'CONFIRMED': 'PRODUCTION',
            'PRODUCTION': 'SHIPPED',
            'SHIPPED': 'DELIVERED'
        };
        return flow[currentStatus] || null;
    };

    // Stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        production: orders.filter(o => o.status === 'PRODUCTION').length,
        revenue: orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0)
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/supplier/products" className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Package className="w-7 h-7 text-purple-400" />
                            Kelola Pesanan
                        </h1>
                        <p className="text-slate-400 text-sm">Lihat dan kelola pesanan masuk</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Total Pesanan</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-purple-400 text-sm">Produksi</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.production}</p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <p className="text-green-400 text-sm">Total Nilai</p>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(stats.revenue)}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <button
                    onClick={() => setFilterStatus('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === '' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    Semua
                </button>
                {ORDER_STATUSES.slice(0, 5).map(status => (
                    <button
                        key={status.value}
                        onClick={() => setFilterStatus(status.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status.value ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {status.label}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Belum Ada Pesanan</h3>
                    <p className="text-slate-500">Pesanan akan muncul di sini</p>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-700/50 text-left">
                                <th className="px-4 py-3 text-slate-400 font-medium">No. Order</th>
                                <th className="px-4 py-3 text-slate-400 font-medium">Item</th>
                                <th className="px-4 py-3 text-slate-400 font-medium">Total</th>
                                <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
                                <th className="px-4 py-3 text-slate-400 font-medium">Tanggal</th>
                                <th className="px-4 py-3 text-slate-400 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <tr
                                        key={order.id}
                                        className="border-t border-slate-700 hover:bg-slate-700/30 cursor-pointer transition-colors"
                                        onClick={() => openOrderDetail(order)}
                                    >
                                        <td className="px-4 py-3 font-medium text-white">{order.orderNo}</td>
                                        <td className="px-4 py-3 text-slate-300">{order.itemCount || order.items?.length || 0} item</td>
                                        <td className="px-4 py-3 text-purple-400 font-medium">{formatCurrency(order.totalAmount)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(statusInfo.color)}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3 text-slate-400">
                                            <Eye className="w-4 h-4" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 my-8"
                        >
                            <div className="p-6 border-b border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">{selectedOrder.orderNo}</h2>
                                        <p className="text-slate-400 text-sm">
                                            {selectedOrder.orderType === 'COLLECTIVE' ? 'Pesanan Kolektif' : 'Pesanan Individual'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(getStatusInfo(selectedOrder.status).color)}`}>
                                        {getStatusInfo(selectedOrder.status).label}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                {/* Items */}
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">Detail Item</h3>
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg mb-2">
                                            <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                                                <Shirt className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{item.product?.name || 'Jersey'}</p>
                                                <p className="text-slate-400 text-sm">
                                                    {item.quantity}x • {item.recipientName}
                                                    {item.selectedVariants && Object.entries(item.selectedVariants).map(([k, v]) =>
                                                        <span key={k} className="ml-1">• {v}</span>
                                                    )}
                                                </p>
                                                {(item.nameOnJersey || item.numberOnJersey) && (
                                                    <p className="text-purple-400 text-sm">
                                                        Sablon: {item.nameOnJersey} #{item.numberOnJersey}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-purple-400 font-medium">
                                                {formatCurrency(item.lineTotal)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping */}
                                {selectedOrder.shippingAddress && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> Alamat Pengiriman
                                        </h3>
                                        <p className="text-slate-300 bg-slate-700/30 p-3 rounded-lg">{selectedOrder.shippingAddress}</p>
                                    </div>
                                )}

                                {/* Notes */}
                                {selectedOrder.notes && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-400 mb-2">Catatan</h3>
                                        <p className="text-slate-300 bg-slate-700/30 p-3 rounded-lg">{selectedOrder.notes}</p>
                                    </div>
                                )}

                                {/* Price Summary */}
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <div className="flex justify-between text-slate-400 mb-2">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.addonsTotal > 0 && (
                                        <div className="flex justify-between text-slate-400 mb-2">
                                            <span>Tambahan Varian</span>
                                            <span>{formatCurrency(selectedOrder.addonsTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-600">
                                        <span>Total</span>
                                        <span className="text-purple-400">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>

                                {/* Payment Verification Section */}
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Status Pembayaran
                                    </h3>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(getPaymentStatusInfo(selectedOrder.paymentStatus).color)}`}>
                                            {getPaymentStatusInfo(selectedOrder.paymentStatus).label}
                                        </span>
                                    </div>

                                    {/* Show payment proof if uploaded */}
                                    {selectedOrder.paymentProofUrl && (
                                        <div className="mb-3 p-3 bg-slate-600/30 rounded-lg">
                                            <p className="text-sm text-slate-400 mb-2">Bukti Pembayaran:</p>
                                            <a
                                                href={selectedOrder.paymentProofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm break-all"
                                            >
                                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                                Lihat Bukti Pembayaran
                                            </a>
                                        </div>
                                    )}

                                    {/* Verification buttons for PENDING_VERIFICATION status */}
                                    {selectedOrder.paymentStatus === 'PENDING_VERIFICATION' && (
                                        <div className="space-y-3">
                                            {!showRejectModal ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerifyPayment('APPROVE')}
                                                        disabled={isUpdating}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {isUpdating ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                Terima
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRejectModal(true)}
                                                        disabled={isUpdating}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="Alasan penolakan..."
                                                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setShowRejectModal(false)}
                                                            className="flex-1 px-3 py-2 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerifyPayment('REJECT')}
                                                            disabled={isUpdating}
                                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                                        >
                                                            {isUpdating ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            ) : (
                                                                'Konfirmasi Tolak'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Paid notice */}
                                    {selectedOrder.paymentStatus === 'PAID' && (
                                        <p className="text-green-400 text-sm flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Pembayaran telah diverifikasi
                                        </p>
                                    )}

                                    {/* Unpaid notice */}
                                    {selectedOrder.paymentStatus === 'UNPAID' && (
                                        <p className="text-amber-400 text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Menunggu bukti pembayaran dari pelanggan
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Task Assignment Section */}
                            <div className="p-6 border-t border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-purple-400" />
                                        Production Tasks
                                    </h4>
                                    <button
                                        onClick={() => setShowAssignTask(!showAssignTask)}
                                        className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Assign Task
                                    </button>
                                </div>

                                {/* Assign Task Form */}
                                {showAssignTask && (
                                    <div className="mb-4 p-4 bg-slate-700/50 rounded-lg space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                value={selectedManpower}
                                                onChange={(e) => setSelectedManpower(e.target.value)}
                                                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="">Select Staff</option>
                                                {manpowerList.map(w => (
                                                    <option key={w.id} value={w.id}>
                                                        {w.name} {w.specialization ? `(${w.specialization})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={selectedStage}
                                                onChange={(e) => setSelectedStage(e.target.value)}
                                                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="">Select Stage</option>
                                                {STAGES.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.icon} {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={taskQuantity}
                                                onChange={(e) => setTaskQuantity(Number(e.target.value))}
                                                min={1}
                                                placeholder="Qty"
                                                className="w-20 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={handleAssignTask}
                                                disabled={isAssigning || !selectedManpower || !selectedStage}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                                            >
                                                {isAssigning ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4" />
                                                        Assign
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Task List */}
                                {orderTasks.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">
                                        No tasks assigned yet
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {orderTasks.map(task => {
                                            const stageInfo = STAGES.find(s => s.id === task.stage) || { icon: '📋', label: task.stage };
                                            return (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{stageInfo.icon}</span>
                                                        <div>
                                                            <p className="text-white text-sm font-medium">
                                                                {stageInfo.label}
                                                            </p>
                                                            <p className="text-slate-400 text-xs">
                                                                {task.manpower?.name} • {task.quantity} items
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                            task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                                                                task.status === 'ON_HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-slate-500/20 text-slate-400'
                                                            }`}>
                                                            {task.status}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Courier Section */}
                            {(selectedOrder.status === 'PRODUCTION' || selectedOrder.status === 'SHIPPED') && (
                                <div className="p-6 border-t border-slate-700">
                                    <h4 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
                                        <Truck className="w-5 h-5 text-cyan-400" />
                                        Shipping Info
                                    </h4>
                                    {selectedOrder.status === 'PRODUCTION' && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Courier (JNE, SiCepat, etc)"
                                                    id="courierName"
                                                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="AWB Number"
                                                    id="awbNumber"
                                                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Tracking URL (optional)"
                                                id="trackingUrl"
                                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={async () => {
                                                    const courierName = (document.getElementById('courierName') as HTMLInputElement)?.value;
                                                    const awbNumber = (document.getElementById('awbNumber') as HTMLInputElement)?.value;
                                                    const trackingUrl = (document.getElementById('trackingUrl') as HTMLInputElement)?.value;

                                                    if (!courierName || !awbNumber) {
                                                        alert('Courier name and AWB are required');
                                                        return;
                                                    }

                                                    try {
                                                        const res = await fetch(`/api/v1/jersey/orders/${selectedOrder.id}/courier`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                            },
                                                            body: JSON.stringify({ courierName, awbNumber, trackingUrl })
                                                        });
                                                        if (res.ok) {
                                                            loadOrders();
                                                            alert('Shipping info saved! Order marked as SHIPPED.');
                                                        }
                                                    } catch (error) {
                                                        console.error('Failed to save courier:', error);
                                                    }
                                                }}
                                                disabled={isUpdating}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50"
                                            >
                                                <Truck className="w-4 h-4" />
                                                Ship Order
                                            </button>
                                        </div>
                                    )}
                                    {selectedOrder.status === 'SHIPPED' && (
                                        <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-cyan-400 text-sm flex items-center gap-2 font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Order has been shipped
                                                </p>
                                                {selectedOrder.courierInfo?.shippedAt && (
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(selectedOrder.courierInfo.shippedAt).toLocaleString('id-ID')}
                                                    </span>
                                                )}
                                            </div>

                                            {selectedOrder.courierInfo && (
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Courier</span>
                                                        <span className="text-white font-medium">{selectedOrder.courierInfo.courierName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">AWB Number</span>
                                                        <span className="text-white font-medium select-all">{selectedOrder.courierInfo.awbNumber}</span>
                                                    </div>
                                                    {selectedOrder.courierInfo.trackingUrl && (
                                                        <div className="pt-2 mt-2 border-t border-cyan-500/20">
                                                            <a
                                                                href={selectedOrder.courierInfo.trackingUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                Verify Tracking Link
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 p-6 border-t border-slate-700">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Tutup
                                </button>
                                {getNextStatus(selectedOrder.status) && (
                                    <button
                                        onClick={() => handleUpdateStatus(getNextStatus(selectedOrder.status)!)}
                                        disabled={isUpdating}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                {getStatusIcon(getNextStatus(selectedOrder.status)!)}
                                                {getStatusInfo(getNextStatus(selectedOrder.status)!).label}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplierOrdersPage;
