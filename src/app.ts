import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import apiRoutes from './routes';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Server is healthy' });
});

app.use('/api', apiRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
