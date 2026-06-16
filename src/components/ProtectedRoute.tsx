import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute() {
    const token = localStorage.getItem('gc_token');
    const location = useLocation();

    if (!token) {
        if (location.pathname === '/') return <Navigate to="/welcome" replace />;
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
