import { Request, Response } from 'express';
import { db } from '../config/database';

// Поиск пользователей по username или email
export const searchUsers = (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchPattern = `%${query}%`;

    const users = db.prepare(`
      SELECT id, username, email, created_at
      FROM users
      WHERE username LIKE ? OR email LIKE ?
      LIMIT 20
    `).all(searchPattern, searchPattern);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получить профиль пользователя
export const getUserProfile = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = db.prepare(`
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ?
    `).get(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Статистика пользователя
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT c.id) as total_challenges,
        COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_challenges,
        COUNT(DISTINCT p.id) as total_progress_entries,
        SUM(CASE WHEN p.completed = 1 THEN 1 ELSE 0 END) as completed_days
      FROM challenge_participants cp
      LEFT JOIN challenges c ON cp.challenge_id = c.id
      LEFT JOIN progress p ON cp.id = p.participant_id
      WHERE cp.user_id = ?
    `).get(id);

    res.json({ user, stats });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};