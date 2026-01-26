import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import helmet from 'helmet';
import prisma from './lib/prisma.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import athleteRoutes from './routes/athlete.routes.js';
import scoreRoutes from './routes/score.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import financeRoutes from './routes/finance.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import reportRoutes from './routes/report.routes.js';
import profileRoutes from './routes/profile.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import jerseyRoutes from './routes/jersey.routes.js';
import marketplaceCategoryRoutes from './routes/marketplace-category.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import { documentRoutes } from './routes/document.routes.js';
import clubRoutes from './routes/club.routes.js';
import categoryRoutes from './routes/category.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import clubMemberRoutes from './routes/club-member.routes.js';
import clubOrganizationRoutes from './routes/club-organization.routes.js';
import clubUnitRoutes from './routes/club-unit.routes.js';
import coachRoutes from './routes/coach.routes.js';
import courierRoutes from './routes/courier.routes.js';
import customModuleRoutes from './routes/custom-module.routes.js';
import eoRoutes from './routes/eo.routes.js';
import eventRoutes from './routes/event.routes.js';
import judgeRoutes from './routes/judge.routes.js';
import locationRoutes from './routes/location.routes.js';
import manpowerRoutes from './routes/manpower.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import perpaniRoutes from './routes/perpani.routes.js';
import publicRoutes from './routes/public.routes.js';
import roleRequestRoutes from './routes/role-request.routes.js';
import schoolRoutes from './routes/school.routes.js';
import sidebarRoutes from './routes/sidebar.routes.js';
import troubleshootRoutes from './routes/troubleshoot.routes.js';
import gitRoutes from './routes/git.routes.js';

const app = express();
const httpServer = createServer(app);

// CORS configuration - allowing credentials and specific origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const API_PREFIX = '/api/v1';

// Register all routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/athletes`, athleteRoutes);
app.use(`${API_PREFIX}/scores`, scoreRoutes);
app.use(`${API_PREFIX}/schedules`, scheduleRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/finance`, financeRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/profile`, profileRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/uploads`, uploadRoutes);
app.use(`${API_PREFIX}/jersey`, jerseyRoutes);
app.use(`${API_PREFIX}/marketplace/categories`, marketplaceCategoryRoutes);
app.use(`${API_PREFIX}/marketplace`, marketplaceRoutes);
app.use(`${API_PREFIX}/documents`, documentRoutes);
app.use(`${API_PREFIX}/clubs`, clubRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/certificates`, certificateRoutes);
app.use(`${API_PREFIX}/club-members`, clubMemberRoutes);
app.use(`${API_PREFIX}/club-organizations`, clubOrganizationRoutes);
app.use(`${API_PREFIX}/club-units`, clubUnitRoutes);
app.use(`${API_PREFIX}/coaches`, coachRoutes);
app.use(`${API_PREFIX}/couriers`, courierRoutes);
app.use(`${API_PREFIX}/modules`, customModuleRoutes);
app.use(`${API_PREFIX}/eo`, eoRoutes);
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/judges`, judgeRoutes);
app.use(`${API_PREFIX}/locations`, locationRoutes);
app.use(`${API_PREFIX}/manpower`, manpowerRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/perpani`, perpaniRoutes);
app.use(`${API_PREFIX}/public`, publicRoutes);
app.use(`${API_PREFIX}/role-requests`, roleRequestRoutes);
app.use(`${API_PREFIX}/schools`, schoolRoutes);
app.use(`${API_PREFIX}/permissions/sidebar`, sidebarRoutes);
app.use(`${API_PREFIX}/troubleshoot`, troubleshootRoutes);
app.use(`${API_PREFIX}/git`, gitRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
