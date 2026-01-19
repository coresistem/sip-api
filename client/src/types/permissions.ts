// Permission Types for SIP Role-Based Access Control

export type UserRole =
    | 'SUPER_ADMIN'  // 00
    | 'PERPANI'      // 01
    | 'CLUB'         // 02
    | 'CLUB_OWNER'   // 02a - Alias for CLUB
    | 'SCHOOL'       // 03
    | 'ATHLETE'      // 04
    | 'PARENT'       // 05
    | 'COACH'        // 06
    | 'JUDGE'        // 07
    | 'EO'           // 08
    | 'SUPPLIER'     // 09
    | 'MANPOWER';    // 10

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
    | 'club_permissions';

export type SidebarCategory = 'general' | 'role_specific' | 'admin_only';

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
}

// Module metadata for display
export const MODULE_LIST: ModuleMetadata[] = [
    // --- General (Visible to All/Most) ---
    { name: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER', 'MANPOWER'] },
    { name: 'profile', label: 'Profile', icon: 'User', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER', 'MANPOWER'] },
    { name: 'digitalcard', label: 'Digital ID Card', icon: 'CreditCard', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT', 'EO', 'JUDGE', 'SUPPLIER'] },
    { name: 'notifications', label: 'Notifications', icon: 'Bell', category: 'general', defaultRoles: ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL', 'PARENT'] },

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
    { name: 'club_approval', label: 'Club Approval', icon: 'Building2', category: 'role_specific', defaultRoles: ['PERPANI'] },

    // --- Role-Specific: School ---
    { name: 'schools', label: 'Schools', icon: 'GraduationCap', category: 'role_specific', defaultRoles: ['SCHOOL'] },
    { name: 'o2sn_registration', label: 'O2SN Registration', icon: 'Trophy', category: 'role_specific', defaultRoles: ['SCHOOL'] },

    // --- Role-Specific: Parent ---
    { name: 'payments', label: 'Payments', icon: 'CreditCard', category: 'role_specific', defaultRoles: ['PARENT'] },

    // --- Role-Specific: EO ---
    { name: 'events', label: 'Events', icon: 'Calendar', category: 'role_specific', defaultRoles: ['EO', 'JUDGE', 'COACH'] },
    { name: 'event_creation', label: 'Create Event', icon: 'Plus', category: 'role_specific', defaultRoles: ['EO'] },
    { name: 'event_registration', label: 'Registrations', icon: 'Users', category: 'role_specific', defaultRoles: ['EO'] },
    { name: 'event_results', label: 'Results', icon: 'Trophy', category: 'role_specific', defaultRoles: ['EO'] },

    // --- Role-Specific: Supplier ---
    { name: 'jersey', label: 'Jersey System', icon: 'Shirt', category: 'role_specific', defaultRoles: ['SUPPLIER'] },
    { name: 'shipping', label: 'Shipping', icon: 'Truck', category: 'role_specific', defaultRoles: ['SUPPLIER', 'MANPOWER'] },

    // --- Role-Specific: Manpower ---
    { name: 'manpower', label: 'Manpower', icon: 'Users', category: 'role_specific', defaultRoles: ['SUPPLIER', 'MANPOWER'] },
    { name: 'quality_control', label: 'Quality Control', icon: 'CheckCircle', category: 'role_specific', defaultRoles: ['MANPOWER', 'SUPPLIER'] },

    // --- Role-Specific: Perpani ---
    { name: 'perpani_management', label: 'Perpani Management', icon: 'Building2', category: 'role_specific', defaultRoles: ['PERPANI'] },
    { name: 'licensing', label: 'Licensing', icon: 'Award', category: 'role_specific', defaultRoles: ['PERPANI'] },

    // --- Common / Shared ---
    { name: 'analytics', label: 'Analytics', icon: 'BarChart3', category: 'role_specific', defaultRoles: ['CLUB', 'SCHOOL', 'COACH'] },
    { name: 'reports', label: 'Reports', icon: 'FileText', category: 'role_specific', defaultRoles: ['CLUB', 'SCHOOL', 'COACH', 'EO'] },
    { name: 'enhanced_reports', label: 'Enhanced Reports', icon: 'FileBarChart', category: 'role_specific', defaultRoles: ['CLUB'] },
    { name: 'filemanager', label: 'File Manager', icon: 'FolderOpen', category: 'role_specific', defaultRoles: ['CLUB', 'SUPER_ADMIN'] },
    { name: 'history', label: 'History', icon: 'History', category: 'role_specific', defaultRoles: ['SUPER_ADMIN'] },

    // --- Admin Only ---
    { name: 'admin', label: 'Admin Panel', icon: 'Settings', category: 'admin_only', defaultRoles: ['SUPER_ADMIN'] },
    { name: 'audit_logs', label: 'Audit Logs', icon: 'FileSearch', category: 'admin_only', defaultRoles: ['SUPER_ADMIN'] },
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
    // 02a - CLUB_OWNER: Same as CLUB
    {
        role: 'CLUB_OWNER',
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
            canView: ['dashboard', 'scoring', 'bleep_test', 'schedules', 'attendance', 'analytics', 'profile', 'digitalcard', 'archerconfig', 'athlete_training_schedule', 'athlete_archery_guidance', 'achievements', 'progress'].includes(m.name),
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
            canView: ['dashboard', 'schedules', 'analytics', 'profile', 'digitalcard', 'finance'].includes(m.name),
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
            canView: ['dashboard', 'schedules', 'athletes', 'attendance', 'reports', 'profile', 'digitalcard', 'events'].includes(m.name),
            canCreate: ['schedules'].includes(m.name),
            canEdit: ['schedules', 'profile'].includes(m.name),
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
];

// Default UI settings per role
export const DEFAULT_UI_SETTINGS: RoleUISettings[] = [
    {
        role: 'SUPER_ADMIN',
        primaryColor: '#ef4444', // red
        accentColor: '#f97316',
        sidebarModules: MODULE_LIST.map(m => m.name),
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'PERPANI',
        primaryColor: '#dc2626', // deep red
        accentColor: '#ea580c',
        sidebarModules: MODULE_LIST.filter(m => m.name !== 'admin').map(m => m.name),
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'CLUB',
        primaryColor: '#f97316', // orange
        accentColor: '#eab308',
        sidebarModules: [
            // General
            'dashboard', 'profile', 'digitalcard', 'notifications',
            // Club Specific
            'organization', 'finance', 'inventory', 'member_approval', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions',
            // Inherited: Athlete
            'scoring', 'achievements', 'progress', 'athlete_training_schedule', 'athlete_archery_guidance', 'bleep_test', 'archerconfig', 'attendance_history',
            // Inherited: Coach
            'coach_analytics', 'score_validation',
            // Inherited: Parent
            'payments',
            // Shared Management
            'athletes', 'schedules', 'attendance', 'analytics', 'reports'
        ],
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts', 'finance'],
    },
    {
        role: 'CLUB_OWNER',
        primaryColor: '#f97316', // orange
        accentColor: '#eab308',
        sidebarModules: [
            'dashboard', 'profile', 'digitalcard', 'notifications',
            'organization', 'finance', 'inventory', 'member_approval', 'invoicing', 'enhanced_reports', 'filemanager', 'club_permissions',
            'scoring', 'achievements', 'progress', 'athlete_training_schedule', 'athlete_archery_guidance', 'bleep_test', 'archerconfig', 'attendance_history',
            'coach_analytics', 'score_validation',
            'payments',
            'athletes', 'schedules', 'attendance', 'analytics', 'reports'
        ],
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts', 'finance'],
    },
    {
        role: 'SCHOOL',
        primaryColor: '#10b981', // emerald
        accentColor: '#14b8a6',
        sidebarModules: ['dashboard', 'athletes', 'scoring', 'bleep_test', 'schedules', 'attendance', 'analytics', 'reports', 'profile', 'digitalcard', 'o2sn_registration'],
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'ATHLETE',
        primaryColor: '#3b82f6', // blue
        accentColor: '#0ea5e9',
        sidebarModules: ['dashboard', 'achievements', 'progress', 'scoring', 'bleep_test', 'athlete_training_schedule', 'athlete_archery_guidance', 'schedules', 'attendance', 'attendance_history', 'analytics', 'profile', 'digitalcard', 'archerconfig'],
        dashboardWidgets: ['stats', 'quickActions', 'charts'],
    },
    {
        role: 'PARENT',
        primaryColor: '#a855f7', // purple
        accentColor: '#d946ef',
        sidebarModules: ['dashboard', 'schedules', 'analytics', 'finance', 'payments', 'profile', 'digitalcard'],
        dashboardWidgets: ['stats', 'charts'],
    },
    {
        role: 'COACH',
        primaryColor: '#22c55e', // green
        accentColor: '#10b981',
        sidebarModules: ['dashboard', 'athletes', 'scoring', 'bleep_test', 'schedules', 'attendance', 'inventory', 'analytics', 'reports', 'profile', 'digitalcard', 'archerconfig', 'coach_analytics'],
        dashboardWidgets: ['stats', 'topPerformers', 'quickActions', 'charts'],
    },
    {
        role: 'JUDGE',
        primaryColor: '#6366f1', // indigo
        accentColor: '#8b5cf6',
        sidebarModules: ['dashboard', 'scoring', 'schedules', 'athletes', 'profile', 'digitalcard'],
        dashboardWidgets: ['stats', 'quickActions'],
    },
    {
        role: 'EO',
        primaryColor: '#14b8a6', // teal
        accentColor: '#06b6d4',
        sidebarModules: ['dashboard', 'events', 'schedules', 'athletes', 'attendance', 'reports', 'profile', 'digitalcard'],
        dashboardWidgets: ['stats', 'quickActions', 'charts'],
    },
    {
        role: 'SUPPLIER',
        primaryColor: '#f43f5e', // rose
        accentColor: '#fb7185',
        sidebarModules: ['dashboard', 'inventory', 'profile', 'digitalcard'],
        dashboardWidgets: ['stats', 'quickActions'],
    },
    {
        role: 'MANPOWER',
        primaryColor: '#8b5cf6', // violet
        accentColor: '#a78bfa',
        sidebarModules: ['dashboard', 'profile', 'inventory'],
        dashboardWidgets: ['stats', 'quickActions'],
    },
];
