import { Request, Response } from 'express';
import { db } from '../config/database';
import { createNotification } from './notificationController';

// Добавить комментарий к прогрессу
export const addComment = (req: Request, res: Response) => {
  try {
    const { progressId } = req.params;
    const { comment } = req.body;
    const userId = req.user!.userId;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    // Проверяем, что прогресс существует и пользователь имеет доступ к челленджу
    const progress = db.prepare(`
      SELECT p.*, cp.challenge_id
      FROM progress p
      JOIN challenge_participants cp ON p.participant_id = cp.id
      WHERE p.id = ?
    `).get(progressId);

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const challengeId = (progress as any).challenge_id;

    // Проверяем, что комментатор - участник того же челленджа
    const isParticipant = db.prepare(`
      SELECT * FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ?
    `).get(challengeId, userId);

    if (!isParticipant) {
      return res.status(403).json({ error: 'Only challenge participants can comment' });
    }

    const result = db.prepare(`
      INSERT INTO progress_comments (progress_id, user_id, comment)
      VALUES (?, ?, ?)
    `).run(progressId, userId, comment.trim());

    const newComment = db.prepare(`
      SELECT pc.*, u.username
      FROM progress_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.id = ?
    `).get(result.lastInsertRowid);

    // Уведомляем автора прогресса (если комментарий не от него самого)
const progressOwner = db.prepare(`
    SELECT cp.user_id 
    FROM progress p
    JOIN challenge_participants cp ON p.participant_id = cp.id
    WHERE p.id = ?
  `).get(progressId) as any;
  
  const commenter = db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;
  const challenge = db.prepare(`
    SELECT c.title 
    FROM challenges c
    JOIN challenge_participants cp ON c.id = cp.challenge_id
    JOIN progress p ON cp.id = p.participant_id
    WHERE p.id = ?
  `).get(progressId) as any;
  
  if (progressOwner && progressOwner.user_id !== userId && commenter && challenge) {
    createNotification(
      progressOwner.user_id,
      'comment_added',
      'Новый комментарий',
      `${commenter.username} прокомментировал ваш прогресс в "${challenge.title}"`,
      challengeId,
      Number(progressId),
      userId
    );
  }
  

    res.status(201).json({
      message: 'Comment added',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получить комментарии к прогрессу
export const getComments = (req: Request, res: Response) => {
  try {
    const { progressId } = req.params;
    const userId = req.user!.userId;

    // Проверяем доступ
    const progress = db.prepare(`
      SELECT p.*, cp.challenge_id
      FROM progress p
      JOIN challenge_participants cp ON p.participant_id = cp.id
      WHERE p.id = ?
    `).get(progressId);

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const challengeId = (progress as any).challenge_id;

    const isParticipant = db.prepare(`
      SELECT * FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ?
    `).get(challengeId, userId);

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = db.prepare(`
      SELECT pc.*, u.username
      FROM progress_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.progress_id = ?
      ORDER BY pc.created_at ASC
    `).all(progressId);

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Удалить свой комментарий
export const deleteComment = (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    const result = db.prepare(`
      DELETE FROM progress_comments
      WHERE id = ? AND user_id = ?
    `).run(commentId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};