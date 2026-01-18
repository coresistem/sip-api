const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const systemParts = [
    { code: 'bleeptest', name: 'Bleep Test', description: 'VO2 Max fitness assessment', type: 'FULLSTACK', category: 'SPORT', icon: 'Activity', componentPath: '@/features/bleep-test/BleepTest', isCore: true },
    { code: 'scoring', name: 'Scoring', description: 'Arrow scoring with target face', type: 'FULLSTACK', category: 'SPORT', icon: 'Target', componentPath: '@/pages/ScoringPage', isCore: true },
    { code: 'attendance', name: 'Attendance', description: 'Check-in/out tracking', type: 'FULLSTACK', category: 'ADMIN', icon: 'CheckSquare', componentPath: '@/pages/AttendancePage', isCore: true },
    { code: 'finance', name: 'Finance Management', description: 'Invoicing and payments', type: 'FULLSTACK', category: 'COMMERCE', icon: 'DollarSign', componentPath: '@/pages/FinancePage', isCore: true },
    { code: 'athletes_db', name: 'Athletes Database', description: 'Athlete management', type: 'FULLSTACK', category: 'ADMIN', icon: 'Users', componentPath: '@/pages/AthletesPage', isCore: true },
    { code: 'schedule', name: 'Training Schedule', description: 'Session scheduling', type: 'FULLSTACK', category: 'SPORT', icon: 'Calendar', componentPath: '@/pages/SchedulesPage', isCore: true },
    { code: 'inventory', name: 'Inventory', description: 'Equipment management', type: 'FULLSTACK', category: 'COMMERCE', icon: 'Package', componentPath: '@/pages/InventoryPage', isCore: true },
    { code: 'analytics', name: 'Analytics Dashboard', description: 'Performance analytics', type: 'FULLSTACK', category: 'SPORT', icon: 'BarChart3', componentPath: '@/pages/AnalyticsPage', isCore: true },
    { code: 'digital_id_card', name: 'Digital ID Card', description: 'Digital identity card', type: 'FULLSTACK', category: 'FOUNDATION', icon: 'CreditCard', componentPath: '@/pages/DigitalCardPage', isCore: true },
    { code: 'file_manager', name: 'File Manager', description: 'Document management', type: 'FULLSTACK', category: 'FOUNDATION', icon: 'FolderOpen', componentPath: '@/pages/FileManagerPage', isCore: true },
    { code: 'jersey_shop', name: 'Jersey Shop', description: 'Jersey e-commerce', type: 'FULLSTACK', category: 'COMMERCE', icon: 'ShoppingBag', componentPath: '@/features/jersey/JerseyPage', isCore: true },
    { code: 'worker_tasks', name: 'Worker Tasks', description: 'Production tasks', type: 'FULLSTACK', category: 'COMMERCE', icon: 'Wrench', componentPath: '@/pages/WorkerTasksPage', isCore: true },
    { code: 'qc_station', name: 'QC Station', description: 'Quality control', type: 'FULLSTACK', category: 'COMMERCE', icon: 'ClipboardCheck', componentPath: '@/pages/QCStationPage', isCore: true },
    { code: 'stats_card', name: 'Stats Card', description: 'Single statistic display', type: 'WIDGET', category: 'FOUNDATION', icon: 'Hash', componentPath: '@/components/widgets/StatsCard', isCore: false },
    { code: 'chart_line', name: 'Line Chart', description: 'Time series chart', type: 'WIDGET', category: 'FOUNDATION', icon: 'TrendingUp', componentPath: '@/components/widgets/LineChart', isCore: false },
    { code: 'chart_bar', name: 'Bar Chart', description: 'Comparison bar chart', type: 'WIDGET', category: 'FOUNDATION', icon: 'BarChart', componentPath: '@/components/widgets/BarChart', isCore: false },
    { code: 'recent_activity', name: 'Recent Activity', description: 'Activity feed', type: 'WIDGET', category: 'FOUNDATION', icon: 'Activity', componentPath: '@/components/widgets/RecentActivity', isCore: false },
    { code: 'quick_actions', name: 'Quick Actions', description: 'Shortcut buttons', type: 'WIDGET', category: 'FOUNDATION', icon: 'Zap', componentPath: '@/components/widgets/QuickActions', isCore: false },
    { code: 'score_input', name: 'Score Input', description: 'Arrow score input pad', type: 'FORM_INPUT', category: 'SPORT', icon: 'Target', componentPath: '@/components/scoring/ScoreInput', isCore: false },
    { code: 'date_picker', name: 'Date Picker', description: 'Calendar date selection', type: 'FORM_INPUT', category: 'FOUNDATION', icon: 'Calendar', componentPath: '@/components/ui/DatePicker', isCore: false },
    { code: 'file_upload', name: 'File Upload', description: 'Drag-and-drop upload', type: 'FORM_INPUT', category: 'FOUNDATION', icon: 'Upload', componentPath: '@/components/ui/FileUpload', isCore: false },
    { code: 'athlete_selector', name: 'Athlete Selector', description: 'Searchable athlete dropdown', type: 'FORM_INPUT', category: 'SPORT', icon: 'UserSearch', componentPath: '@/components/ui/AthleteSelector', isCore: false },
    { code: 'qr_scanner', name: 'QR Scanner', description: 'Camera-based QR scanner', type: 'FORM_INPUT', category: 'FOUNDATION', icon: 'QrCode', componentPath: '@/components/ui/QRScanner', isCore: false },
];

async function seed() {
    console.log('Seeding SystemParts...');
    for (const p of systemParts) {
        await prisma.systemPart.upsert({ where: { code: p.code }, update: p, create: p });
    }
    console.log('Done:', systemParts.length, 'parts seeded!');
    await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
