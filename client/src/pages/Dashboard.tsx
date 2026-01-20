import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Settings } from 'lucide-react';

// Role-specific dashboards
import AthleteDashboard from '../components/dashboard/AthleteDashboard';
import CoachDashboard from '../components/dashboard/CoachDashboard';
import ClubDashboard from '../components/dashboard/ClubDashboard';
import ParentDashboard from '../components/dashboard/ParentDashboard';
import SchoolDashboard from '../components/dashboard/SchoolDashboard';
import PerpaniDashboard from '../components/dashboard/PerpaniDashboard';
import EODashboard from '../components/dashboard/EODashboard';
import JudgeDashboard from '../components/dashboard/JudgeDashboard';
import JerseyDashboard from '../features/jersey/pages/admin/Dashboard';
import TaskStation from '../features/jersey/pages/manpower/TaskStation';
import SuperAdminPage from './SuperAdminPage';

export default function Dashboard() {
    const { user, simulatedRole } = useAuth();

    // Use simulated role if active, otherwise use real role
    const activeRole = simulatedRole || user?.role;

    // Render role-specific dashboard
    const renderDashboard = () => {
        switch (activeRole) {
            case 'ATHLETE':
                return <AthleteDashboard />;
            case 'COACH':
                return <CoachDashboard />;
            case 'CLUB':
            case 'CLUB_OWNER':
                return <ClubDashboard />;
            case 'PARENT':
                return <ParentDashboard />;
            case 'SCHOOL':
                return <SchoolDashboard />;
            case 'PERPANI':
                return <PerpaniDashboard />;
            case 'EO':
                return <EODashboard />;
            case 'JUDGE':
                return <JudgeDashboard />;
            case 'SUPER_ADMIN':
                // Super Admin uses SuperAdminPage with Events tab
                return <SuperAdminPage />;
            case 'SUPPLIER':
                return <JerseyDashboard />;
            case 'MANPOWER':
                return <TaskStation />;
            default:
                return (
                    <div className="card p-12 text-center border-dashed border-dark-600 bg-dark-800/50">
                        <Settings className="w-16 h-16 mx-auto mb-6 text-dark-600" />
                        <h3 className="text-xl font-medium text-white mb-2">Dashboard Coming Soon</h3>
                        <p className="text-dark-400 max-w-md mx-auto">
                            The dashboard for {String(activeRole).replace('_', ' ')} is under development.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-lg md:text-3xl font-display font-bold">
                        Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        {activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1).toLowerCase().replace('_', ' ') : 'User'} Dashboard
                    </p>
                </div>
            </motion.div>

            {/* Role-specific content */}
            {renderDashboard()}
        </div>
    );
}
