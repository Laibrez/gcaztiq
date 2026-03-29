const BASE = import.meta.env.VITE_API_URL || 'https://caztiq-api-production.up.railway.app';

export const api = {
    async post(path: string, body: object, authed = true) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authed) headers['Authorization'] = `Bearer ${localStorage.getItem('gb_token')}`;
        const res = await fetch(`${BASE}${path}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (res.status === 401) {
            localStorage.removeItem('gb_token');
            window.location.href = '/login';
            return;
        }
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async get(path: string, authed = true) {
        const headers: Record<string, string> = {};
        if (authed) headers['Authorization'] = `Bearer ${localStorage.getItem('gb_token')}`;
        const res = await fetch(`${BASE}${path}`, {
            headers,
        });
        if (res.status === 401) {
            localStorage.removeItem('gb_token');
            window.location.href = '/login';
            return;
        }
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async delete(path: string, authed = true) {
        const headers: Record<string, string> = {};
        if (authed) headers['Authorization'] = `Bearer ${localStorage.getItem('gb_token')}`;
        const res = await fetch(`${BASE}${path}`, {
            method: 'DELETE',
            headers,
        });
        if (res.status === 401) {
            localStorage.removeItem('gb_token');
            window.location.href = '/login';
            return;
        }
        if (!res.ok) throw await res.json();
        return res.json();
    },
};
