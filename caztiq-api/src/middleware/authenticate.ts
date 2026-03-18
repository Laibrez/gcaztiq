import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user to request for use in route handlers
    (req as any).user = data.user;
    next();
}
