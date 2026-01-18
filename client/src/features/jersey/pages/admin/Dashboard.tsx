import SalesTrendChart from '../../components/dashboard/SalesTrendChart';
import TopProductsTable from '../../components/dashboard/TopProductsTable';
import InventoryAlertWidget from '../../components/dashboard/InventoryAlertWidget';

export default function JerseyDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-white">Supplier Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SalesTrendChart />
                <TopProductsTable />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <InventoryAlertWidget />
                </div>
            </div>
        </div>
    );
}
