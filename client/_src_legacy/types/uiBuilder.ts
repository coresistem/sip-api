// UI Builder Types for configuring module visibility and layout elements

import { ModuleName, UserRole } from './permissions';

// Element types for layout configuration
export type UIElementType = 'logo' | 'icon' | 'text' | 'button';

// Module layout types available for custom modules
export type ModuleLayoutType =
    | 'calendar'
    | 'deck'
    | 'table'
    | 'gallery'
    | 'detail'
    | 'map'
    | 'chart'
    | 'dashboard'
    | 'form'
    | 'onboarding'
    | 'card';

// Logo element configuration
export interface LogoConfig {
    source: 'club' | 'user' | 'custom';
    customUrl?: string;
    size: 'sm' | 'md' | 'lg';
}

// Icon element configuration
export interface IconConfig {
    name: string; // Lucide icon name
    color: string;
}

// Text element configuration
export interface TextConfig {
    content: string; // Supports {user.name}, {club.name}, etc.
    style: 'heading' | 'subheading' | 'body';
}

// Button element configuration
export interface ButtonConfig {
    label: string;
    action: 'navigate' | 'modal' | 'external';
    target: string;
    variant: 'primary' | 'secondary' | 'ghost';
}

// Union type for element configs
export type ElementConfig = LogoConfig | IconConfig | TextConfig | ButtonConfig;

// UI Element definition
export interface UIElement {
    id: string;
    type: UIElementType;
    visible: boolean;
    config: ElementConfig;
}

// Module layout sections
export interface ModuleLayout {
    leftTitle?: UIElement[];
    middleTitle?: UIElement[];
    rightTitle?: UIElement[];
}

// Module configuration
export interface UIModuleConfig {
    moduleId: ModuleName | string;
    visible: boolean;
    order: number;
    layout?: ModuleLayout;
}

// Custom module definition
export interface CustomModule {
    id: string;
    name: string;
    label: string;
    icon: string;
    type: ModuleLayoutType;
    dataSource?: string;
    visible: boolean;
    order: number;
    layout?: ModuleLayout;
}

// Extended UI Settings for a role
export interface ExtendedUISettings {
    role: UserRole;
    primaryColor: string;
    accentColor: string;
    modules: UIModuleConfig[];
    customModules: CustomModule[];
}

// UI Builder storage format
export interface UIBuilderConfig {
    version: string;
    lastUpdated: string;
    settings: ExtendedUISettings[];
}

