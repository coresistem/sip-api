import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Mail, Phone } from 'lucide-react';
import { getCustomerList, JerseyCustomer, formatCurrency } from '../../../../services/jerseyApi';

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<JerseyCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getCustomerList();
                setCustomers(data);
            } catch (error) {
                console.error('Failed to fetch customers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-6 text-slate-400">Loading customers...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Customers</h1>
                    <p className="text-slate-400">Manage your customer base and view history.</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
            </div>

            {/* List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium">Customer</th>
                            <th className="p-4 font-medium">Contact</th>
                            <th className="p-4 font-medium text-center">Orders</th>
                            <th className="p-4 font-medium text-right">Total Spent</th>
                            <th className="p-4 font-medium text-right">Last Order</th>
                            <th className="p-4 font-medium text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No customers found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                                {customer.avatarUrl ? (
                                                    <img src={customer.avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="font-medium text-white">{customer.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-sm text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-slate-500" />
                                                {customer.email}
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-slate-500" />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                            {customer.totalOrders}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-medium text-cyan-400">
                                        {formatCurrency(customer.totalSpent || 0)}
                                    </td>
                                    <td className="p-4 text-right text-sm text-slate-400">
                                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => navigate(`/jersey/admin/customers/${customer.id}`)}
                                            className="text-cyan-500 hover:text-cyan-400 text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerList;
