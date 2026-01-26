import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Package,
    Edit2,
    Trash2,
    Eye
} from 'lucide-react';

const ProductRow = ({ name, price, stock, category, image }: any) => (
    <tr className="border-b border-dark-700/50 hover:bg-dark-800/30 transition-colors">
        <td className="py-4 pl-4 pr-3">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-dark-700 overflow-hidden">
                    <img src={image || "https://placehold.co/100"} alt={name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="font-medium text-white">{name}</h4>
                    <span className="text-xs text-dark-400">SKU: PR-2026-X82</span>
                </div>
            </div>
        </td>
        <td className="px-3 py-4">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-dark-700 text-dark-300">
                {category}
            </span>
        </td>
        <td className="px-3 py-4 text-white font-medium">
            {price}
        </td>
        <td className="px-3 py-4">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={stock > 10 ? 'text-emerald-400' : 'text-red-400'}>
                    {stock} in stock
                </span>
            </div>
        </td>
        <td className="py-4 pl-3 pr-4 text-right">
            <div className="flex items-center justify-end gap-2">
                <button className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
                    <Edit2 size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>
        </td>
    </tr>
);

export default function MyShopPage() {
    const [view, setView] = useState<'grid' | 'list'>('list');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Shop</h1>
                    <p className="text-dark-400">Manage your product catalog</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-dark-800 border border-dark-700">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg border border-dark-600 text-dark-300 flex items-center gap-2 hover:bg-dark-700">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Product List */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-dark-800/50">
                            <tr>
                                <th className="text-left py-3 pl-4 pr-3 text-dark-400 font-medium">Product</th>
                                <th className="text-left py-3 px-3 text-dark-400 font-medium">Category</th>
                                <th className="text-left py-3 px-3 text-dark-400 font-medium">Price</th>
                                <th className="text-left py-3 px-3 text-dark-400 font-medium">Stock</th>
                                <th className="text-right py-3 pl-3 pr-4 text-dark-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700/50">
                            <ProductRow
                                name="Recurve Bow Pro Series X"
                                price="Rp 4.500.000"
                                stock={5}
                                category="Bows"
                            />
                            <ProductRow
                                name="Carbon Arrows (Set of 12)"
                                price="Rp 850.000"
                                stock={24}
                                category="Arrows"
                            />
                            <ProductRow
                                name="Stabilizer Long Rod"
                                price="Rp 1.200.000"
                                stock={12}
                                category="Accessories"
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
