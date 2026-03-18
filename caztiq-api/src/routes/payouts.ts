import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/payouts — list all payouts for the authenticated brand
router.get('/', authenticate, async (req, res) => {
    const user = (req as any).user;

    const { data, error } = await supabase
        .from('payouts')
        .select('*, creators(name, email)')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST /api/payouts — create a payout for a creator
router.post('/', authenticate, async (req, res) => {
    const user = (req as any).user;
    const { creator_id, amount, campaign_id, note } = req.body;

    if (!creator_id || !amount) {
        return res.status(400).json({ error: 'creator_id and amount are required' });
    }

    const { data, error } = await supabase
        .from('payouts')
        .insert({ brand_id: user.id, creator_id, amount, campaign_id, note, status: 'pending' })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

export default router;
