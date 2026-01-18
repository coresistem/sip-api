import React from 'react';
import {
    Target,
    Users,
    Calendar,
    CheckSquare,
    DollarSign,
    Package,
    BarChart3,
    Activity,
    TrendingUp,
    Hash,
    Zap,
    Upload,
    QrCode,
    CreditCard,
    FolderOpen,
    ShoppingBag,
    Wrench,
    ClipboardCheck,
    UserSearch,
    UserCog,
    GraduationCap,
    History,
    AlertCircle
} from 'lucide-react';
import AthleteProfileSection from '../../../components/profile/AthleteProfileSection';
import { JerseyOrder, JerseyProduct } from '../../../services/jerseyApi';

// Import Page Components for High-Fidelity Previews
import ScoringPage from '../../../pages/ScoringPage';
import SchedulesPage from '../../../pages/SchedulesPage';
import BleepTestPage from '../../../pages/BleepTestPage';
import AttendancePage from '../../../pages/AttendancePage';
import AnalyticsPage from '../../../pages/AnalyticsPage';
import DigitalCardPage from '../../../pages/DigitalCardPage';
import ArcherConfigPage from '../../../pages/ArcherConfigPage';
import JerseyCatalogPage from '../../../pages/JerseyCatalogPage';
import OrderTrackingPage from '../../../pages/OrderTrackingPage';
import FinancePage from '../../../pages/FinancePage';

// Legacy Widgets Imports
import IndexArrowTimelineSmart from '../../../components/widgets/IndexArrowTimelineSmart';
import BMITimelineWidget from '../../../components/widgets/BMITimelineWidget';
import TrainingPerformanceWidget from '../../../components/widgets/TrainingPerformanceWidget';
import TopPerformersWidget from '../../../components/widgets/TopPerformersWidget';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Mini chart options for preview
const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
    },
    scales: {
        x: { display: false },
        y: { display: false },
    },
    elements: {
        point: { radius: 0 },
        line: { borderWidth: 2 },
    },
};

// ==================== WIDGET PREVIEWS ====================

