const variants = {
    primary: 'bg-linear-to-b from-violet-400 to-violet-500 hover:from-violet-400 hover:to-violet-600 text-slate-950 shadow-md shadow-violet-500/25',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    ghost: 'hover:bg-slate-800 text-slate-300',
    danger: 'bg-linear-to-b from-orange-500 to-violet-700 hover:from-orange-500 hover:to-violet-800 text-slate-100 shadow-md shadow-violet-500/25',
    outline: 'border border-slate-700 hover:bg-slate-800 text-slate-200',
};

const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
};

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed btn-shadow ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
