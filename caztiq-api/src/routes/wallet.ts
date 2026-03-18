import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/wallet — get wallet balance for authenticated user
router.get('/', authenticate, async (req, res) => {
    const user = (req as any).user;

    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST /api/wallet/deposit — add funds to wallet
router.post('/deposit', authenticate, async (req, res) => {
    const user = (req as any).user;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const { data, error } = await supabase.rpc('deposit_to_wallet', {
        p_user_id: user.id,
        p_amount: amount,
    });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
});

export default router;
