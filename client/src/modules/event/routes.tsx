
import { Routes, Route } from 'react-router-dom';
import EventDashboardPage from './pages/EventDashboardPage';
import EventCreationPage from './pages/EventCreationPage';
import EventManagementPage from './pages/EventManagementPage';
import EventDetailsPage from './pages/EventDetailsPage';

export default function EventRoutes() {
    return (
        <Routes>
            <Route index element={<EventDashboardPage />} />
            <Route path="new" element={<EventManagementPage />} />
            <Route path=":id/manage" element={<EventManagementPage />} />
            <Route path=":id" element={<EventDetailsPage />} />
        </Routes>
    );
}
