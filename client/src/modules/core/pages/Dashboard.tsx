import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import IdentityDashboard from './IdentityDashboard';

const Dashboard = () => {
    // INTEGRATION PHASE: All roles use the Identity Command Center
    // Features are hidden behind Labs or disabled
    return <IdentityDashboard />;
};

export default Dashboard;
