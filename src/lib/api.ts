const BASE = import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app';

export const api = {
    async post(path: string, body: any, authed = true) {
        const isFormData = body instanceof FormData || (body && body.constructor && body.constructor.name === 'FormData');
        if (isFormData) console.log(`[API] Sending FormData to ${path}`);

        const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
        if (authed) headers['Authorization'] = `Bearer ${localStorage.getItem('gc_token')}`;
        
        const res = await fetch(`${BASE}${path}`, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body),
        });
        if (res.status === 401) {
            localStorage.removeItem('gc_token');
            window.location.href = '/login';
            return;
        }
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async get(path: string, authed = true) {
        const headers: Record<string, string> = {};
        if (authed) headers['Authorization'] = `Bearer ${localStorage.getItem('gc_token')}`;
        const res = await fetch(`${BASE}${path}`, {
            headers,
        });
        if (res.status === 401) {
            localStorage.removeItem('gc_token');
            window.location.href = '/login';
            return;
        }
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async delete(path: string, authed = true) {
        const headers: Record<string, string> = {};
        if (authed) headers['Authorization'] = `Bearer ${localStorage.getItem('gc_token')}`;
        const res = await fetch(`${BASE}${path}`, {
            method: 'DELETE',
            headers,
        });
        if (res.status === 401) {
            localStorage.removeItem('gc_token');
            window.location.href = '/login';
            return;
        }
        if (!res.ok) throw await res.json();
        return res.json();
    },
};
