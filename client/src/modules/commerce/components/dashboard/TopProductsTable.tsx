import { useEffect, useState } from 'react';
import { Package, TrendingUp } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import { TopProductData } from '../../types/analytics.types';

const TopProductsTable = () => {
    const [products, setProducts] = useState<TopProductData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await analyticsApi.getTopProducts() as any;
                if (response.success) {
                    setProducts(response.data);
                } else if (Array.isArray(response)) {
                    setProducts(response);
                }
            } catch (error) {
                console.error('Failed to fetch top products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="h-64 flex items-center justify-center text-slate-400">Loading products...</div>;
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 h-full">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Top Products
            </h3>
            <p className="text-sm text-slate-400 mb-6">Best selling items by volume</p>

            <div className="space-y-4">
                {products.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">No sales data yet</div>
                ) : (
                    products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 text-center font-bold text-slate-500 text-sm">
                                    #{index + 1}
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden border border-slate-600">
                                    {product.thumbnail ? (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                                            <Package className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                                        {product.name}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {product.quantity} sold
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-white">
                                    Rp {product.revenue.toLocaleString()}
                                </div>
                                <div className="text-xs text-amber-500">
                                    Revenue
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TopProductsTable;
