import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AthleteDashboard from '../../athlete/components/dashboard/AthleteDashboard';
import ClubDashboard from '../../club/components/dashboard/ClubDashboard';
import CoachAnalyticsPage from '../../club/pages/CoachAnalyticsPage';

const Dashboard = () => {
    const { user } = useAuth();
    const role = user?.role;

    if (role === 'ATHLETE') {
        return <AthleteDashboard />;
    }

    if (role === 'CLUB') {
        return <ClubDashboard />;
    }

    if (role === 'COACH') {
        return <CoachAnalyticsPage />;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-dark-400">Welcome, {user?.name}. Current Role: {role}</p>
            <p className="mt-4 text-sm text-yellow-500">Only ATHLETE dashboard is currently migrated.</p>
        </div>
    );
};

export default Dashboard;
