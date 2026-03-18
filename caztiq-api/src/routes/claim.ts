import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// POST /api/claim — creator claims their payout using a token
// This route is PUBLIC (no auth middleware) — accessed via creator claim link
router.post('/', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Claim token is required' });
    }

    // Look up the claim token
    const { data: claim, error } = await supabase
        .from('claim_tokens')
        .select('*, payouts(*)')
        .eq('token', token)
        .eq('used', false)
        .single();

    if (error || !claim) {
        return res.status(404).json({ error: 'Invalid or expired claim token' });
    }

    // Mark token as used and payout as claimed
    await supabase.from('claim_tokens').update({ used: true }).eq('id', claim.id);
    await supabase.from('payouts').update({ status: 'claimed' }).eq('id', claim.payout_id);

    res.json({ success: true, payout: claim.payouts });
});

export default router;
