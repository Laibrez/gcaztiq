import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.post('/signup', async (req, res) => {
    const { email, password, company_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    // Create brand profile
    await supabase.from('brands').insert({
        id: data.user!.id,
        email,
        company_name: company_name || '',
    });

    res.json({ user: data.user, session: data.session });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ user: data.user, session: data.session });
});

router.post('/logout', async (req, res) => {
    await supabase.auth.signOut();
    res.json({ success: true });
});

export default router;
