import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { api } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';

interface ShippingOrder {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    courierInfo?: {
        courierName: string;
        awbNumber: string;
        status: string;
    };
    items: any[];
}

export default function ShippingPage() {
    const [orders, setOrders] = useState<ShippingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<string>('');
    const [shippingForm, setShippingForm] = useState({
        courierName: 'JNE',
        awbNumber: '',
        shippingCost: 0
    });

    useEffect(() => {
        fetchShipping();
    }, []);

    const fetchShipping = async () => {
        try {
            const res = await api.get('/shipping');
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (error) {
            console.error('Fetch shipping error:', error);
            toast.error('Failed to load shipping data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateShipping = async () => {
        try {
            const res = await api.post(`/shipping/${selectedOrder}`, shippingForm);
            if (res.data.success) {
                toast.success('Shipping updated');
                setShowModal(false);
                fetchShipping();
            }
        } catch (error) {
            console.error('Update shipping error:', error);
            toast.error('Failed to update shipping');
        }
    };

    const stats = {
        pending: orders.filter(o => o.status === 'PRODUCTION' || o.status === 'CONFIRMED').length,
        inTransit: orders.filter(o => o.status === 'SHIPPED').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
        total: orders.length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Truck className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Shipping</h1>
                        <p className="text-sm text-dark-400">Manage courier information and shipment tracking</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <p className="text-sm text-dark-400">Pending Shipment</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-dark-400">In Transit</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inTransit}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-dark-400">Delivered</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.delivered}</p>
                </div>
                <div className="card">
                    <p className="text-sm text-dark-400">Total Orders</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Order ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Courier</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">AWB Number</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b border-dark-800 animate-pulse">
                                        <td className="py-4 px-4"><div className="h-4 bg-dark-700 rounded w-16"></div></td>
                                        <td className="py-4 px-4"><div className="h-4 bg-dark-700 rounded w-24"></div></td>
                                        <td className="py-4 px-4"><div className="h-4 bg-dark-700 rounded w-20"></div></td>
                                        <td className="py-4 px-4"><div className="h-4 bg-dark-700 rounded w-32"></div></td>
                                        <td className="py-4 px-4"><div className="h-4 bg-dark-700 rounded w-20"></div></td>
                                        <td className="py-4 px-4"><div className="h-8 bg-dark-700 rounded w-24"></div></td>
                                    </tr>
                                ))
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                        <td className="py-3 px-4 font-mono text-sm">{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="py-3 px-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-sm">{order.courierInfo?.courierName || '-'}</td>
                                        <td className="py-3 px-4 text-sm font-mono text-cyan-400">
                                            {order.courierInfo?.awbNumber || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`badge ${order.status === 'SHIPPED' ? 'badge-info' : 'badge-warning'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {order.status !== 'DELIVERED' && (
                                                <button
                                                    onClick={() => { setSelectedOrder(order.id); setShowModal(true); }}
                                                    className="btn btn-sm btn-ghost text-primary-400"
                                                >
                                                    Update Shipping
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-dark-400">
                                        <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No active orders found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="card w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4">Update Shipping Info</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Courier</label>
                                    <select
                                        className="input w-full"
                                        value={shippingForm.courierName}
                                        onChange={e => setShippingForm({ ...shippingForm, courierName: e.target.value })}
                                    >
                                        <option value="JNE">JNE</option>
                                        <option value="J&T">J&T</option>
                                        <option value="SiCepat">SiCepat</option>
                                        <option value="Pos Indonesia">Pos Indonesia</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">AWB Number</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={shippingForm.awbNumber}
                                        onChange={e => setShippingForm({ ...shippingForm, awbNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Shipping Cost</label>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        value={shippingForm.shippingCost}
                                        onChange={e => setShippingForm({ ...shippingForm, shippingCost: parseInt(e.target.value) })}
                                    />
                                </div>
                                <button className="btn btn-primary w-full mt-4" onClick={handleUpdateShipping}>
                                    Save & Mark Shipped
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
