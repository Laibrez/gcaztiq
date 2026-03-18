import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/campaigns — list all campaigns for the authenticated brand
router.get('/', authenticate, async (req, res) => {
    const user = (req as any).user;

    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST /api/campaigns — create a new campaign
router.post('/', authenticate, async (req, res) => {
    const user = (req as any).user;
    const { name, budget, start_date, end_date, description } = req.body;

    if (!name || !budget) {
        return res.status(400).json({ error: 'name and budget are required' });
    }

    const { data, error } = await supabase
        .from('campaigns')
        .insert({ brand_id: user.id, name, budget, start_date, end_date, description })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// PATCH /api/campaigns/:id — update a campaign
router.patch('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE /api/campaigns/:id — delete a campaign
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

export default router;
