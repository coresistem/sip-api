import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Package, ShoppingBag } from 'lucide-react';
import { getCustomerDetails, CustomerDetailData, formatCurrency, ORDER_STATUSES } from '../../../../services/jerseyApi';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<CustomerDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchDetails = async () => {
                try {
                    const details = await getCustomerDetails(id);
                    setData(details);
                } catch (error) {
                    console.error('Failed to fetch customer details:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [id]);

    if (loading) return <div className="p-6 text-slate-400">Loading customer details...</div>;
    if (!data) return <div className="p-6 text-red-400">Customer not found.</div>;

    const { profile, orders } = data;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <button
                onClick={() => navigate('/jersey/admin/customers')}
                className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-slate-400" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                        <div className="text-slate-400 text-sm mb-6">Customer</div>

                        <div className="border-t border-slate-700 pt-6 text-left space-y-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <Mail className="w-4 h-4 text-slate-500" />
                                <span className="text-sm">{profile.email}</span>
                            </div>
                            {profile.phone && (
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm">{profile.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-slate-300">
                                <ShoppingBag className="w-4 h-4 text-slate-500" />
                                <span className="text-sm">{orders.length} Total Orders</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="text-cyan-500 font-bold text-sm">
                                    {formatCurrency(totalSpent)}
                                </div>
                                <span className="text-sm text-slate-500">Lifetime Spent</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order History */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-cyan-500" />
                        Order History
                    </h3>

                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-500 border border-slate-700">
                                No orders found for this customer.
                            </div>
                        ) : (
                            orders.map((order) => {
                                const statusInfo = ORDER_STATUSES.find(s => s.value === order.status) || {
                                    label: order.status,
                                    color: 'slate'
                                };
                                const statusColorClass = {
                                    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                                    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                                    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                                    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                                    green: 'bg-green-500/10 text-green-400 border-green-500/20',
                                    red: 'bg-red-500/10 text-red-400 border-red-500/20',
                                    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                }[statusInfo.color] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                                return (
                                    <div
                                        key={order.id}
                                        onClick={() => navigate(`/jersey/admin/orders/${order.id}`)}
                                        className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-mono text-cyan-400 font-medium">#{order.orderNo}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColorClass}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white">{formatCurrency(order.totalAmount)}</div>
                                                <div className="text-xs text-slate-500">{order.items?.length || 0} items</div>
                                            </div>
                                        </div>

                                        {/* Preview Items */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600">
                                            {order.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex-shrink-0 w-12 h-12 rounded bg-slate-700 overflow-hidden border border-slate-600 relative group/item">
                                                    {item.product?.designThumbnail ? (
                                                        <img src={item.product.designThumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs text-center p-1">
                                                            {item.product?.name?.substring(0, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
