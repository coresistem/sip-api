// Permission Types for SIP Role-Based Access Control

export type UserRole =
    | 'SUPER_ADMIN'
    | 'PERPANI'
    | 'CLUB'
    | 'SCHOOL'
    | 'ATHLETE'
    | 'PARENT'
    | 'COACH'
    | 'JUDGE'
    | 'EO'
    | 'SUPPLIER'
    | 'MANPOWER'
    | 'LEGAL';

export type ModuleName =
    | 'dashboard'
    | 'athletes'
    | 'scoring'
    | 'schedules'
    | 'attendance'
    | 'finance'
    | 'inventory'
    | 'analytics'
    | 'reports'
    | 'profile'
    | 'digitalcard'
    | 'archerconfig'
    | 'organization'
    | 'manpower'
    | 'filemanager'
    | 'admin'
    | 'bleep_test'
    | 'jersey'
    | 'athlete_training_schedule'
    | 'athlete_archery_guidance'
    | 'perpani_management'
    | 'schools'

    | 'quality_control'
    | 'notifications'
    | 'audit_logs'
    | 'history'
    | 'shipping'
    | 'achievements'
    | 'progress'
    | 'coach_analytics'
    | 'member_approval'
    | 'invoicing'
    | 'payments'
    | 'o2sn_registration'
    | 'club_approval'
    | 'licensing'
    | 'event_creation'
    | 'enhanced_reports'
    | 'attendance_history'
    | 'event_registration'
    | 'event_results'
    | 'score_validation'
    | 'events'
    | 'club_permissions'
    | 'my_orders'
    | 'catalog'
    | 'jersey_dashboard'
    | 'jersey_orders'
    | 'jersey_timeline'
    | 'jersey_products'
    | 'jersey_manpower'
    | 'units'
    | 'labs';

export type SidebarCategory = 'general' | 'role_specific' | 'admin_only' | 'FOUNDATION' | 'COMMERCE' | 'OPS' | 'SPORT' | 'ADMIN' | 'ATHLETE';

export type ActionType = 'view' | 'create' | 'edit' | 'delete';

