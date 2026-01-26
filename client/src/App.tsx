import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './modules/core/contexts/AuthContext';
import { PermissionsProvider } from './modules/core/contexts/PermissionsContext';
import { CartProvider } from './modules/core/contexts/CartContext';
import { BackgroundEffectProvider } from './modules/core/contexts/BackgroundEffectContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Core UI
import BackgroundCanvas from './modules/core/components/ui/BackgroundCanvas';
import DashboardLayout from './modules/core/components/layout/DashboardLayout';
import LoadingScreen from './modules/core/components/ui/LoadingScreen';
import PWALoadingScreen from './modules/core/components/ui/PWALoadingScreen';

// Core Pages
import LoginPage from './modules/core/pages/LoginPage';
import Dashboard from './modules/core/pages/Dashboard';
import OnboardingPage from './modules/core/pages/OnboardingPage';
import ProfilePage from './modules/core/pages/ProfilePage';
import MarketplacePage from './modules/core/pages/MarketplacePage';

// Athlete Pages
import ScoringPage from './modules/athlete/pages/ScoringPage';
import ProgressChartsPage from './modules/athlete/pages/ProgressChartsPage';
import AchievementsPage from './modules/athlete/pages/AchievementsPage';
import HistoryPage from './modules/athlete/pages/HistoryPage';
import BleepTestPage from './modules/athlete/pages/BleepTestPage';
import ArcherConfigPage from './modules/athlete/pages/ArcherConfigPage';

// Club Pages
import ClubDashboard from './modules/club/pages/ClubDashboard';
import ClubMembersPage from './modules/club/pages/ClubMembersPage';
import ClubApprovalPage from './modules/club/pages/ClubApprovalPage';
import AthletesPage from './modules/club/pages/AthletesPage';
import ClubOrganizationPage from './modules/club/pages/ClubOrganizationPage';
import ClubPermissionsPage from './modules/club/pages/ClubPermissionsPage';
import OrganizationPage from './modules/club/pages/OrganizationPage';
import SchoolsPage from './modules/club/pages/SchoolsPage';
import ManpowerPage from './modules/club/pages/ManpowerPage';
import ReportsPage from './modules/club/pages/ReportsPage';
import EnhancedReportsPage from './modules/club/pages/EnhancedReportsPage';
import AthleteDetailPage from './modules/club/pages/AthleteDetailPage';
import CoachAnalyticsPage from './modules/club/pages/CoachAnalyticsPage';
import RepairApprovalPage from './modules/club/pages/RepairApprovalPage';
import ArcheryGuidancePage from './modules/club/pages/ArcheryGuidancePage';
import DigitalCardPage from './modules/club/pages/DigitalCardPage';
import NotificationsPage from './modules/club/pages/NotificationsPage';
import FileManagerPage from './modules/club/pages/FileManagerPage';

// Club Features - Finance
import FinancePage from './modules/club/features/finance/pages/FinancePage';
import InvoicingPage from './modules/club/features/finance/pages/InvoicingPage';
import PaymentUploadPage from './modules/club/features/finance/pages/PaymentUploadPage';

// Club Features - Inventory
import InventoryPage from './modules/club/features/inventory/pages/InventoryPage';
import SupplierOrdersPage from './modules/club/features/inventory/pages/SupplierOrdersPage';
import OrderTrackingPage from './modules/club/features/inventory/pages/OrderTrackingPage';
import SupplierProductsPage from './modules/club/features/inventory/pages/SupplierProductsPage';
import ShippingPage from './modules/club/features/inventory/pages/ShippingPage';

import EventRoutes from './modules/event/routes';

// Admin Pages
import SuperAdminPage from './modules/admin/pages/SuperAdminPage';
import AuditLogsPage from './modules/admin/pages/AuditLogsPage';
import RoleRequestsAdminPage from './modules/admin/pages/RoleRequestsAdminPage';
import AddRolePage from './modules/admin/pages/AddRolePage';
import ModuleBuilderPage from './modules/admin/pages/ModuleBuilderPage';
import ModuleListPage from './modules/admin/pages/ModuleListPage';
import PerpaniManagementPage from './modules/admin/pages/PerpaniManagementPage';
import SettingsPage from './modules/admin/pages/SettingsPage';
import ProfileVerificationPage from './modules/admin/pages/ProfileVerificationPage';

