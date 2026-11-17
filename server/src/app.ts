import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import internshipsRoutes from './routes/internships.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import studentsRoutes from './routes/students.routes.js';
import recruitersRoutes from './routes/recruiters.routes.js';
import interviewsRoutes from './routes/interviews.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

export const app = express();

// Security & Parsing Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'InternBridge MERN API v1', timestamp: new Date().toISOString() });
});

// Mount /api/v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/internships', internshipsRoutes);
app.use('/api/v1/applications', applicationsRoutes);
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/recruiters', recruitersRoutes);
app.use('/api/v1/interviews', interviewsRoutes);
app.use('/api/v1/agents', agentsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// Aliases for /api/* without /v1 prefix for backwards compatibility
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/recruiters', recruitersRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
