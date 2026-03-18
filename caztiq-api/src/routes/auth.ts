import { Router } from 'express';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    // Supabase handles auth client-side — this endpoint is a placeholder
    // for any server-side auth logic (e.g. custom claims, role assignment)
    res.json({ message: 'Auth is handled client-side via Supabase SDK' });
});

export default router;
