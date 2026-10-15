import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

/**
 * Usage:
 *   const { dialog, confirm } = useConfirm();
 *   ...
 *   const ok = await confirm({ title: 'Delete category?', message: '...' });
 *   if (ok) { ... }
 *   ...
 *   return <>{dialog}</>
 */

export const useConfirm = () => {
    const [state, setState] = useState(null); // { title, message, danger }
    const resolveRef = useRef(null);

    const confirm = useCallback(({ title, message, danger = true }) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setState({ title, message, danger });
        });
    }, []);

    const handleClose = (result) => {
        setState(null);
        resolveRef.current?.(result);
    };

    const dialog = state
        ? createPortal(
            <div
                className="fixed inset-0 flex items-center justify-center p-4"
                style={{ zIndex: 10000, background: 'rgba(27,19,13,0.80)', backdropFilter: 'blur(4px)' }}
            >
                <div
                    className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 popup-shadow"
                >
                    {/* Icon */}
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${state.danger ? 'bg-rose-500/15' : 'bg-violet-500/15'}`}>
                        <AlertTriangle size={22} className={state.danger ? 'text-rose-400' : 'text-violet-400'} />
                    </div>

                    {/* Title */}
                    <h2 className="mb-2 text-base font-bold text-slate-100">{state.title}</h2>

                    {/* Message */}
                    <p className="mb-6 text-sm leading-relaxed text-slate-400">{state.message}</p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => handleClose(false)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-slate-100 btn-shadow"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleClose(true)}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition btn-shadow ${
                                state.danger
                                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                                    : 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/40'
                            }`}
                        >
                            {state.danger ? 'Yes, delete' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )
        : null;

    return { dialog, confirm };
};
