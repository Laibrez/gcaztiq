import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/signup', async (req, res) => {
    const { email, password, company_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: adminData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });
    if (createError) return res.status(400).json({ error: createError.message });

    // Create brand profile
    const { error: insertError } = await supabase.from('brands').insert({
        id: adminData.user.id,
        email,
        company_name: company_name || '',
    });
    if (insertError) console.error('Signup profile creation failed:', insertError.message);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (signInError) return res.status(400).json({ error: signInError.message });

    res.json({ user: adminData.user, session: signInData.session });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    // Ensure the brand row always exists (fixes ghost account issue)
    const { data: existingBrand } = await supabase.from('brands').select('id').eq('id', data.user.id).maybeSingle();
    
    if (!existingBrand) {
        const { error: insertError } = await supabase.from('brands').insert({
            id: data.user.id,
            email: data.user.email || email,
            company_name: data.user.email?.split('@')[0] || 'Brand Account',
            wallet_balance_cents: 0
        });
        if (insertError) console.error('Login profile creation failed:', insertError.message);
    }

    res.json({ user: data.user, session: data.session });
});

router.post('/logout', async (req, res) => {
    await supabase.auth.signOut();
    res.json({ success: true });
});

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = (req as any).user;
        const { data: brand } = await supabase.from('brands').select('company_name').eq('id', user.id).single();
        res.json({
            email: user.email,
            name: brand?.company_name || user.email?.split('@')[0] || 'Brand Account',
            company_name: brand?.company_name || '',
        });
    } catch {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.post('/profile', authenticate, async (req, res) => {
    const user = (req as any).user;
    const { company_name } = req.body;
    if (!company_name) return res.status(400).json({ error: 'company_name required' });

    const { error } = await supabase.from('brands')
        .update({ company_name })
        .eq('id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

export default router;
