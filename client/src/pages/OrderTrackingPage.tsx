import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin, XCircle,
    ChevronRight, Eye, Shirt, Upload, CreditCard, AlertCircle, ExternalLink, Copy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    JerseyOrder, listOrders, getOrder, cancelOrder, uploadPaymentProof,
    formatCurrency, ORDER_STATUSES, PAYMENT_STATUSES
} from '../services/jerseyApi';


interface OrderTrackingPageProps {
    mockOrders?: JerseyOrder[];
}

const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ mockOrders }) => {
    const [orders, setOrders] = useState<JerseyOrder[]>(mockOrders || []);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<JerseyOrder | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [paymentProofInput, setPaymentProofInput] = useState('');
    const [isUploadingProof, setIsUploadingProof] = useState(false);

    useEffect(() => {
        if (!mockOrders) {
            loadOrders();
        }
    }, [mockOrders]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const data = await listOrders({ limit: 50 });
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
        } catch (error) {
            console.error('Failed to load order:', error);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;

        try {
            await cancelOrder(orderId, 'Dibatalkan oleh pelanggan');
            loadOrders();
            setShowDetailModal(false);
        } catch (error) {
            console.error('Failed to cancel order:', error);
            alert('Gagal membatalkan pesanan');
        }
    };

    const handleUploadPaymentProof = async () => {
        if (!selectedOrder || !paymentProofInput.trim()) return;

        try {
            setIsUploadingProof(true);
            const updated = await uploadPaymentProof(selectedOrder.id, paymentProofInput.trim());
            setSelectedOrder(updated);
            setPaymentProofInput('');
            loadOrders();
            alert('Bukti pembayaran berhasil diunggah!');
        } catch (error) {
            console.error('Failed to upload payment proof:', error);
            alert('Gagal mengunggah bukti pembayaran');
        } finally {
            setIsUploadingProof(false);
        }
    };

    const getPaymentStatusInfo = (status: string) => {
        return PAYMENT_STATUSES.find(s => s.value === status) || { value: status, label: status, color: 'gray' };
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/jersey-catalog" className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="w-7 h-7 text-purple-400" />
                        Pesanan Saya
                    </h1>
                    <p className="text-slate-400 text-sm">Lacak status pesanan jersey Anda</p>
                </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Belum Ada Pesanan</h3>
                    <p className="text-slate-500 mb-6">Ayo pesan jersey pertamamu!</p>
                    <Link
                        to="/jersey-catalog"
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
                    >
                        <Shirt className="w-5 h-5" />
                        Lihat Katalog
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-purple-500/50 transition-all cursor-pointer"
                                onClick={() => openOrderDetail(order)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${getStatusColor(statusInfo.color)}`}>
                                            {getStatusIcon(order.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white">{order.orderNo}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(statusInfo.color)}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm">
                                                {order.itemCount || order.items?.length || 0} item • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-purple-400">{formatCurrency(order.totalAmount)}</p>
                                            <p className={`text-xs ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-amber-400'}`}>
                                                {order.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
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
                            className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 my-8"
                        >
                            <div className="p-6 border-b border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Detail Pesanan</h2>
                                        <p className="text-slate-400">{selectedOrder.orderNo}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(getStatusInfo(selectedOrder.status).color)}`}>
                                        {getStatusInfo(selectedOrder.status).label}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Items */}
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">Item Pesanan</h3>
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg mb-2">
                                            <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center">
                                                <Shirt className="w-6 h-6 text-slate-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{item.product?.name || 'Jersey'}</p>
                                                <p className="text-slate-400 text-sm">
                                                    {item.quantity}x • {item.recipientName}
                                                    {item.nameOnJersey && ` • "${item.nameOnJersey}"`}
                                                    {item.numberOnJersey && ` #${item.numberOnJersey}`}
                                                </p>
                                            </div>
                                            <div className="text-purple-400 font-medium">
                                                {formatCurrency(item.lineTotal)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Summary */}
                                <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.addonsTotal > 0 && (
                                        <div className="flex justify-between text-slate-400">
                                            <span>Tambahan</span>
                                            <span>{formatCurrency(selectedOrder.addonsTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-600">
                                        <span>Total</span>
                                        <span className="text-purple-400">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>

                                {/* Payment Status Section */}
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

                                    {/* Show existing payment proof */}
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
                                                {selectedOrder.paymentProofUrl.length > 50
                                                    ? selectedOrder.paymentProofUrl.substring(0, 50) + '...'
                                                    : selectedOrder.paymentProofUrl}
                                            </a>
                                        </div>
                                    )}

                                    {/* Rejection notice */}
                                    {selectedOrder.paymentStatus === 'REJECTED' && (
                                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                            <p className="text-red-400 text-sm flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Bukti pembayaran ditolak. Silakan unggah ulang.
                                            </p>
                                        </div>
                                    )}

                                    {/* Upload form for unpaid or rejected */}
                                    {(selectedOrder.paymentStatus === 'UNPAID' || selectedOrder.paymentStatus === 'REJECTED') && (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={paymentProofInput}
                                                onChange={(e) => setPaymentProofInput(e.target.value)}
                                                placeholder="Link bukti pembayaran (URL gambar)"
                                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={handleUploadPaymentProof}
                                                disabled={isUploadingProof || !paymentProofInput.trim()}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isUploadingProof ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" />
                                                        Unggah Bukti Bayar
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Pending verification notice */}
                                    {selectedOrder.paymentStatus === 'PENDING_VERIFICATION' && (
                                        <p className="text-yellow-400 text-sm flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Menunggu verifikasi dari supplier
                                        </p>
                                    )}

                                    {/* Paid notice */}
                                    {selectedOrder.paymentStatus === 'PAID' && (
                                        <p className="text-green-400 text-sm flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Pembayaran telah diverifikasi
                                        </p>
                                    )}
                                </div>

                                {/* Shipping Info */}
                                {selectedOrder.courierInfo && (
                                    <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                                        <h3 className="text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            Informasi Pengiriman
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center pb-2 border-b border-cyan-500/20">
                                                <span className="text-slate-400">Kurir</span>
                                                <span className="text-white font-medium">{selectedOrder.courierInfo.courierName}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-cyan-500/20">
                                                <span className="text-slate-400">No. Resi (AWB)</span>
                                                <span className="text-white font-medium flex items-center gap-2">
                                                    {selectedOrder.courierInfo.awbNumber}
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(selectedOrder.courierInfo?.awbNumber || '')}
                                                        className="p-1 hover:bg-cyan-500/20 rounded transition-colors text-cyan-400"
                                                        title="Salin Resi"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            </div>
                                            {selectedOrder.courierInfo.estimatedDelivery && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Estimasi Tiba</span>
                                                    <span className="text-white font-medium">
                                                        {new Date(selectedOrder.courierInfo.estimatedDelivery).toLocaleDateString('id-ID', {
                                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedOrder.courierInfo.trackingUrl && (
                                                <div className="pt-2">
                                                    <a
                                                        href={selectedOrder.courierInfo.trackingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Lacak Pesanan
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tracking Timeline */}
                                {selectedOrder.tracking.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-400 mb-3">Riwayat Status</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.tracking.map((track, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${idx === 0 ? 'bg-purple-500' : 'bg-slate-600'}`} />
                                                    <div>
                                                        <p className={`font-medium ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>
                                                            {getStatusInfo(track.status).label}
                                                        </p>
                                                        <p className="text-slate-500 text-sm">
                                                            {track.description} • {new Date(track.createdAt).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Shipping Address */}
                                {selectedOrder.shippingAddress && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> Alamat Pengiriman
                                        </h3>
                                        <p className="text-slate-300">{selectedOrder.shippingAddress}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 p-6 border-t border-slate-700">
                                {selectedOrder.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        Batalkan Pesanan
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderTrackingPage;
