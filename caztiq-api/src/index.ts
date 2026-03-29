import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
} else {
    dotenv.config(); // Fallback to current directory or environment variables (Production)
}

const app = express();
app.use(helmet());
// Allow all origins to prevent issues with Vercel preview links or trailing slashes
app.use(cors());

import { stripeWebhook } from './routes/wallet';
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

import authRouter from './routes/auth';
import walletRouter from './routes/wallet';
import creatorsRouter from './routes/creators';
import campaignsRouter from './routes/campaigns';
import payoutsRouter from './routes/payouts';
import claimRouter from './routes/claim';

app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/claim', claimRouter); // public — no auth

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT || 3001, () => {
    console.log('Caztiq API running on port', process.env.PORT || 3001);
});

export default app;
