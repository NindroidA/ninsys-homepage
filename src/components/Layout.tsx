import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
    const location = useLocation();

    // scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950">
            <Outlet />
        </div>
    );
}