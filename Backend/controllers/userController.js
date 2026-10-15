import bcrypt from 'bcryptjs';
import pool from '../db.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.userId}_${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
};

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) {
    return res.status(400).json({ message: 'Provide at least a name or email to update.' });
  }

  const client = await pool.connect();
  try {
    const current = await client.query(
      'SELECT name, email FROM users WHERE id = $1',
      [req.userId]
    );
    if (current.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const newName = name?.trim() || current.rows[0].name;
    const newEmail = email?.trim().toLowerCase() || current.rows[0].email;

    if (newEmail !== current.rows[0].email) {
      const exists = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [newEmail, req.userId]
      );
      if (exists.rows.length > 0) {
        return res.status(400).json({ message: 'That email address is already in use.' });
      }
    }

    const result = await client.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, currency, avatar_url',
      [newName, newEmail, req.userId]
    );
    res.json({ user: result.rows[0] });
  } finally {
    client.release();
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from your current one.' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) return res.status(400).json({ message: 'Your current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);
    res.json({ message: 'Password updated successfully.' });
  } finally {
    client.release();
  }
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file was provided.' });

  const client = await pool.connect();
  try {
    const current = await client.query(
      'SELECT avatar_url, avatar_updated_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (current.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const lastUpdated = current.rows[0].avatar_updated_at;
    if (lastUpdated) {
      const daysSince = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 14) {
        fs.unlink(req.file.path, () => {});
        const daysLeft = Math.ceil(14 - daysSince);
        return res.status(429).json({
          message: `You can only change your profile picture once every two weeks. You can change it again in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
        });
      }
    }

    if (current.rows[0].avatar_url) {
      const oldPath = path.join(process.cwd(), current.rows[0].avatar_url.replace(/^\//, ''));
      fs.unlink(oldPath, () => {});
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const result = await client.query(
      'UPDATE users SET avatar_url = $1, avatar_updated_at = NOW() WHERE id = $2 RETURNING id, name, email, currency, avatar_url',
      [avatarUrl, req.userId]
    );
    res.json({ user: result.rows[0] });
  } finally {
    client.release();
  }
};

export const cleanOrphanedAvatars = async () => {
  const result = await pool.query('SELECT avatar_url FROM users WHERE avatar_url IS NOT NULL');
  const dbAvatars = new Set(result.rows.map((r) => path.basename(r.avatar_url)));

  const files = fs.readdirSync(UPLOAD_DIR);
  for (const file of files) {
    if (!dbAvatars.has(file)) {
      fs.unlink(path.join(UPLOAD_DIR, file), () => {});
      console.log(`Deleted orphaned avatar: ${file}`);
    }
  }
};
