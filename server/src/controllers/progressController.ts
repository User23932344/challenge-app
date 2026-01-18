import { Request, Response } from 'express';
import { db } from '../config/database';
import { createNotification } from './notificationController';
import { upload } from '../middleware/uploadMiddleware';

// Отметить прогресс за день
export const markProgress = (req: Request, res: Response) => {
    try {
        const { challengeId } = req.params;
        const { date, completed, value, note, proof_url } = req.body;
        const userId = req.user!.userId;

        // Проверяем, что пользователь участник челленджа
        const participant = db.prepare(`
      SELECT id FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ? AND accepted_at IS NOT NULL
    `).get(challengeId, userId);

        if (!participant) {
            return res.status(403).json({ error: 'Not a participant of this challenge' });
        }

        const participantId = (participant as any).id;
        const progressDate = date || new Date().toISOString().split('T')[0];

        // Проверяем существующий прогресс
        const existingProgress = db.prepare(`
      SELECT * FROM progress
      WHERE participant_id = ? AND date = ?
    `).get(participantId, progressDate);

        let result;

        if (existingProgress) {
            // Обновляем существующий
            result = db.prepare(`
        UPDATE progress
        SET completed = ?, value = ?, note = ?, proof_url = ?, completed_at = CURRENT_TIMESTAMP
        WHERE participant_id = ? AND date = ?
      `).run(completed ? 1 : 0, value || null, note || null, proof_url || null, participantId, progressDate);
        } else {
            // Создаём новый
            result = db.prepare(`
        INSERT INTO progress (participant_id, date, completed, value, note, proof_url, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(participantId, progressDate, completed ? 1 : 0, value || null, note || null, proof_url || null);
        }

        const progress = db.prepare(`
            SELECT * FROM progress
            WHERE participant_id = ? AND date = ?
          `).get(participantId, progressDate) as any; // ДОБАВЬ as any
          
          // Уведомляем других участников о прогрессе
          const currentUser = db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;
          const challenge = db.prepare('SELECT title FROM challenges WHERE id = ?').get(challengeId) as any;
          
          if (completed && currentUser && challenge) {
            // Получаем всех участников кроме текущего пользователя
            const participants = db.prepare(`
              SELECT user_id 
              FROM challenge_participants 
              WHERE challenge_id = ? AND user_id != ? AND accepted_at IS NOT NULL
            `).all(challengeId, userId) as any[];
          
            for (const p of participants) {
              createNotification(
                p.user_id,
                'progress_marked',
                'Прогресс выполнен',
                `${currentUser.username} отметил выполнение в "${challenge.title}"`,
                Number(challengeId),
                progress.id, // Теперь progress.id доступен
                userId
              );
            }
          }

        res.json({
            message: 'Progress marked successfully',
            progress
        });
    } catch (error) {
        console.error('Mark progress error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Загрузить фото-подтверждение
export const uploadProof = (req: Request, res: Response) => {
    try {
      const { progressId } = req.params;
      const userId = req.user!.userId;
  
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // Проверяем что прогресс принадлежит текущему пользователю
      const progress = db.prepare(`
        SELECT p.* 
        FROM progress p
        JOIN challenge_participants cp ON p.participant_id = cp.id
        WHERE p.id = ? AND cp.user_id = ?
      `).get(progressId, userId);
  
      if (!progress) {
        return res.status(403).json({ error: 'Access denied' });
      }
  
      // Обновляем proof_url
      const fileUrl = `/uploads/${req.file.filename}`;
      
      db.prepare(`
        UPDATE progress
        SET proof_url = ?
        WHERE id = ?
      `).run(fileUrl, progressId);
  
      res.json({
        message: 'Photo uploaded successfully',
        proof_url: fileUrl
      });
    } catch (error) {
      console.error('Upload proof error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

// Получить весь прогресс по челленджу
export const getChallengeProgress = (req: Request, res: Response) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user!.userId;

        // Проверяем доступ
        const participant = db.prepare(`
      SELECT * FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ?
    `).get(challengeId, userId);

        if (!participant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Получаем прогресс всех участников
        const progress = db.prepare(`
      SELECT p.*, cp.user_id, u.username
      FROM progress p
      JOIN challenge_participants cp ON p.participant_id = cp.id
      JOIN users u ON cp.user_id = u.id
      WHERE cp.challenge_id = ?
      ORDER BY p.date DESC, u.username
    `).all(challengeId);

        res.json({ progress });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Получить свой прогресс по челленджу
export const getMyProgress = (req: Request, res: Response) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user!.userId;

        const participant = db.prepare(`
      SELECT id FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ?
    `).get(challengeId, userId);

        if (!participant) {
            return res.status(403).json({ error: 'Not a participant' });
        }

        const participantId = (participant as any).id;

        const progress = db.prepare(`
      SELECT * FROM progress
      WHERE participant_id = ?
      ORDER BY date DESC
    `).all(participantId);

        // Считаем статистику
        const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_days,
        SUM(value) as total_value
      FROM progress
      WHERE participant_id = ?
    `).get(participantId);

        res.json({ progress, stats });
    } catch (error) {
        console.error('Get my progress error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};