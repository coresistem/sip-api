import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackgroundCanvas from './components/onboarding/BackgroundCanvas';
import { BackgroundEffectProvider } from './context/BackgroundEffectContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfileVerificationPage from './pages/ProfileVerificationPage';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
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
import MemberApprovalPage from './pages/MemberApprovalPage';
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
import OrgModuleConfigPage from './pages/organization/OrgModuleConfigPage';

// Loading spinner component
function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-dark-400">Loading...</p>
            </div>
        </div>
    );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
}

// Admin route wrapper (Super Admin only)
function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    if (user?.role !== 'SUPER_ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

// Main App component
export default function App() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <PermissionsProvider>
            <BackgroundEffectProvider>
                {/* Global Background */}
                <div className="fixed inset-0 z-[-1] bg-dark-950">
                    <div className="absolute inset-0 opacity-40">
                        <BackgroundCanvas />
                    </div>
                </div>

                <ToastContainer theme="dark" position="top-right" />
                <Routes>
                    {/* Public routes - Onboarding is the landing page */}
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/verify/:sipId" element={<ProfileVerificationPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="athletes" element={<AthletesPage />} />
                        <Route path="athletes/:athleteId" element={<AthleteDetailPage />} />
                        <Route path="scoring" element={<ScoringPage />} />
                        <Route path="schedules" element={<SchedulesPage />} />
                        <Route path="attendance" element={<AttendancePage />} />
                        <Route path="finance" element={<FinancePage />} />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="digitalcard" element={<DigitalCardPage />} />
                        <Route path="archerconfig" element={<ArcherConfigPage />} />
                        <Route path="organization" element={<OrganizationPage />} />
                        <Route path="organization/modules" element={<ProtectedRoute><OrgModuleConfigPage /></ProtectedRoute>} />
                        <Route path="manpower" element={<ManpowerPage />} />
                        <Route path="filemanager" element={<FileManagerPage />} />
                        <Route path="admin" element={<AdminRoute><SuperAdminPage /></AdminRoute>} />
                        <Route path="admin/modules" element={<AdminRoute><ModuleListPage /></AdminRoute>} />
                        <Route path="admin/modules/new" element={<AdminRoute><ModuleBuilderPage /></AdminRoute>} />
                        <Route path="admin/modules/:moduleId/edit" element={<AdminRoute><ModuleBuilderPage /></AdminRoute>} />
                        <Route path="assessment/:moduleId" element={<AssessmentFormPage />} />
                        <Route path="assessment/report/:recordId" element={<AssessmentReportPage />} />
                        <Route path="training/bleep-test" element={<BleepTestPage />} />
                        <Route path="training/schedule" element={<SchedulesPage />} />
                        <Route path="guidance" element={<ArcheryGuidancePage />} />

                        {/* SIP Jersey Module */}
                        <Route path="jersey/admin" element={<JerseyDashboard />} />
                        <Route path="jersey/admin/products" element={<ProductList />} />
                        <Route path="jersey/admin/products/edit" element={<ProductEditor />} />
                        <Route path="jersey/admin/products/edit/:id" element={<ProductEditor />} />
                        <Route path="jersey/admin/orders" element={<OrderManager />} />
                        <Route path="jersey/admin/orders/:id" element={<OrderTrackingPage />} />
                        <Route path="jersey/admin/customers" element={<CustomerList />} />
                        <Route path="jersey/admin/customers/:id" element={<CustomerDetail />} />
                        <Route path="jersey/admin/production" element={<ProductionTimeline />} />
                        <Route path="jersey/admin/finance" element={<FinanceJournal />} />
                        <Route path="jersey/admin/manpower" element={<StaffList />} />
                        <Route path="jersey/manpower/station" element={<TaskStation />} />
                        <Route path="jersey/catalog" element={<CatalogPage />} />

                        {/* Legacy Supplier Routes - Keep for now or deprecate? */}
                        <Route path="supplier/products" element={<SupplierProductsPage />} />
                        <Route path="supplier/orders" element={<SupplierOrdersPage />} />
                        <Route path="supplier/repairs" element={<RepairApprovalPage />} />
                        <Route path="jersey-catalog" element={<JerseyCatalogPage />} />
                        <Route path="my-orders" element={<OrderTrackingPage />} />

                        {/* QC Station */}
                        <Route path="qc/station" element={<QCStationPage />} />

                        {/* New Database Management Pages */}
                        <Route path="perpani" element={<PerpaniManagementPage />} />
                        <Route path="perpani/coach-verification" element={<CoachVerificationPage />} />
                        <Route path="schools" element={<SchoolsPage />} />

                        <Route path="quality-control" element={<QualityControlPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="audit-logs" element={<AuditLogsPage />} />
                        <Route path="history" element={<HistoryPage />} />
                        <Route path="shipping" element={<ShippingPage />} />
                        <Route path="achievements" element={<AchievementsPage />} />
                        <Route path="progress" element={<ProgressChartsPage />} />
                        <Route path="coach-analytics" element={<CoachAnalyticsPage />} />
                        <Route path="member-approval" element={<MemberApprovalPage />} />
                        <Route path="children/:childId" element={<ChildDetailPage />} />
                        <Route path="invoicing" element={<InvoicingPage />} />
                        <Route path="payments" element={<PaymentUploadPage />} />
                        <Route path="o2sn-registration" element={<O2SNRegistrationPage />} />
                        <Route path="club-approval" element={<ClubApprovalPage />} />
                        <Route path="licensing" element={<LicensingPage />} />
                        <Route path="events/new" element={<EventManagementPage />} />
                        <Route path="events/:id/manage" element={<EventManagementPage />} />
                        <Route path="event-create" element={<Navigate to="/events/new" replace />} />
                        <Route path="enhanced-reports" element={<EnhancedReportsPage />} />
                        <Route path="attendance-history" element={<AttendanceHistoryPage />} />
                        <Route path="event-registration" element={<EventRegistrationPage />} />
                        <Route path="event-results" element={<EventResultsPage />} />
                        <Route path="events/:id/results" element={<EventResultsPage />} />
                        <Route path="score-validation" element={<ScoreValidationPage />} />
                        <Route path="events/:id" element={<EventDetailsPage />} />
                        <Route path="events" element={<EODashboard />} />
                    </Route>

                    {/* Catch all - redirect to onboarding */}
                    <Route path="*" element={<Navigate to="/onboarding" replace />} />
                </Routes>
            </BackgroundEffectProvider>
        </PermissionsProvider>
    );
}
