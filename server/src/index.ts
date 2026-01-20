import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
// CommonJS __dirname already available
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import schoolRoutes from './routes/school.routes.js';
import moduleRoutes from './routes/module.routes.js';
import roleModuleRoutes from './routes/roleModule.routes.js';
import configRoutes from './routes/config.routes.js';
import locationRoutes from './routes/location.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import jerseyRoutes from './routes/jersey.routes.js';
import customModuleRoutes from './routes/custom-module.routes.js';
import factoryRoutes from './routes/factory.routes.js';
import clubRoutes from './routes/club.routes.js';
import { documentRoutes } from './routes/document.routes.js';
import courierRoutes from './routes/courier.routes.js';
import manpowerRoutes from './routes/manpower.routes.js';
import eventRoutes from './routes/event.routes.js';
import eoRoutes from './routes/eo.routes.js';
import publicRoutes from './routes/public.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import coachRoutes from './routes/coach.routes.js';
import perpaniRoutes from './routes/perpani.routes.js';
import judgeRoutes from './routes/judge.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import roleRequestRoutes from './routes/role-request.routes.js';
import troubleshootRoutes from './routes/troubleshoot.routes.js';

// __dirname is available in CommonJS

const app = express();
// Trust the Load Balancer (Render) to correctly report HTTPS protocol
app.set('trust proxy', 1);
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://app.corelink.id',
            process.env.CORS_ORIGIN || '',
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Increased limit for development stability
    standardHeaders: 'draft-7',
    legacyHeaders: false, // Disable X-RateLimit-* headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// CORS configuration - allow production and development origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://app.corelink.id',
    'https://sip-api-6lo6-ovt779mii-corelinks-projects.vercel.app',
    process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow anyway for now, log for debugging
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads - use server root relative path
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('[Server] Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// API Routes
const API_PREFIX = '/api/v1';
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
app.use(`${API_PREFIX}/schools`, schoolRoutes);
app.use(`${API_PREFIX}/modules`, moduleRoutes);
app.use(`${API_PREFIX}/system-modules`, moduleRoutes); // Alias for frontend compatibility
app.use(`${API_PREFIX}/role-modules`, roleModuleRoutes);
app.use(`${API_PREFIX}/config`, configRoutes);
app.use(`${API_PREFIX}/locations`, locationRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);
app.use(`${API_PREFIX}/jersey`, jerseyRoutes);
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/eo`, eoRoutes);
app.use(`${API_PREFIX}/custom-modules`, customModuleRoutes);
app.use(`${API_PREFIX}/factory`, factoryRoutes);
app.use(`${API_PREFIX}/clubs`, clubRoutes);
app.use(`${API_PREFIX}/documents`, documentRoutes);
app.use(`${API_PREFIX}/shipping`, courierRoutes);
app.use(`${API_PREFIX}/manpower`, manpowerRoutes);
app.use(`${API_PREFIX}/public`, publicRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/coaches`, coachRoutes);
app.use(`${API_PREFIX}/perpani`, perpaniRoutes);
app.use(`${API_PREFIX}/judge`, judgeRoutes);
app.use(`${API_PREFIX}/certificates`, certificateRoutes);
app.use(`${API_PREFIX}/role-requests`, roleRequestRoutes);
app.use(`${API_PREFIX}/troubleshoot`, troubleshootRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room for real-time score updates
    socket.on('join-session', (sessionId: string) => {
        socket.join(`session-${sessionId}`);
        console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on('leave-session', (sessionId: string) => {
        socket.leave(`session-${sessionId}`);
    });

    // Broadcast score update to session room
    socket.on('score-update', (data: { sessionId: string; score: any }) => {
        io.to(`session-${data.sessionId}`).emit('score-updated', data.score);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Start server
// Force reload trigger 2
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log('');
    console.log('============================');
    console.log('  SIP Server Started');
    console.log(' ============================');
    console.log(`  📅 Started: ${new Date().toISOString()}`);
    console.log(`  🚀 Port: ${PORT}`);
    console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  📡 WebSocket: Enabled`);
    console.log('============================');
    console.log('');
});

export { io, prisma };

// Global Error Handlers
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    // Keep the process alive in dev mode for easier debugging, or let tsx restart it
});

process.on('unhandledRejection', (reason: any) => {
    console.error('UNHANDLED REJECTION! 💥');
    console.error(reason);
});
