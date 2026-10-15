import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import CategoryForm from '../components/CategoryForm.jsx';
import { useConfirm } from '../components/ui/ConfirmDialog.jsx';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const { dialog, confirm } = useConfirm();

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get(API_PATHS.CATEGORIES.LIST);
            setCategories(res.data);
        } catch {
            toast.error("Couldn't load your categories. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onEdit = (c) => {
        setEditing(c);
        setModalOpen(true);
    };

    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const onDelete = async (id) => {
        const ok = await confirm({
            title: 'Remove this category?',
            message: 'Any transactions in this category will become uncategorized. This cannot be undone.',
            danger: true,
        });
        if (!ok) return;
        try {
            await api.delete(API_PATHS.CATEGORIES.DELETE(id));
            toast.success('Category removed successfully.');
            fetchCategories();
        } catch {
            toast.error("Couldn't delete the category. Please try again.");
        }
    };

    const onSaved = () => {
        setModalOpen(false);
        fetchCategories();
    };

    const reorder = (arr, fromId, toId) => {
        const from = arr.findIndex((c) => c.id === fromId);
        const to = arr.findIndex((c) => c.id === toId);
        if (from === -1 || to === -1 || from === to) return arr;
        const next = [...arr];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
    };

    const saveOrder = async (updatedList) => {
        try {
            await api.patch(API_PATHS.CATEGORIES.REORDER, {
                order: updatedList.map((c, i) => ({ id: c.id, sort_order: i })),
            });
        } catch {
            toast.error("Couldn't save the new order. Please try again.");
        }
    };

    const handleDrop = (targetId, groupType) => {
        if (!draggedId || draggedId === targetId) return;
        const groupItems = categories.filter((c) => c.type === groupType);
        const otherItems = categories.filter((c) => c.type !== groupType);
        const reordered = reorder(groupItems, draggedId, targetId);
        const next = [...otherItems, ...reordered];
        setCategories(next);
        saveOrder(reordered);
        setDraggedId(null);
        setDragOverId(null);
    };

    const income = categories.filter((c) => c.type === 'income');
    const expense = categories.filter((c) => c.type === 'expense');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Organize transactions by category</p>
                </div>
                <Button onClick={onCreate}>
                    <Plus size={16} /> Add Category
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : categories.length === 0 ? (
                <EmptyState
                    icon={Folder}
                    title="No categories yet"
                    description="Create a category to start grouping your income and expenses."
                />
            ) : (
                <>
                    {[
                        { label: 'Income', items: income },
                        { label: 'Expense', items: expense },
                    ].map((group) => (
                        <div key={group.label}>
                            <h2 className="font-semibold text-slate-900 mb-3">
                                {group.label} <span className="text-slate-400 font-normal">({group.items.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.items.map((c) => (
                                    <div
                                        key={c.id}
                                        draggable
                                        onDragStart={() => setDraggedId(c.id)}
                                        onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverId(c.id); }}
                                        onDrop={() => handleDrop(c.id, group.label.toLowerCase())}
                                        className={`bg-white rounded-2xl border p-4 flex items-center justify-between gap-3 card-shadow transition-all duration-150 select-none ${
                                            draggedId === c.id
                                                ? 'opacity-40 scale-95 border-violet-500/50'
                                                : dragOverId === c.id && draggedId !== c.id
                                                ? 'border-violet-500/70 ring-2 ring-violet-500/30 scale-[1.02]'
                                                : 'border-slate-100 card-shadow-hover'
                                        }`}
                                        style={{ cursor: 'grab' }}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            <span className="text-slate-500 opacity-40 hover:opacity-80 transition" title="Drag to reorder">
                                                <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
                                                    <circle cx="3" cy="3" r="1.5"/>
                                                    <circle cx="9" cy="3" r="1.5"/>
                                                    <circle cx="3" cy="9" r="1.5"/>
                                                    <circle cx="9" cy="9" r="1.5"/>
                                                    <circle cx="3" cy="15" r="1.5"/>
                                                    <circle cx="9" cy="15" r="1.5"/>
                                                </svg>
                                            </span>
                                            <CategoryBadge name={c.name} icon={c.icon} color={c.color} />
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5 pl-2">
                                            {c.is_default && <StatusPill variant="neutral">Default</StatusPill>}
                                            <button
                                                onClick={() => onEdit(c)}
                                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition"
                                                title="Edit category"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(c.id)}
                                                className="p-1.5 hover:bg-rose-50 rounded-md text-rose-500 transition"
                                                title="Remove category"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Category' : 'New Category'}
            >
                <CategoryForm initial={editing} onSaved={onSaved} onCancel={() => setModalOpen(false)} />
            </Modal>
            {dialog}
        </div>
    );
};

export default Categories;
