import { useRef, useState } from 'react';
import { Camera, KeyRound, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:6900';

const Settings = () => {
    const { user, setUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [savingPw, setSavingPw] = useState(false);

    const fileInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarUrl = user?.avatar_url
        ? `${BACKEND_URL}${user.avatar_url}`
        : null;

    const saveProfile = async () => {
        if (!name.trim()) { toast.error('Your name cannot be empty.'); return; }
        setSavingProfile(true);
        try {
            const res = await api.put(API_PATHS.USER.PROFILE, { name: name.trim(), email: email.trim() });
            setUser(res.data.user);
            toast.success('Profile updated successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || "Couldn't save your profile. Please try again.");
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async () => {
        if (!currentPw || !newPw || !confirmPw) { toast.error('Please fill in all password fields.'); return; }
        if (newPw !== confirmPw) { toast.error("The new passwords you entered don't match."); return; }
        if (newPw.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
        setSavingPw(true);
        try {
            await api.put(API_PATHS.USER.PASSWORD, { currentPassword: currentPw, newPassword: newPw });
            toast.success('Password changed successfully.');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Couldn't change your password. Please try again.");
        } finally {
            setSavingPw(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image is too large. Please choose a file under 5 MB.');
            return;
        }
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            toast.error('Please choose a JPEG, PNG, WebP, or GIF image.');
            return;
        }
        setUploadingAvatar(true);
        const form = new FormData();
        form.append('avatar', file);
        try {
            const res = await api.post(API_PATHS.USER.AVATAR, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUser(res.data.user);
            toast.success('Profile picture updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || "Couldn't upload your picture. Please try again.");
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Account Settings</h1>
                <p className="mt-1.5 text-sm text-slate-400">Manage your name, email, password, and profile picture.</p>
            </div>

            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 card-shadow">
                <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-slate-100">
                    <Camera size={18} className="text-violet-400" /> Profile Picture
                </h2>
                <p className="mb-5 text-xs text-slate-500">Max 5 MB · JPEG, PNG, WebP, or GIF · Can only be changed once every two weeks</p>
                <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20 shrink-0">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Your profile picture"
                                className="h-20 w-20 rounded-full object-cover border-2 border-slate-700"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-2xl font-bold text-slate-400">
                                {user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        {uploadingAvatar && (
                            <div className="absolute inset-0 rounded-full bg-slate-900/70 flex items-center justify-center">
                                <span className="text-xs text-slate-300">Uploading…</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            variant="outline"
                        >
                            {uploadingAvatar ? 'Uploading…' : 'Choose a new picture'}
                        </Button>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 card-shadow">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-100">
                    <User size={18} className="text-violet-400" /> Your Details
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Full Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition"
                            placeholder="Your full name"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={saveProfile} disabled={savingProfile}>
                            {savingProfile ? 'Saving…' : 'Save changes'}
                        </Button>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 card-shadow">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-100">
                    <KeyRound size={18} className="text-violet-400" /> Change Password
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPw}
                            onChange={(e) => setCurrentPw(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition"
                            placeholder="Enter your current password"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition"
                            placeholder="At least 6 characters"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition"
                            placeholder="Type your new password again"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={savePassword} disabled={savingPw}>
                            {savingPw ? 'Updating…' : 'Update password'}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Settings;
