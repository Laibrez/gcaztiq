import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import creatorsRoutes from './routes/creators';
import campaignsRoutes from './routes/campaigns';
import payoutsRoutes from './routes/payouts';
import claimRoutes from './routes/claim';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/creators', creatorsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/claim', claimRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`caztiq-api running on http://localhost:${PORT}`);
});

export default app;
