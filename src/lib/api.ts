const BASE = import.meta.env.VITE_API_URL;

export const api = {
    async post(path: string, body: object, authed = true) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authed) headers['Authorization'] = `Bearer ${localStorage.getItem('gb_token')}`;
        const res = await fetch(`${BASE}${path}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async get(path: string) {
        const res = await fetch(`${BASE}${path}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('gb_token')}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },
};
