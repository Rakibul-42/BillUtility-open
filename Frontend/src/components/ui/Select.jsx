const Select = ({ label, error, className = '', children, ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
            <select
                className={`w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
    );
};

export default Select;
