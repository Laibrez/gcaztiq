import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user; // attach to request
    next();
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
