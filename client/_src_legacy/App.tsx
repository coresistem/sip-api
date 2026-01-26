import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { CartProvider } from './context/CartContext';
import { BackgroundEffectProvider } from './context/BackgroundEffectContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackgroundCanvas from './components/onboarding/BackgroundCanvas';

// Pages
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfileVerificationPage from './pages/ProfileVerificationPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ClubDashboard from './pages/ClubDashboard';
import ClubMembersPage from './pages/ClubMembersPage';
import ClubUnitsPage from './pages/ClubUnitsPage';
import ClubMemberDetail from './pages/ClubMemberDetail';
import ClubOrganizationPage from './pages/ClubOrganizationPage';
import AthletesPage from './pages/AthletesPage';
import ScoringPage from './pages/ScoringPage';
import SchedulesPage from './pages/SchedulesPage';
import AttendancePage from './pages/AttendancePage';
import FinancePage from './pages/FinancePage';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import SuperAdminPage from './pages/SuperAdminPage';
import DigitalCardPage from './pages/DigitalCardPage';
import ArcherConfigPage from './pages/ArcherConfigPage';
import OrganizationPage from './pages/OrganizationPage';
import ManpowerPage from './pages/ManpowerPage';
import FileManagerPage from './pages/FileManagerPage';
import ModuleListPage from './pages/ModuleListPage';
import ModuleBuilderPage from './pages/ModuleBuilderPage';
import AssessmentFormPage from './pages/AssessmentFormPage';
import AssessmentReportPage from './pages/AssessmentReportPage';
import SupplierProductsPage from './pages/SupplierProductsPage';
import JerseyCatalogPage from './pages/JerseyCatalogPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import SupplierOrdersPage from './pages/SupplierOrdersPage';
import BleepTestPage from './pages/BleepTestPage';
import QCStationPage from './pages/QCStationPage';
import RepairApprovalPage from './pages/RepairApprovalPage';
import ArcheryGuidancePage from './pages/ArcheryGuidancePage';
import PerpaniManagementPage from './pages/PerpaniManagementPage';
import SchoolsPage from './pages/SchoolsPage';
import QualityControlPage from './pages/QualityControlPage';
import NotificationsPage from './pages/NotificationsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import HistoryPage from './pages/HistoryPage';
import ShippingPage from './pages/ShippingPage';
import AchievementsPage from './pages/AchievementsPage';
import ProgressChartsPage from './pages/ProgressChartsPage';
import AthleteDetailPage from './pages/AthleteDetailPage';
import CoachAnalyticsPage from './pages/CoachAnalyticsPage';
import ChildDetailPage from './pages/ChildDetailPage';
import InvoicingPage from './pages/InvoicingPage';
import PaymentUploadPage from './pages/PaymentUploadPage';
import O2SNRegistrationPage from './pages/O2SNRegistrationPage';
import ClubApprovalPage from './pages/ClubApprovalPage';
import LicensingPage from './pages/LicensingPage';
import EventCreationPage from './pages/EventCreationPage';
import EnhancedReportsPage from './pages/EnhancedReportsPage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import EventRegistrationPage from './pages/EventRegistrationPage';
import EventResultsPage from './pages/EventResultsPage';
import ScoreValidationPage from './pages/ScoreValidationPage';
import EODashboard from './components/dashboard/EODashboard';
import EventManagementPage from './pages/EventManagementPage';
import CoachVerificationPage from './pages/CoachVerificationPage';
import AddRolePage from './pages/AddRolePage';
import RoleRequestsAdminPage from './pages/RoleRequestsAdminPage';
import ClubPermissionsPage from './pages/ClubPermissionsPage';
import SettingsPage from './pages/SettingsPage';
import EventDetailsPage from './pages/EventDetailsPage';

import JerseyDashboard from './features/jersey/pages/admin/Dashboard';
import ProductList from './features/jersey/pages/admin/product/ProductList';
import ProductEditor from './features/jersey/pages/admin/product/ProductEditor';
import OrderManager from './features/jersey/pages/admin/order/OrderManager';
import ProductionTimeline from './features/jersey/pages/admin/order/ProductionTimeline';
import FinanceJournal from './features/jersey/pages/admin/finance/FinanceJournal';
import StaffList from './features/jersey/pages/admin/manpower/StaffList';
import CustomerList from './features/jersey/pages/admin/CustomerList';
import CustomerDetail from './features/jersey/pages/admin/CustomerDetail';
import TaskStation from './features/jersey/pages/manpower/TaskStation';
import CatalogPage from './features/jersey/pages/public/CatalogPage';
import LoadingScreen from './components/ui/LoadingScreen';
import PWALoadingScreen from './components/ui/PWALoadingScreen';

// Supplier Module
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import MyShopPage from './pages/supplier/MyShopPage';

function App() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <PWALoadingScreen />;
    }

    return (
        <PermissionsProvider>
            <CartProvider>
                <BackgroundEffectProvider>
                    <div className="min-h-screen bg-slate-950 text-slate-200">
                        <BackgroundCanvas />
                        <Routes>
                            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />

                            <Route element={<DashboardLayout />}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/settings" element={<SettingsPage />} />

                                {/* Supplier Routes */}
                                <Route path="/supplier" element={<SupplierDashboard />} />
                                <Route path="/supplier/myshop" element={<MyShopPage />} />

                                {/* ... other routes ... */}
                                <Route path="/club-dashboard" element={<ClubDashboard />} />
                                <Route path="/athletes" element={<AthletesPage />} />
                                <Route path="/scoring" element={<ScoringPage />} />

                                {/* Marketplace & Jersey Routes */}
                                <Route path="/marketplace" element={<CatalogPage />} />
                                <Route path="/jersey/catalog" element={<JerseyCatalogPage />} />

                                {/* Supplier Admin Routes */}
                                <Route path="/jersey/admin" element={<JerseyDashboard />} />
                                <Route path="/jersey/admin/products" element={<ProductList />} />
                                <Route path="/jersey/admin/orders" element={<OrderManager />} />
                                <Route path="/jersey/admin/production" element={<ProductionTimeline />} />
                                <Route path="/jersey/admin/finance" element={<FinanceJournal />} />
                                <Route path="/jersey/admin/manpower" element={<StaffList />} />
                                <Route path="/jersey/admin/customers" element={<CustomerList />} />
                                <Route path="/jersey/admin/customers/:id" element={<CustomerDetail />} />

                                {/* Manpower Task Routes */}
                                <Route path="/staff/station" element={<TaskStation />} />

                                <Route path="/super-admin" element={<SuperAdminPage />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <ToastContainer />
                    </div>
                </BackgroundEffectProvider>
            </CartProvider>
        </PermissionsProvider>
    );
}

export default App;