function App() {
    const { user, isLoading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Initial PWA Loading Screen (handles both "fake" delay and actual auth loading)
    if (showSplash || isLoading) {
        return (
            <PWALoadingScreen
                isLoading={isLoading}
                onComplete={() => setShowSplash(false)}
            />
        );
    }

    return (
        <PermissionsProvider>
            <CartProvider>
                <BackgroundEffectProvider>
                    <div className="min-h-screen bg-slate-950 text-slate-200 relative">
                        <div className="fixed inset-0 z-0 pointer-events-none">
                            <BackgroundCanvas />
                        </div>
                        <div className="relative z-10">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={!user ? <OnboardingPage /> : <Navigate to="/dashboard" replace />} />
                                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />

                                {/* Protected Routes */}
                                <Route element={<DashboardLayout />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/marketplace" element={<MarketplacePage />} />

                                    {/* Domain Routes - TEMPORARILY DISABLED FOR MIGRATION */}
                                    {/* 
                                <Route path="/club-dashboard" element={<ClubDashboard />} />
                                <Route path="/athletes" element={<AthletesPage />} />
                                */}

                                    {/* ATHLETE ROUTES */}
                                    <Route path="/scoring" element={<ScoringPage />} />
                                    <Route path="/analytics" element={<ProgressChartsPage />} />
                                    <Route path="/achievements" element={<AchievementsPage />} />
                                    <Route path="/history" element={<HistoryPage />} />
                                    <Route path="/training/bleep-test" element={<BleepTestPage />} />
                                    <Route path="/settings/archer" element={<ArcherConfigPage />} />


                                    {/* CLUB ROUTES */}
                                    <Route path="/club-dashboard" element={<ClubDashboard />} />
                                    <Route path="/club/members" element={<ClubMembersPage />} />
                                    <Route path="/club/approvals" element={<ClubApprovalPage />} />
                                    <Route path="/athletes" element={<AthletesPage />} />
                                    <Route path="/club/organization" element={<ClubOrganizationPage />} />
                                    <Route path="/club/permissions" element={<ClubPermissionsPage />} />
                                    <Route path="/club/structure" element={<OrganizationPage />} />
                                    <Route path="/schools" element={<SchoolsPage />} />
                                    <Route path="/manpower" element={<ManpowerPage />} />
                                    <Route path="/reports" element={<ReportsPage />} />
                                    <Route path="/reports/enhanced" element={<EnhancedReportsPage />} />
                                    <Route path="/athlete/:id" element={<AthleteDetailPage />} />
                                    <Route path="/coach/analytics" element={<CoachAnalyticsPage />} />
                                    <Route path="/repairs/approvals" element={<RepairApprovalPage />} />
                                    <Route path="/archery-guidance" element={<ArcheryGuidancePage />} />
                                    <Route path="/digital-card" element={<DigitalCardPage />} />
                                    <Route path="/notifications" element={<NotificationsPage />} />
                                    <Route path="/files" element={<FileManagerPage />} />

                                    {/* CLUB FINANCE */}
                                    <Route path="/finance" element={<FinancePage />} />
                                    <Route path="/finance/invoicing" element={<InvoicingPage />} />
                                    <Route path="/payments" element={<PaymentUploadPage />} />

                                    {/* CLUB INVENTORY */}
                                    <Route path="/inventory" element={<InventoryPage />} />
                                    <Route path="/inventory/supplier-orders" element={<SupplierOrdersPage />} />
                                    <Route path="/inventory/tracking" element={<OrderTrackingPage />} />
                                    <Route path="/inventory/supplier-products" element={<SupplierProductsPage />} />
                                    <Route path="/shipping" element={<ShippingPage />} />

                                    {/* EVENT ROUTES */}
                                    <Route path="/events/*" element={<EventRoutes />} />

                                    {/* ADMIN ROUTES */}
                                    <Route path="/admin" element={<SuperAdminPage />} />
                                    <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                                    <Route path="/admin/role-requests" element={<RoleRequestsAdminPage />} />
                                    <Route path="/admin/add-role" element={<AddRolePage />} />
                                    <Route path="/admin/module-builder" element={<ModuleBuilderPage />} />
                                    <Route path="/admin/modules" element={<ModuleListPage />} />
                                    <Route path="/admin/perpani" element={<PerpaniManagementPage />} />
                                    <Route path="/admin/profile-verification" element={<ProfileVerificationPage />} />

                                    {/* Removed admin onboarding path */}
                                    <Route path="/admin/onboarding" element={<Navigate to="/" replace />} />

                                    <Route path="*" element={<div className="p-8">Page under migration</div>} />
                                </Route>

                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                        <ToastContainer theme="dark" position="bottom-right" autoClose={3000} hideProgressBar={false} />
                    </div>
                </BackgroundEffectProvider>
            </CartProvider>
        </PermissionsProvider>
    );
}

export default App;
