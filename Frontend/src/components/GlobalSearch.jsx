import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftRight,
    Folder,
    LayoutDashboard,
    LoaderCircle,
    Search,
    Sparkles,
    Target,
} from 'lucide-react';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';

const pages = [
    { id: 'dashboard', kind: 'page', title: 'Dashboard', subtitle: 'Overview and recent activity', path: '/', Icon: LayoutDashboard },
    { id: 'transactions', kind: 'page', title: 'Transactions', subtitle: 'Income and expense records', path: '/transactions', Icon: ArrowLeftRight },
    { id: 'categories', kind: 'page', title: 'Categories', subtitle: 'Organize transaction types', path: '/categories', Icon: Folder },
    { id: 'budgets', kind: 'page', title: 'Budgets', subtitle: 'Track spending limits', path: '/budgets', Icon: Target },
    { id: 'insights', kind: 'page', title: 'AI Insights', subtitle: 'Personalized financial analysis', path: '/insights', Icon: Sparkles },
];

const kindIcons = {
    transaction: ArrowLeftRight,
    category: Folder,
    budget: Target,
};

// Human-readable kind labels shown as the small badge on each result
const kindLabels = {
    page: 'Page',
    transaction: 'Transaction',
    category: 'Category',
    budget: 'Budget',
};

const GlobalSearch = () => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [remoteResults, setRemoteResults] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [noResults, setNoResults] = useState(false); // true only after a real search found nothing

    const pageResults = pages.filter((page) =>
        `${page.title} ${page.subtitle}`.toLowerCase().includes(query.trim().toLowerCase())
    );
    const results = [...pageResults, ...remoteResults];

    const openSearch = () => {
        setOpen(true);
        setQuery('');
        setRemoteResults([]);
        setActiveIndex(0);
        setNoResults(false);
        window.setTimeout(() => inputRef.current?.focus(), 0);
    };

    const closeSearch = () => {
        setOpen(false);
        setQuery('');
        setRemoteResults([]);
        setNoResults(false);
    };

    useEffect(() => {
        const handleShortcut = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                openSearch();
            }
        };

        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, []);

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) return undefined;

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);
            try {
                const response = await api.get(API_PATHS.SEARCH.GLOBAL, {
                    params: { q: trimmed },
                    signal: controller.signal,
                });
                const fetched = [
                    ...response.data.transactions,
                    ...response.data.categories,
                    ...response.data.budgets,
                ];
                setRemoteResults(fetched);
                setActiveIndex(0);
                // Only show "nothing found" if both page-filter and remote came back empty
                const combinedPages = pages.filter((page) =>
                    `${page.title} ${page.subtitle}`.toLowerCase().includes(trimmed.toLowerCase())
                );
                if (fetched.length === 0 && combinedPages.length === 0) {
                    setNoResults(true);
                }
            } catch (requestError) {
                if (requestError.code !== 'ERR_CANCELED') {
                    setRemoteResults([]);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 250);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const selectResult = (result) => {
        closeSearch();
        navigate(result.path);
        if (result.kind === 'transaction') {
            window.queueMicrotask(() => {
                window.dispatchEvent(new CustomEvent('global-transaction-search', {
                    detail: { search: result.title },
                }));
            });
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closeSearch();
            return;
        }
        if (results.length === 0) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % results.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + results.length) % results.length);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            selectResult(results[activeIndex]);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                aria-haspopup="dialog"
                className="h-9 w-9 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 flex items-center justify-center transition"
            >
                <Search size={17} />
            </button>

            {createPortal(open ? (
                <div
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm px-4 pt-[12vh]"
                    style={{ zIndex: 9999 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeSearch();
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search"
                        className="mx-auto max-w-xl overflow-hidden rounded-[1.75rem] border border-slate-700 bg-slate-900 popup-shadow"
                    >
                        <div className="flex items-center gap-3 rounded-t-[1.75rem] border-b border-slate-800 px-5">
                            <Search size={19} className="shrink-0 text-violet-300" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setActiveIndex(0);
                                    setNoResults(false);
                                    if (event.target.value.trim().length < 2) {
                                        setRemoteResults([]);
                                        setLoading(false);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search pages, transactions, categories, budgets…"
                                className="h-16 min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                            />
                            {loading ? (
                                <LoaderCircle size={17} className="animate-spin text-violet-300" />
                            ) : (
                                <kbd className="hidden rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] text-slate-400 sm:block">
                                    ESC
                                </kbd>
                            )}
                        </div>

                        <div role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
                            {noResults && !loading && (
                                <div className="px-5 py-12 text-center">
                                    <Search size={24} className="mx-auto mb-3 text-slate-600" />
                                    <p className="text-sm font-medium text-slate-300">No results found</p>
                                    <p className="mt-1 text-xs text-slate-500">Try a different word, a transaction note, category name, or budget title.</p>
                                </div>
                            )}
                            {results.map((result, index) => {
                                const Icon = result.Icon || kindIcons[result.kind] || Search;
                                return (
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={activeIndex === index}
                                        key={`${result.kind}:${result.id}`}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => selectResult(result)}
                                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                                            activeIndex === index
                                                ? 'bg-violet-500/15 text-slate-100'
                                                : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                            activeIndex === index ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                            <Icon size={18} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">{result.title}</span>
                                            <span className="block truncate text-xs text-slate-500">{result.subtitle}</span>
                                        </span>
                                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500">
                                            {kindLabels[result.kind] || result.kind}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-4 border-t border-slate-800 px-5 py-3 text-[11px] text-slate-500">
                            <span>↑ ↓ Move</span>
                            <span>Enter Open</span>
                            <span className="ml-auto">Ctrl K</span>
                        </div>
                    </div>
                </div>
            ) : null, document.body)}
        </>
    );
};

export default GlobalSearch;
