const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {Icon && (
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                    <Icon size={24} className="text-slate-300" />
                </div>
            )}
            <h3 className="font-semibold text-slate-100 mb-1">{title}</h3>
            {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default EmptyState;
