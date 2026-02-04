import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, Role } from '@/modules/core/contexts/AuthContext';

const DPAGuard = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Roles that MUST sign DPA (Data Processing Agreement)
    // These are roles that act as Data Controllers or Processors of SENSITIVE data.
    const requiredRoles: Role[] = ['CLUB', 'EO', 'PERPANI', 'JUDGE', 'MANPOWER', 'SUPER_ADMIN'];

    // If not logged in, let AuthGuard handle it (or just pass through)
    if (!user) return <Outlet />;

    // Check if the current user's role requires DPA
    // We check activeRole if available, otherwise role
    const currentRole = user.activeRole || user.role;

    if (requiredRoles.includes(currentRole)) {
        // Check if DPA is signed in LocalStorage
        // Key format: SIP_DPA_AGREED_{USER_ID}
        const storageKey = `SIP_DPA_AGREED_${user.id}`;
        const isAgreed = localStorage.getItem(storageKey);

        if (!isAgreed) {
            // CRITICAL: We must allow access to the agreement page itself to avoid infinite redirect loops
            if (location.pathname === '/legal/agreement') {
                return <Outlet />;
            }

            // Redirect to agreement page, saving the intended destination
            console.log(`[DPAGuard] User ${user.name} (${currentRole}) has not signed DPA. Redirecting...`);
            return <Navigate to={`/legal/agreement?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
        }
    }

    return <Outlet />;
};

export default DPAGuard;
