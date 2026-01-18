import { Request, Response } from 'express';
import { db } from '../config/database';

// Создать уведомление (вспомогательная функция)
export const createNotification = (
  userId: number,
  type: string,
  title: string,
  message: string,
  challengeId?: number,
  progressId?: number,
  fromUserId?: number
) => {
  db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, challenge_id, progress_id, from_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, type, title, message, challengeId || null, progressId || null, fromUserId || null);
};

// Получить уведомления пользователя
export const getNotifications = (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { unread } = req.query;

    let query = `
      SELECT n.*, u.username as from_username
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.id
      WHERE n.user_id = ?
    `;

    if (unread === 'true') {
      query += ' AND n.is_read = 0';
    }

    query += ' ORDER BY n.created_at DESC LIMIT 50';

    const notifications = db.prepare(query).all(userId);

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Отметить уведомление как прочитанное
export const markAsRead = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Отметить все как прочитанные
export const markAllAsRead = (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ? AND is_read = 0
    `).run(userId);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Удалить уведомление
export const deleteNotification = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = db.prepare(`
      DELETE FROM notifications
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};