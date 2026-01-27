import SalesTrendChart from '../../components/dashboard/SalesTrendChart';
import TopProductsTable from '../../components/dashboard/TopProductsTable';
import InventoryAlertWidget from '../../components/dashboard/InventoryAlertWidget';

export default function SupplierDashboard() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-black text-white">Jersey Dashboard</h1>
                    <p className="text-slate-400 mt-1">Monitor manufacturing, sales, and inventory.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesTrendChart />
                <TopProductsTable />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <InventoryAlertWidget />
                </div>
                {/* Add more widgets here */}
            </div>
        </div>
    );
}
