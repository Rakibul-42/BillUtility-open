import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, LoaderCircle, Sparkles } from 'lucide-react';
import api from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { API_PATHS } from '../utils/apiPaths.js';
import { timeAgo } from '../utils/format.js';

const severityStyles = {
    critical: 'bg-rose-500/15 text-rose-300',
    warning: 'bg-amber-500/15 text-amber-300',
    info: 'bg-violet-500/15 text-violet-300',
};

const NotificationMenu = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [signature, setSignature] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

    const storageKey = `billutility-notifications-seen:${user?.id || 'unknown'}`;
    const seenSignature = localStorage.getItem(storageKey) || '';
    const unread = Boolean(signature && signature !== seenSignature);

    const loadNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(API_PATHS.NOTIFICATIONS.LIST);
            setNotifications(response.data.notifications);
            setSignature(response.data.signature);
            return response.data.signature;
        } catch {
            setError("Couldn't fetch your notifications. Try refreshing.");
            return '';
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        api.get(API_PATHS.NOTIFICATIONS.LIST)
            .then((response) => {
                if (!active) return;
                setNotifications(response.data.notifications);
                setSignature(response.data.signature);
            })
            .catch(() => {
                if (active) setError("Couldn't fetch your notifications. Try refreshing.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (buttonRef.current?.contains(event.target) || dropdownRef.current?.contains(event.target)) return;
            setOpen(false);
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const toggleMenu = async () => {
        if (open) {
            setOpen(false);
            return;
        }

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen(true);
        const latestSignature = await loadNotifications();
        if (latestSignature) localStorage.setItem(storageKey, latestSignature);
    };

    const openNotification = (notification) => {
        if (signature) localStorage.setItem(storageKey, signature);
        setOpen(false);
        navigate(notification.path);
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleMenu}
                aria-label="Open notifications"
                aria-expanded={open}
                aria-haspopup="menu"
                className="relative h-9 w-9 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-100 flex items-center justify-center transition"
            >
                <Bell size={17} />
                {unread && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                )}
            </button>

            {open && createPortal(
                <div
                    ref={dropdownRef}
                    role="menu"
                    className="fixed w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 popup-shadow"
                    style={{
                        zIndex: 9998,
                        top: dropdownPos.top,
                        right: dropdownPos.right,
                    }}
                >
                    <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-100">Notifications</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Alerts and AI updates</p>
                        </div>
                        <button
                            type="button"
                            onClick={loadNotifications}
                            disabled={loading}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {loading && (
                            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-slate-400">
                                <LoaderCircle size={17} className="animate-spin" />
                                Loading…
                            </div>
                        )}
                        {!loading && error && (
                            <div className="m-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                {error}
                            </div>
                        )}
                        {!loading && !error && notifications.length === 0 && (
                            <div className="px-5 py-12 text-center">
                                <Bell size={24} className="mx-auto mb-3 text-slate-600" />
                                <p className="text-sm font-medium text-slate-300">You're all caught up</p>
                                <p className="mt-1 text-xs text-slate-500">Budget alerts and new AI analyses will show up here.</p>
                            </div>
                        )}
                        {!loading && !error && notifications.map((notification) => {
                            const Icon = notification.type === 'insight' ? Sparkles : AlertTriangle;
                            return (
                                <button
                                    type="button"
                                    role="menuitem"
                                    key={notification.id}
                                    onClick={() => openNotification(notification)}
                                    className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-800"
                                >
                                    <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${severityStyles[notification.severity]}`}>
                                        <Icon size={17} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-slate-100">{notification.title}</span>
                                        <span className="mt-1 block text-xs leading-relaxed text-slate-400">{notification.message}</span>
                                        {notification.createdAt && (
                                            <span className="mt-1.5 block text-[11px] text-slate-600">{timeAgo(notification.createdAt)}</span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default NotificationMenu;