// Default layout elements for each module
export const DEFAULT_MODULE_LAYOUTS: Record<string, ModuleLayout> = {
    dashboard: {
        leftTitle: [
            { id: 'dash_title', type: 'text', visible: true, config: { content: 'Welcome back, {user.name}', style: 'heading' } as TextConfig },
            { id: 'dash_subtitle', type: 'text', visible: true, config: { content: "Here's what's happening today", style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'dash_btn', type: 'button', visible: true, config: { label: 'Quick Actions', action: 'modal', target: 'quickActions', variant: 'secondary' } as ButtonConfig },
        ],
    },
    athletes: {
        leftTitle: [
            { id: 'ath_title', type: 'text', visible: true, config: { content: 'Athletes', style: 'heading' } as TextConfig },
            { id: 'ath_subtitle', type: 'text', visible: true, config: { content: 'Manage your team members', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'ath_btn', type: 'button', visible: true, config: { label: 'Add Athlete', action: 'modal', target: 'addAthlete', variant: 'primary' } as ButtonConfig },
        ],
    },
    scoring: {
        leftTitle: [
            { id: 'sc_title', type: 'text', visible: true, config: { content: 'Scoring', style: 'heading' } as TextConfig },
            { id: 'sc_subtitle', type: 'text', visible: true, config: { content: 'Track scores and performance', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'sc_btn', type: 'button', visible: true, config: { label: 'New Session', action: 'modal', target: 'newSession', variant: 'primary' } as ButtonConfig },
        ],
    },
    schedules: {
        leftTitle: [
            { id: 'sch_title', type: 'text', visible: true, config: { content: 'Schedules', style: 'heading' } as TextConfig },
            { id: 'sch_subtitle', type: 'text', visible: true, config: { content: 'Manage training and events', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'sch_btn', type: 'button', visible: true, config: { label: 'Add Event', action: 'modal', target: 'addEvent', variant: 'primary' } as ButtonConfig },
        ],
    },
    attendance: {
        leftTitle: [
            { id: 'att_title', type: 'text', visible: true, config: { content: 'Attendance', style: 'heading' } as TextConfig },
            { id: 'att_subtitle', type: 'text', visible: true, config: { content: 'Track check-ins and presence', style: 'subheading' } as TextConfig },
        ],
    },
    finance: {
        leftTitle: [
            { id: 'fin_title', type: 'text', visible: true, config: { content: 'Finance', style: 'heading' } as TextConfig },
            { id: 'fin_subtitle', type: 'text', visible: true, config: { content: 'Payments and transactions', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'fin_btn', type: 'button', visible: true, config: { label: 'New Transaction', action: 'modal', target: 'newTransaction', variant: 'primary' } as ButtonConfig },
        ],
    },
    inventory: {
        leftTitle: [
            { id: 'inv_title', type: 'text', visible: true, config: { content: 'Inventory', style: 'heading' } as TextConfig },
            { id: 'inv_subtitle', type: 'text', visible: true, config: { content: 'Equipment and supplies', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'inv_btn', type: 'button', visible: true, config: { label: 'Add Item', action: 'modal', target: 'addItem', variant: 'primary' } as ButtonConfig },
        ],
    },
    analytics: {
        leftTitle: [
            { id: 'ana_title', type: 'text', visible: true, config: { content: 'Analytics', style: 'heading' } as TextConfig },
            { id: 'ana_subtitle', type: 'text', visible: true, config: { content: 'Performance insights', style: 'subheading' } as TextConfig },
        ],
    },
    reports: {
        leftTitle: [
            { id: 'rep_title', type: 'text', visible: true, config: { content: 'Reports', style: 'heading' } as TextConfig },
            { id: 'rep_subtitle', type: 'text', visible: true, config: { content: 'Generate and export reports', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'rep_btn', type: 'button', visible: true, config: { label: 'Generate', action: 'modal', target: 'generateReport', variant: 'primary' } as ButtonConfig },
        ],
    },
    profile: {
        leftTitle: [
            { id: 'pro_title', type: 'text', visible: true, config: { content: 'Profile', style: 'heading' } as TextConfig },
            { id: 'pro_subtitle', type: 'text', visible: true, config: { content: 'Your personal information', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'pro_btn', type: 'button', visible: true, config: { label: 'Edit Profile', action: 'modal', target: 'editProfile', variant: 'secondary' } as ButtonConfig },
        ],
    },
    digitalcard: {
        leftTitle: [
            { id: 'dc_title', type: 'text', visible: true, config: { content: 'Digital ID Card', style: 'heading' } as TextConfig },
            { id: 'dc_subtitle', type: 'text', visible: true, config: { content: 'Your membership card', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'dc_btn', type: 'button', visible: true, config: { label: 'Download', action: 'modal', target: 'downloadCard', variant: 'primary' } as ButtonConfig },
        ],
    },
    archerconfig: {
        leftTitle: [
            { id: 'ac_title', type: 'text', visible: true, config: { content: 'Archer Config', style: 'heading' } as TextConfig },
            { id: 'ac_subtitle', type: 'text', visible: true, config: { content: 'Equipment settings', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'ac_btn', type: 'button', visible: true, config: { label: 'Save Config', action: 'modal', target: 'saveConfig', variant: 'primary' } as ButtonConfig },
        ],
    },
    organization: {
        leftTitle: [
            { id: 'org_title', type: 'text', visible: true, config: { content: 'Organization', style: 'heading' } as TextConfig },
            { id: 'org_subtitle', type: 'text', visible: true, config: { content: 'Club information', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'org_btn', type: 'button', visible: true, config: { label: 'Edit Info', action: 'modal', target: 'editOrg', variant: 'secondary' } as ButtonConfig },
        ],
    },
    manpower: {
        leftTitle: [
            { id: 'mp_title', type: 'text', visible: true, config: { content: 'Manpower', style: 'heading' } as TextConfig },
            { id: 'mp_subtitle', type: 'text', visible: true, config: { content: 'Staff and coaches', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'mp_btn', type: 'button', visible: true, config: { label: 'Add Member', action: 'modal', target: 'addMember', variant: 'primary' } as ButtonConfig },
        ],
    },
    filemanager: {
        leftTitle: [
            { id: 'fm_title', type: 'text', visible: true, config: { content: 'File Manager', style: 'heading' } as TextConfig },
            { id: 'fm_subtitle', type: 'text', visible: true, config: { content: 'Documents and media', style: 'subheading' } as TextConfig },
        ],
        rightTitle: [
            { id: 'fm_btn', type: 'button', visible: true, config: { label: 'Upload', action: 'modal', target: 'uploadFile', variant: 'primary' } as ButtonConfig },
        ],
    },
    admin: {
        leftTitle: [
            { id: 'adm_title', type: 'text', visible: true, config: { content: 'Admin Panel', style: 'heading' } as TextConfig },
            { id: 'adm_subtitle', type: 'text', visible: true, config: { content: 'System configuration', style: 'subheading' } as TextConfig },
        ],
    },
};

// Default module configs generator with layout elements
export const generateDefaultModuleConfigs = (modules: ModuleName[]): UIModuleConfig[] => {
    return modules.map((moduleId, index) => ({
        moduleId,
        visible: true,
        order: index,
        layout: DEFAULT_MODULE_LAYOUTS[moduleId] || undefined,
    }));
};

// Storage key for local config
export const UI_BUILDER_STORAGE_KEY = 'sip_ui_builder_config_v2';

// Get config from localStorage
export const getUIBuilderConfig = (): UIBuilderConfig | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(UI_BUILDER_STORAGE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored) as UIBuilderConfig;
    } catch {
        return null;
    }
};

// Save config to localStorage
export const saveUIBuilderConfig = (config: UIBuilderConfig): void => {
    if (typeof window === 'undefined') return;
    config.lastUpdated = new Date().toISOString();
    localStorage.setItem(UI_BUILDER_STORAGE_KEY, JSON.stringify(config));
};

// Get settings for a specific role
export const getRoleUISettings = (role: UserRole): ExtendedUISettings | null => {
    const config = getUIBuilderConfig();
    if (!config) return null;
    return config.settings.find(s => s.role === role) || null;
};

// Generate unique ID for elements
export const generateElementId = (): string => {
    return `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate unique ID for custom modules
export const generateModuleId = (): string => {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