export const StatsCardPreview: React.FC<any> = ({ title, value, trend, trendColor }) => (
    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
        <div className="flex items-center justify-between mb-2">
            <Hash className="w-5 h-5 text-blue-400" />
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${trendColor === 'red' ? 'text-red-400 bg-red-500/20' :
                trendColor === 'blue' ? 'text-blue-400 bg-blue-500/20' :
                    'text-emerald-400 bg-emerald-500/20'
                }`}>
                {trend || '+12%'}
            </span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value || '1,284'}</div>
        <div className="text-xs text-slate-400">{title || 'Total Athletes'}</div>
    </div>
);

export const LineChartPreview: React.FC<any> = ({ title, color }) => {
    const chartColor = color || '#38bdf8';
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: [8.2, 8.5, 8.3, 8.7, 8.4, 8.9, 9.1],
            borderColor: chartColor,
            backgroundColor: chartColor + '1A', // 10% opacity
            fill: true,
            tension: 0.4,
        }],
    };

    return (
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-sky-400" style={{ color: chartColor }} />
                <span className="text-xs font-medium text-white">{title || 'Score Trend'}</span>
            </div>
            <div className="h-16">
                <Line data={data} options={miniChartOptions} />
            </div>
        </div>
    );
};

export const BarChartPreview: React.FC = () => {
    const data = {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: [{
            data: [120, 145, 98, 167],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
            borderRadius: 4,
        }],
    };

    return (
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={14} className="text-purple-400" />
                <span className="text-xs font-medium text-white">Weekly Volume</span>
            </div>
            <div className="h-16">
                <Bar data={data} options={miniChartOptions} />
            </div>
        </div>
    );
};

export const RecentActivityPreview: React.FC = () => (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-amber-400" />
            <span className="text-xs font-medium text-white">Recent Activity</span>
        </div>
        <div className="space-y-2">
            {[
                { text: 'Andi scored 9.2 avg', time: '2m ago', color: 'text-emerald-400' },
                { text: 'Diana completed training', time: '5m ago', color: 'text-blue-400' },
                { text: 'New athlete registered', time: '12m ago', color: 'text-purple-400' },
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className={item.color}>{item.text}</span>
                    <span className="text-slate-500">{item.time}</span>
                </div>
            ))}
        </div>
    </div>
);

export const QuickActionsPreview: React.FC = () => (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs font-medium text-white">Quick Actions</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
            {[
                { icon: Target, label: 'Score', color: 'bg-blue-500/20 text-blue-400' },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-500/20 text-purple-400' },
                { icon: Users, label: 'Athletes', color: 'bg-emerald-500/20 text-emerald-400' },
            ].map((action, i) => (
                <div key={i} className={`flex flex-col items-center p-2 rounded ${action.color}`}>
                    <action.icon size={14} />
                    <span className="text-[8px] mt-1">{action.label}</span>
                </div>
            ))}
        </div>
    </div>
);

// ==================== FORM INPUT PREVIEWS ====================

export const ScoreInputPreview: React.FC = () => (
    <div className="bg-slate-800 rounded-lg p-3 border border-emerald-500/30">
        <label className="text-xs text-slate-400 mb-2 block">Arrow Score</label>
        <div className="grid grid-cols-6 gap-1">
            {['X', '10', '9', '8', '7', 'M'].map((score) => (
                <button
                    key={score}
                    className={`py-2 rounded text-xs font-medium ${score === 'X' ? 'bg-amber-500 text-black' :
                        score === '10' ? 'bg-yellow-400 text-black' :
                            score === 'M' ? 'bg-red-500 text-white' :
                                'bg-slate-700 text-white'
                        }`}
                >
                    {score}
                </button>
            ))}
        </div>
    </div>
);

export const DatePickerPreview: React.FC = () => (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <label className="text-xs text-slate-400 mb-1 block">Select Date</label>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded border border-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-sm text-white">Jan 13, 2026</span>
        </div>
    </div>
);

export const FileUploadPreview: React.FC = () => (
    <div className="bg-slate-800 rounded-lg p-3 border border-dashed border-slate-600">
        <div className="flex flex-col items-center text-center py-2">
            <Upload size={20} className="text-slate-400 mb-1" />
            <span className="text-xs text-slate-400">Drop files here</span>
            <span className="text-[10px] text-slate-500">or click to browse</span>
        </div>
    </div>
);

export const AthleteSelectorPreview: React.FC = () => (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <label className="text-xs text-slate-400 mb-1 block">Select Athlete</label>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded border border-slate-600">
            <UserSearch size={14} className="text-slate-400" />
            <span className="text-sm text-slate-400">Search athletes...</span>
        </div>
    </div>
);

export const QRScannerPreview: React.FC = () => (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-2 border-dashed border-cyan-500 rounded-lg flex items-center justify-center mb-2">
                <QrCode size={24} className="text-cyan-500" />
            </div>
            <span className="text-xs text-slate-400">Scan QR Code</span>
        </div>
    </div>
);

// ==================== FULLSTACK MINI PREVIEWS ====================

const FullStackMiniPreview: React.FC<{
    icon: React.ElementType;
    name: string;
    description: string;
    color: string;
    stats?: { label: string; value: string }[];
}> = ({ icon: Icon, name, description, color, stats }) => (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <h4 className="text-sm font-medium text-white">{name}</h4>
                <p className="text-[10px] text-slate-500">{description}</p>
            </div>
        </div>
        {stats && (
            <div className="grid grid-cols-3 gap-2">
                {stats.map((stat, i) => (
                    <div key={i} className="text-center p-2 bg-slate-900/50 rounded">
                        <div className="text-sm font-bold text-white">{stat.value}</div>
                        <div className="text-[8px] text-slate-500">{stat.label}</div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export const BleepTestPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={Activity}
        name="Bleep Test"
        description="VO2 Max Assessment"
        color="bg-gradient-to-br from-rose-500 to-orange-500"
        stats={[
            { label: 'Level', value: '12.4' },
            { label: 'Shuttles', value: '84' },
            { label: 'VO2 Max', value: '52' },
        ]}
    />
);

export const ScoringPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={Target}
        name="Scoring"
        description="Arrow Score Tracking"
        color="bg-gradient-to-br from-blue-500 to-cyan-500"
        stats={[
            { label: 'Ends', value: '6' },
            { label: 'Total', value: '324' },
            { label: 'Avg', value: '9.0' },
        ]}
    />
);

export const AttendancePreview: React.FC = () => (
    <FullStackMiniPreview
        icon={CheckSquare}
        name="Attendance"
        description="Check-in/Out Tracking"
        color="bg-gradient-to-br from-emerald-500 to-teal-500"
        stats={[
            { label: 'Present', value: '24' },
            { label: 'Absent', value: '3' },
            { label: 'Rate', value: '89%' },
        ]}
    />
);

export const FinancePreview: React.FC = () => (
    <FullStackMiniPreview
        icon={DollarSign}
        name="Finance"
        description="Invoicing & Payments"
        color="bg-gradient-to-br from-green-500 to-emerald-500"
        stats={[
            { label: 'Revenue', value: '12M' },
            { label: 'Pending', value: '8' },
            { label: 'Paid', value: '45' },
        ]}
    />
);

export const AthletesDBPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={Users}
        name="Athletes Database"
        description="Athlete Management"
        color="bg-gradient-to-br from-violet-500 to-purple-500"
        stats={[
            { label: 'Total', value: '156' },
            { label: 'Active', value: '142' },
            { label: 'New', value: '12' },
        ]}
    />
);

export const SchedulePreview: React.FC = () => (
    <FullStackMiniPreview
        icon={Calendar}
        name="Training Schedule"
        description="Session Planning"
        color="bg-gradient-to-br from-amber-500 to-orange-500"
        stats={[
            { label: 'Today', value: '3' },
            { label: 'Week', value: '18' },
            { label: 'Coaches', value: '4' },
        ]}
    />
);

export const InventoryPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={Package}
        name="Inventory"
        description="Equipment Management"
        color="bg-gradient-to-br from-slate-500 to-zinc-500"
        stats={[
            { label: 'Items', value: '234' },
            { label: 'Low', value: '5' },
            { label: 'Value', value: '45M' },
        ]}
    />
);

export const AnalyticsPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={BarChart3}
        name="Analytics"
        description="Performance Insights"
        color="bg-gradient-to-br from-cyan-500 to-blue-500"
        stats={[
            { label: 'Reports', value: '12' },
            { label: 'Charts', value: '8' },
            { label: 'Exports', value: '3' },
        ]}
    />
);

export const DigitalIDCardPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={CreditCard}
        name="Digital ID Card"
        description="Member Identity"
        color="bg-gradient-to-br from-indigo-500 to-violet-500"
    />
);

export const FileManagerPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={FolderOpen}
        name="File Manager"
        description="Document Storage"
        color="bg-gradient-to-br from-yellow-500 to-amber-500"
    />
);

export const ArcherConfigPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={UserCog}
        name="Archer Config"
        description="Equipment Settings"
        color="bg-gradient-to-br from-slate-600 to-slate-500"
        stats={[
            { label: 'Bow', value: 'Recurve' },
            { label: 'Weight', value: '34lbs' },
            { label: 'Height', value: '68"' },
        ]}
    />
);

export const JerseyShopPreview: React.FC<any> = ({ view }) => {
    if (view === 'orders') {
        return (
            <div className="bg-slate-800 rounded-lg p-3 border border-pink-500/30">
                <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={14} className="text-pink-400" />
                    <span className="text-xs font-medium text-white">My Orders</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] p-2 bg-slate-700/50 rounded">
                        <span className="text-white">#ORD-2849</span>
                        <span className="text-emerald-400">Delivered</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] p-2 bg-slate-700/50 rounded">
                        <span className="text-white">#ORD-2852</span>
                        <span className="text-amber-400">Processing</span>
                    </div>
                </div>
            </div>
        );
    }
    // Default: Catalog
    return (
        <FullStackMiniPreview
            icon={ShoppingBag}
            name="Jersey Shop"
            description="Official Merchandise"
            color="bg-gradient-to-br from-pink-500 to-rose-500"
            stats={[
                { label: 'New', value: '12' },
                { label: 'Promo', value: '4' },
                { label: 'Cart', value: '1' },
            ]}
        />
    );
};

export const ManpowerTasksPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={Wrench}
        name="Manpower Tasks"
        description="Production Tasks"
        color="bg-gradient-to-br from-stone-500 to-neutral-500"
        stats={[
            { label: 'Pending', value: '12' },
            { label: 'Done', value: '45' },
            { label: 'Today', value: '8' },
        ]}
    />
);

export const QCStationPreview: React.FC = () => (
    <FullStackMiniPreview
        icon={ClipboardCheck}
        name="QC Station"
        description="Quality Control"
        color="bg-gradient-to-br from-teal-500 to-cyan-500"
        stats={[
            { label: 'Queue', value: '8' },
            { label: 'Passed', value: '42' },
            { label: 'Failed', value: '3' },
        ]}
    />
);

// ==================== PROFILE PREVIEW ====================

const ProfilePreview: React.FC = () => {
    // Mock user data matching the screenshot
    const mockUser = {
        id: 'preview-user',
        name: 'Andi Pranata',
        email: 'andi@athlete.id',
        phone: '081234567890',
        whatsapp: '081234567890',
        nik: '1234567890123456',
        nikVerified: true,
        isStudent: false,
        clubId: 'cmkasjush0003rrzxe2n2jm09'
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 overflow-hidden pointer-events-none opacity-90 scale-[0.85] origin-top-left w-[117%]">
            <AthleteProfileSection
                user={mockUser}
                isSaving={false}
                onSave={async () => true}
            />
        </div>
    );
};

// ==================== PREVIEW REGISTRY ====================

// --- Mock Data for Previews ---

const MOCK_PRODUCTS: JerseyProduct[] = [
    {
        id: 'p1',
        supplierId: 's1',
        name: 'Jersey Tanding V1',
        sku: 'JER-V1',
        description: 'Competition jersey with premium breathable fabric',
        basePrice: 250000,
        currency: 'IDR',
        designUrl: 'https://placehold.co/400x400/2563eb/ffffff?text=Jersey+V1',
        category: 'JERSEY',
        variants: [
            { id: 'v1', productId: 'p1', category: 'SIZE', name: 'M', priceModifier: 0, isDefault: true, sortOrder: 1 },
            { id: 'v2', productId: 'p1', category: 'SIZE', name: 'L', priceModifier: 0, isDefault: false, sortOrder: 2 }
        ],
        minOrderQty: 1,
        visibility: 'PUBLIC',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'p2',
        supplierId: 's1',
        name: 'Training Shirt',
        sku: 'TRN-S1',
        description: 'Comfortable cotton blend for daily practice',
        basePrice: 150000,
        currency: 'IDR',
        designUrl: 'https://placehold.co/400x400/dc2626/ffffff?text=Training',
        category: 'TSHIRT',
        variants: [],
        minOrderQty: 1,
        visibility: 'PUBLIC',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

const MOCK_ORDERS: JerseyOrder[] = [
    {
        id: 'o1',
        orderNo: 'ORD-202401-001',
        customerId: 'u1',
        supplierId: 's1',
        orderType: 'INDIVIDUAL',
        status: 'PRODUCTION',
        paymentStatus: 'PAID',
        totalAmount: 250000,
        subtotal: 250000,
        addonsTotal: 0,
        currency: 'IDR',
        shippingAddress: 'Archery Range, Jakarta',
        items: [
            {
                id: 'i1',
                orderId: 'o1',
                productId: 'p1',
                product: { name: 'Jersey Tanding V1', designUrl: 'https://placehold.co/400x400/2563eb/ffffff?text=Jersey+V1' },
                recipientName: 'Athlete Name',
                quantity: 1,
                basePrice: 250000,
                selectedVariants: { SIZE: 'v1' },
                variantPrices: 0,
                lineTotal: 250000,
                nameOnJersey: 'ATHLETE'
            }
        ],
        tracking: [
            { id: 't1', orderId: 'o1', status: 'PENDING', description: 'Order received', createdAt: new Date().toISOString(), updatedBy: 'system' },
            { id: 't2', orderId: 'o1', status: 'PRODUCTION', description: 'In production', createdAt: new Date().toISOString(), updatedBy: 'admin' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

type PreviewComponent = React.FC<any>;

export const PREVIEW_REGISTRY: Record<string, PreviewComponent> = {
    // Widgets
    'stats_card': StatsCardPreview,
    'chart_line': LineChartPreview,
    'chart_bar': BarChartPreview,
    'recent_activity': RecentActivityPreview,
    'quick_actions': QuickActionsPreview,

    // Legacy / Smart Widgets (Restored)
    'index_arrow_timeline': IndexArrowTimelineSmart,
    'bmi_timeline': BMITimelineWidget,
    'training_performance_timeline': TrainingPerformanceWidget,
    'top_performers': TopPerformersWidget,

    // Form Inputs
    'score_input': ScoreInputPreview,
    'date_picker': DatePickerPreview,
    'file_upload': FileUploadPreview,
    'athlete_selector': AthleteSelectorPreview,
    'qr_scanner': QRScannerPreview,

    // Full Page Features (High Fidelity)
    'profile_details': ProfilePreview,
    'bleeptest': BleepTestPage,
    'scoring': ScoringPage,
    'attendance': AttendancePage,
    'finance': FinancePage,
    'schedule': SchedulesPage,
    'analytics': AnalyticsPage,
    'digital_id_card': DigitalCardPage,
    'archer_config': ArcherConfigPage,

    // Dynamic Logic for Jersey Shop
    'jersey_shop': (props: any) => {
        const view = props.view || 'catalog';
        if (view === 'orders') {
            return <OrderTrackingPage mockOrders={MOCK_ORDERS} />;
        }
        return <JerseyCatalogPage mockProducts={MOCK_PRODUCTS} />;
    },

    // Mini Previews (Fallbacks / Not yet implemented pages)
    'athletes_db': AthletesDBPreview,
    'inventory': InventoryPreview,
    'file_manager': FileManagerPreview,
    'worker_tasks': ManpowerTasksPreview,
    'qc_station': QCStationPreview,
};

export const getPreviewComponent = (code: string): PreviewComponent | null => {
    return PREVIEW_REGISTRY[code] || null;
};
