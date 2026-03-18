import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/creators — list all creators for the authenticated brand
router.get('/', authenticate, async (req, res) => {
    const user = (req as any).user;

    const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST /api/creators — invite a new creator
router.post('/', authenticate, async (req, res) => {
    const user = (req as any).user;
    const { email, name, rate } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: 'email and name are required' });
    }

    const { data, error } = await supabase
        .from('creators')
        .insert({ brand_id: user.id, email, name, rate })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// DELETE /api/creators/:id — remove a creator
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

export default router;