export interface ModulePermission {
    module: ModuleName;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export interface RolePermissions {
    role: UserRole;
    permissions: ModulePermission[];
}

export interface RoleUISettings {
    role: UserRole;
    primaryColor: string;
    accentColor: string;
    sidebarModules: ModuleName[];
    dashboardWidgets: string[];
}

export interface ModuleMetadata {
    name: ModuleName;
    label: string;
    icon: string;
    category: SidebarCategory;
    defaultRoles?: UserRole[]; // Roles that see this by default
    restrictedTo?: UserRole[]; // If set, ONLY these roles can have this module
}

// Module metadata for display
export const MODULE_LIST: ModuleMetadata[] = [
    // --- General (Visible to All/Most) ---
    { name: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER', 'MANPOWER'] },
    { name: 'profile', label: 'Profile', icon: 'User', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER', 'MANPOWER'] },
    { name: 'digitalcard', label: 'Digital ID Card', icon: 'CreditCard', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER'] },
    { name: 'notifications', label: 'Notifications', icon: 'Bell', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT'] },
    { name: 'labs', label: 'Csystem Labs', icon: 'FlaskConical', category: 'general', defaultRoles: ['SUPER_ADMIN'] },

    // --- Role-Specific: Athlete ---
    { name: 'scoring', label: 'Scoring', icon: 'Target', category: 'role_specific', defaultRoles: ['ATHLETE', 'COACH', 'CLUB'] },
    { name: 'achievements', label: 'Achievements', icon: 'Trophy', category: 'role_specific', defaultRoles: ['ATHLETE'] },
    { name: 'progress', label: 'Progress Charts', category: 'role_specific', icon: 'TrendingUp', defaultRoles: ['ATHLETE'] },
    { name: 'athlete_training_schedule', label: 'Training Schedule', icon: 'Calendar', category: 'role_specific', defaultRoles: ['ATHLETE'] },
    { name: 'athlete_archery_guidance', label: 'Archery Guidance', icon: 'Shield', category: 'role_specific', defaultRoles: ['ATHLETE'] },
    { name: 'bleep_test', label: 'Bleep Test', icon: 'Timer', category: 'role_specific', defaultRoles: ['ATHLETE', 'COACH'] },
    { name: 'archerconfig', label: 'Archer Config', icon: 'Target', category: 'role_specific', defaultRoles: ['ATHLETE', 'COACH'] },
    { name: 'attendance_history', label: 'Attendance History', icon: 'Calendar', category: 'role_specific', defaultRoles: ['ATHLETE'] },

    // --- Role-Specific: Coach ---
    { name: 'coach_analytics', label: 'Team Analytics', icon: 'BarChart3', category: 'role_specific', defaultRoles: ['COACH'] },
    { name: 'score_validation', label: 'Score Validation', icon: 'Target', category: 'role_specific', defaultRoles: ['COACH', 'JUDGE'] },

    // --- Role-Specific: Club ---
    { name: 'athletes', label: 'Athletes', icon: 'Users', category: 'role_specific', defaultRoles: ['CLUB', 'COACH', 'SCHOOL', 'EO'] },
    { name: 'schedules', label: 'Schedules', icon: 'Calendar', category: 'role_specific', defaultRoles: ['CLUB', 'COACH', 'SCHOOL', 'EO', 'JUDGE'] },
    { name: 'attendance', label: 'Attendance', icon: 'CheckSquare', category: 'role_specific', defaultRoles: ['CLUB', 'COACH', 'SCHOOL', 'EO'] },
    { name: 'finance', label: 'Finance', icon: 'DollarSign', category: 'role_specific', defaultRoles: ['CLUB', 'PARENT'] },
    { name: 'inventory', label: 'Inventory', icon: 'Package', category: 'role_specific', defaultRoles: ['CLUB', 'SUPPLIER', 'MANPOWER'] },
    { name: 'organization', label: 'Organization', icon: 'Building2', category: 'role_specific', defaultRoles: ['CLUB'] },
    { name: 'member_approval', label: 'Member Approval', icon: 'UserCheck', category: 'role_specific', defaultRoles: ['CLUB'] },
    { name: 'invoicing', label: 'Invoicing', icon: 'Receipt', category: 'role_specific', defaultRoles: ['CLUB'] },
    { name: 'club_permissions', label: 'Club Panel', icon: 'Shield', category: 'role_specific', defaultRoles: ['CLUB'] },
    { name: 'units', label: 'Units', icon: 'MapPin', category: 'role_specific', defaultRoles: ['CLUB'] },
    { name: 'club_approval', label: 'Club Approval', icon: 'Building2', category: 'role_specific', defaultRoles: ['PERPANI'] },

    // --- Role-Specific: School ---
    { name: 'schools', label: 'Schools', icon: 'GraduationCap', category: 'role_specific', defaultRoles: ['SCHOOL'] },
    { name: 'o2sn_registration', label: 'O2SN Registration', icon: 'Trophy', category: 'role_specific', defaultRoles: ['SCHOOL'] },

    // --- Role-Specific: Parent ---
    { name: 'payments', label: 'Payments', icon: 'CreditCard', category: 'role_specific', defaultRoles: ['PARENT'] },

    // --- Role-Specific: EO ---
    { name: 'events', label: 'Event Management', icon: 'Calendar', category: 'role_specific', defaultRoles: ['EO', 'JUDGE', 'COACH'] },
    { name: 'event_creation', label: 'Create Event', icon: 'Plus', category: 'role_specific', defaultRoles: ['EO'] },
    { name: 'event_registration', label: 'Registrations', icon: 'Users', category: 'role_specific', defaultRoles: ['EO'] },
    { name: 'event_results', label: 'Results', icon: 'Trophy', category: 'role_specific', defaultRoles: ['EO'] },

    // --- Role-Specific: Supplier ---
    { name: 'jersey', label: 'Jersey System', icon: 'Shirt', category: 'role_specific', defaultRoles: ['SUPPLIER'], restrictedTo: ['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER'] },
    { name: 'shipping', label: 'Jersey Logistics', icon: 'Truck', category: 'role_specific', defaultRoles: ['SUPPLIER', 'MANPOWER'], restrictedTo: ['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER'] },

    // --- Role-Specific: Manpower ---
    { name: 'manpower', label: 'Manpower Management', icon: 'Users', category: 'role_specific', defaultRoles: ['SUPPLIER', 'MANPOWER'] },
    { name: 'quality_control', label: 'QC Station', icon: 'CheckCircle', category: 'role_specific', defaultRoles: ['MANPOWER', 'SUPPLIER'], restrictedTo: ['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER'] },

    // --- Role-Specific: Perpani ---
    { name: 'perpani_management', label: 'Perpani Management', icon: 'Building2', category: 'role_specific', defaultRoles: ['PERPANI'], restrictedTo: ['PERPANI', 'SUPER_ADMIN'] },
    { name: 'licensing', label: 'Licensing', icon: 'Award', category: 'role_specific', defaultRoles: ['PERPANI'], restrictedTo: ['PERPANI', 'SUPER_ADMIN'] },

    // --- Common / Shared ---
    { name: 'analytics', label: 'Analytics', icon: 'BarChart3', category: 'role_specific', defaultRoles: ['CLUB', 'SCHOOL', 'COACH'] },
    { name: 'reports', label: 'Reports', icon: 'FileText', category: 'role_specific', defaultRoles: ['CLUB', 'SCHOOL', 'COACH', 'EO'] },
    { name: 'enhanced_reports', label: 'Enhanced Reports', icon: 'FileBarChart', category: 'role_specific', defaultRoles: ['CLUB'] },
    { name: 'filemanager', label: 'File Manager', icon: 'FolderOpen', category: 'role_specific', defaultRoles: ['CLUB', 'SUPER_ADMIN'] },
    { name: 'history', label: 'History', icon: 'History', category: 'role_specific', defaultRoles: ['SUPER_ADMIN'] },

    // --- Admin Only ---
    { name: 'admin', label: 'Admin Panel', icon: 'Settings', category: 'admin_only', defaultRoles: ['SUPER_ADMIN'] },
    { name: 'audit_logs', label: 'Audit Logs', icon: 'FileSearch', category: 'admin_only', defaultRoles: ['SUPER_ADMIN'] },

    // --- General (Available to All Roles) ---
    { name: 'my_orders', label: 'Order History', icon: 'ShoppingBag', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER', 'MANPOWER', 'PERPANI'] },
    { name: 'catalog', label: 'Csystem Market', icon: 'Package', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER', 'MANPOWER', 'PERPANI'] },

    // --- Supplier (Jersey System) ---
    { name: 'jersey_dashboard', label: 'Jersey Dashboard', icon: 'LayoutDashboard', category: 'role_specific', defaultRoles: ['SUPPLIER', 'SUPER_ADMIN'], restrictedTo: ['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER'] },
    { name: 'jersey_orders', label: 'Purchase Orders (PO)', icon: 'ClipboardList', category: 'role_specific', defaultRoles: ['SUPPLIER', 'SUPER_ADMIN'], restrictedTo: ['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER'] },
    { name: 'jersey_timeline', label: 'Timeline Monitor', icon: 'Timer', category: 'role_specific', defaultRoles: ['SUPPLIER', 'SUPER_ADMIN'], restrictedTo: ['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER'] },
    { name: 'jersey_products', label: 'Products', icon: 'Shirt', category: 'role_specific', defaultRoles: ['SUPPLIER', 'SUPER_ADMIN'], restrictedTo: ['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER'] },

];

// Sidebar Role Groups - defines which modules belong to which role group
export type SidebarRoleGroup = 'general' | 'athlete' | 'coach' | 'club' | 'school' | 'parent' | 'eo' | 'judge' | 'supplier' | 'manpower' | 'perpani' | 'legal';

export interface SidebarGroupConfig {
    id: SidebarRoleGroup;
    label: string;
    icon: string;
    color: string;
    modules: ModuleName[];
    // Nested module configuration: { parentModule: [childModules] }
    nestedModules?: Partial<Record<ModuleName, ModuleName[]>>;
}

export const SIDEBAR_ROLE_GROUPS: SidebarGroupConfig[] = [
    {
        id: 'general',
        label: 'General',
        icon: 'LayoutDashboard',
        color: 'primary',
        modules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'catalog']
    },
    {
        id: 'athlete',
        label: 'Athlete',
        icon: 'Target',
        color: 'blue',
        modules: ['scoring', 'achievements', 'progress', 'athlete_training_schedule', 'athlete_archery_guidance', 'bleep_test', 'archerconfig', 'attendance_history']
    },
    {
        id: 'coach',
        label: 'Coach',
        icon: 'Users',
        color: 'green',
        modules: ['coach_analytics', 'score_validation', 'athletes', 'schedules', 'attendance']
    },
    {
        id: 'club',
        label: 'Club',
        icon: 'Building2',
        color: 'orange',
        modules: ['organization', 'finance', 'inventory', 'member_approval', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions', 'analytics', 'reports']
    },
    {
        id: 'school',
        label: 'School',
        icon: 'GraduationCap',
        color: 'emerald',
        modules: ['schools', 'o2sn_registration']
    },
    {
        id: 'parent',
        label: 'Parent',
        icon: 'Heart',
        color: 'purple',
        modules: ['payments']
    },
    {
        id: 'eo',
        label: 'Event Organizer',
        icon: 'Calendar',
        color: 'teal',
        modules: ['events', 'event_creation', 'event_registration', 'event_results']
    },
    {
        id: 'judge',
        label: 'Judge',
        icon: 'Scale',
        color: 'indigo',
        modules: ['score_validation']
    },
    {
        id: 'supplier',
        label: 'Supplier',
        icon: 'Package',
        color: 'rose',
        modules: ['jersey_dashboard', 'jersey_orders', 'jersey_timeline', 'jersey_products', 'manpower', 'inventory'],
        // Jersey System nested modules - QC and Shipping are under Jersey Dashboard
        nestedModules: {
            jersey_dashboard: ['quality_control', 'shipping']
        }
    },
    {
        id: 'manpower',
        label: 'Manpower',
        icon: 'Wrench',
        color: 'violet',
        modules: ['manpower', 'inventory', 'jersey_dashboard'],
        nestedModules: {
            jersey_dashboard: ['quality_control', 'shipping']
        }
    },
    {
        id: 'perpani',
        label: 'Federation',
        icon: 'Award',
        color: 'red',
        modules: ['perpani_management', 'licensing', 'club_approval']
    },
    {
        id: 'legal',
        label: 'Legal & Compliance',
        icon: 'Scale',
        color: 'cyan',
        modules: ['dashboard', 'profile', 'digitalcard', 'admin', 'audit_logs']
    }
];

// Role display metadata
export const ROLE_LIST: { role: UserRole; code: string; label: string }[] = [
    { role: 'SUPER_ADMIN', code: '00', label: 'Super Admin' },
    { role: 'PERPANI', code: '01', label: 'Perpani' },
    { role: 'CLUB', code: '02', label: 'Club' },
    { role: 'SCHOOL', code: '03', label: 'School' },
    { role: 'ATHLETE', code: '04', label: 'Athlete' },
    { role: 'PARENT', code: '05', label: 'Parent' },
    { role: 'COACH', code: '06', label: 'Coach' },
    { role: 'JUDGE', code: '07', label: 'Judge' },
    { role: 'EO', code: '08', label: 'Event Organizer' },
    { role: 'SUPPLIER', code: '09', label: 'Supplier' },
    { role: 'MANPOWER', code: '10', label: 'Manpower' },
    { role: 'LEGAL', code: '11', label: 'Legal & Compliance' },
];

// Default permissions matrix
export const DEFAULT_PERMISSIONS: RolePermissions[] = [
    // 00 - SUPER_ADMIN: Full access to everything
    {
        role: 'SUPER_ADMIN',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
        })),
    },
    // 01 - PERPANI: Federation oversight
    {
        role: 'PERPANI',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: true,
            canCreate: !['admin'].includes(m.name),
            canEdit: !['admin'].includes(m.name),
            canDelete: ['athletes', 'schedules'].includes(m.name),
        })),
    },
    // 02 - CLUB: Club owner/manager
    {
        role: 'CLUB',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: m.name !== 'admin',
            canCreate: m.name !== 'admin',
            canEdit: m.name !== 'admin',
            canDelete: m.name !== 'admin',
        })),
    },
    // 03 - SCHOOL: School account
    {
        role: 'SCHOOL',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: !['admin', 'finance'].includes(m.name),
            canCreate: ['athletes', 'schedules', 'attendance'].includes(m.name),
            canEdit: ['athletes', 'schedules', 'profile'].includes(m.name),
            canDelete: false,
        })),
    },
    // 04 - ATHLETE: Registered athlete
    {
        role: 'ATHLETE',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: ['dashboard', 'scoring', 'bleep_test', 'schedules', 'attendance', 'analytics', 'profile', 'digitalcard', 'archerconfig', 'athlete_training_schedule', 'athlete_archery_guidance', 'achievements', 'progress', 'events'].includes(m.name),
            canCreate: ['scoring'].includes(m.name),
            canEdit: ['profile', 'archerconfig'].includes(m.name),
            canDelete: false,
        })),
    },
    // 05 - PARENT: Parent/guardian
    {
        role: 'PARENT',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: ['dashboard', 'schedules', 'analytics', 'profile', 'digitalcard', 'finance', 'events'].includes(m.name),
            canCreate: false,
            canEdit: ['profile'].includes(m.name),
            canDelete: false,
        })),
    },
    // 06 - COACH: Coach/trainer
    {
        role: 'COACH',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: !['finance', 'admin'].includes(m.name),
            canCreate: ['scoring', 'bleep_test', 'schedules', 'attendance'].includes(m.name),
            canEdit: ['athletes', 'scoring', 'schedules', 'profile'].includes(m.name) || m.name === 'coach_analytics',
            canDelete: false,
        })),
    },
    // 07 - JUDGE: Competition judge
    {
        role: 'JUDGE',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: ['dashboard', 'scoring', 'schedules', 'athletes', 'profile', 'digitalcard'].includes(m.name),
            canCreate: ['scoring'].includes(m.name),
            canEdit: ['scoring', 'profile'].includes(m.name),
            canDelete: false,
        })),
    },
    // 08 - EO: Event Organizer
    {
        role: 'EO',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: ['dashboard', 'schedules', 'athletes', 'attendance', 'reports', 'profile', 'digitalcard', 'events', 'event_creation', 'event_registration', 'event_results'].includes(m.name),
            canCreate: ['schedules', 'event_creation'].includes(m.name),
            canEdit: ['schedules', 'profile', 'event_creation', 'event_registration', 'event_results'].includes(m.name),
            canDelete: false,
        })),
    },
    // 09 - SUPPLIER: Equipment vendor
    {
        role: 'SUPPLIER',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: ['dashboard', 'inventory', 'profile', 'digitalcard'].includes(m.name),
            canCreate: ['inventory'].includes(m.name),
            canEdit: ['inventory', 'profile'].includes(m.name),
            canDelete: false,
        })),
    },
    // 10 - MANPOWER: Supporting role (Production Crew, Club Official, Event Crew)
    {
        role: 'MANPOWER',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: ['dashboard', 'profile', 'inventory', 'schedules', 'finance', 'people', 'production'].includes(m.name),
            canCreate: false,
            canEdit: ['profile'].includes(m.name),
            canDelete: false,
        })),
    },
    // 11 - LEGAL: Compliance and Audit
    {
        role: 'LEGAL',
        permissions: MODULE_LIST.map(m => ({
            module: m.name,
            canView: ['dashboard', 'profile', 'digitalcard', 'admin', 'audit_logs', 'notifications'].includes(m.name),
            canCreate: false, // Legal only reviews
            canEdit: ['profile'].includes(m.name),
            canDelete: false,
        })),
    },
];

