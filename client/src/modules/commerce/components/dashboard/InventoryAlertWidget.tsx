import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import { InventoryAlert } from '../../types/analytics.types';

const InventoryAlertWidget = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await analyticsApi.getInventoryAlerts() as any;
                if (response.success) {
                    setAlerts(response.data);
                } else if (Array.isArray(response)) {
                    setAlerts(response);
                }
            } catch (error) {
                console.error('Failed to fetch inventory alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    if (loading) {
        return <div className="h-48 flex items-center justify-center text-slate-400">Loading alerts...</div>;
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 h-full">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Inventory Alerts
            </h3>
            <p className="text-sm text-slate-400 mb-4">Items running low on stock</p>

            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center text-slate-500 py-6">
                        No inventory alerts. Stock levels are good!
                    </div>
                ) : (
                    alerts.slice(0, 5).map((alert) => (
                        <div
                            key={alert.id}
                            onClick={() => navigate(`/commerce/admin/products/${alert.id}`)}
                            className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-700 overflow-hidden">
                                    {alert.designThumbnail ? (
                                        <img src={alert.designThumbnail} alt={alert.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-slate-500">
                                            <Package className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-white text-sm line-clamp-1">{alert.name}</div>
                                    <div className="text-xs text-slate-400">SKU: {alert.sku}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-orange-400 text-sm">
                                    {alert.stock} left
                                </div>
                                <div className="text-xs text-slate-500">
                                    &lt; {alert.lowStockThreshold}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {alerts.length > 5 && (
                <button
                    onClick={() => navigate('/commerce/admin/products')}
                    className="w-full mt-4 text-center text-sm text-amber-500 hover:text-amber-400 py-2"
                >
                    View All Alerts ({alerts.length})
                </button>
            )}
        </div>
    );
};

export default InventoryAlertWidget;
