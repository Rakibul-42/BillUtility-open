import { useAuth } from '../context/AuthContext.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import NotificationMenu from './NotificationMenu.jsx';

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const formatToday = () =>
    new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

const Topbar = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || '';

    return (
        <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm shadow-black/30"
            style={{ position: 'relative', zIndex: 30 }}
        >
            <div>
                <div className="text-sm font-semibold text-slate-100 tracking-tight">
                    {greeting()}{firstName && `, ${firstName}`}
                </div>
                <div className="text-xs text-slate-400">{formatToday()}</div>
            </div>

            {/* Right-side controls — search and notifications sit here as icon buttons only */}
            <div className="flex items-center gap-1">
                <GlobalSearch />
                <NotificationMenu />
            </div>
        </header>
    );
};

export default Topbar;