// Default UI settings per role
// INTEGRATION PHASE: Strict limit on sidebars. Only Dashboard, Profile, DigitalCard. All else hidden/Labs.
export const DEFAULT_UI_SETTINGS: RoleUISettings[] = [
    {
        role: 'SUPER_ADMIN',
        primaryColor: '#ef4444',
        accentColor: '#f97316',
        sidebarModules: MODULE_LIST.map(m => m.name), // Super Admin sees ALL
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'PERPANI',
        primaryColor: '#dc2626',
        accentColor: '#ea580c',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'club_approval'], // Perpani needs Club Approval & Notifications
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'CLUB',
        primaryColor: '#f97316',
        accentColor: '#eab308',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'member_approval'], // Club needs Member Approval & Notifications
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts', 'finance'],
    },
    {
        role: 'SCHOOL',
        primaryColor: '#10b981',
        accentColor: '#14b8a6',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'ATHLETE',
        primaryColor: '#3b82f6',
        accentColor: '#0ea5e9',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'quickActions', 'charts'],
    },
    {
        role: 'PARENT',
        primaryColor: '#a855f7',
        accentColor: '#d946ef',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'charts'],
    },
    {
        role: 'COACH',
        primaryColor: '#22c55e',
        accentColor: '#10b981',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'JUDGE',
        primaryColor: '#6366f1',
        accentColor: '#8b5cf6',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'quickActions'],
    },
    {
        role: 'EO',
        primaryColor: '#14b8a6',
        accentColor: '#06b6d4',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'quickActions', 'charts'],
    },
    {
        role: 'SUPPLIER',
        primaryColor: '#f43f5e', // rose
        accentColor: '#fb7185',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'quickActions'],
    },
    {
        role: 'MANPOWER',
        primaryColor: '#8b5cf6', // violet
        accentColor: '#a78bfa',
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications'],
        dashboardWidgets: ['stats', 'quickActions'],
    },
    {
        role: 'LEGAL',
        primaryColor: '#06b6d4', // cyan-500
        accentColor: '#22d3ee', // cyan-400
        sidebarModules: ['dashboard', 'profile', 'digitalcard', 'notifications', 'admin', 'audit_logs'],
        dashboardWidgets: ['stats', 'quickActions'],
    },
];
