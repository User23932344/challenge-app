import { Request, Response } from 'express';
import { db } from '../config/database';
import { Challenge } from '../types';
import { createNotification } from './notificationController';

// Создать челлендж
export const createChallenge = (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      frequency,
      duration_days,
      target_value,
      metric_unit,
      stake_description,
      start_date,
      participant_ids // массив ID друзей для приглашения
    } = req.body;

    const creator_id = req.user!.userId;

    // Валидация
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    if (type === 'recurring' && !duration_days) {
      return res.status(400).json({ error: 'Duration is required for recurring challenges' });
    }

    // Создаём челлендж
    const result = db.prepare(`
      INSERT INTO challenges (
        title, description, type, frequency, duration_days,
        target_value, metric_unit, stake_description, creator_id, start_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description || null,
      type,
      frequency || null,
      duration_days || null,
      target_value || null,
      metric_unit || null,
      stake_description || null,
      creator_id,
      start_date || new Date().toISOString().split('T')[0]
    );

    const challengeId = result.lastInsertRowid;

    // Добавляем создателя как участника
    db.prepare(`
      INSERT INTO challenge_participants (challenge_id, user_id, role, accepted_at)
      VALUES (?, ?, 'creator', CURRENT_TIMESTAMP)
    `).run(challengeId, creator_id);

    // Добавляем приглашённых участников
    if (participant_ids && Array.isArray(participant_ids)) {
      const insertParticipant = db.prepare(`
        INSERT INTO challenge_participants (challenge_id, user_id, role)
        VALUES (?, ?, 'participant')
      `);

      const creatorData = db.prepare('SELECT username FROM users WHERE id = ?').get(creator_id) as { username: string } | undefined;
      const creatorUsername = creatorData?.username || 'Пользователь';

      for (const userId of participant_ids) {
        insertParticipant.run(challengeId, userId);

        createNotification(
          userId,
          'challenge_invite',
          'Новое приглашение в челлендж',
          `${creatorUsername} приглашает тебя в "${title}"`,
          Number(challengeId),
          undefined,
          creator_id
        );
      }
    }

    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получить все челленджи пользователя
export const getUserChallenges = (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const challenges = db.prepare(`
      SELECT c.*, cp.role, cp.accepted_at
      FROM challenges c
      JOIN challenge_participants cp ON c.id = cp.challenge_id
      WHERE cp.user_id = ?
      ORDER BY c.created_at DESC
    `).all(userId);

    res.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получить конкретный челлендж с участниками
export const getChallengeById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Проверяем, что пользователь участник челленджа
    const participant = db.prepare(`
      SELECT * FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ?
    `).get(id, userId);

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Получаем всех участников
    const participants = db.prepare(`
      SELECT cp.*, u.username, u.email
      FROM challenge_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.challenge_id = ?
    `).all(id);

    res.json({ challenge, participants });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Принять приглашение в челлендж
export const acceptChallenge = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = db.prepare(`
      UPDATE challenge_participants
      SET accepted_at = CURRENT_TIMESTAMP
      WHERE challenge_id = ? AND user_id = ? AND accepted_at IS NULL
    `).run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invitation not found or already accepted' });
    }

    const challenge = db.prepare('SELECT creator_id, title FROM challenges WHERE id = ?').get(id) as any;
    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;

    if (challenge && user && challenge.creator_id !== userId) {
      createNotification(
        challenge.creator_id,
        'challenge_accepted',
        'Челлендж принят',
        `${user.username} принял участие в "${challenge.title}"`,
        Number(id),
        undefined,
        userId
      );
    }

    res.json({ message: 'Challenge accepted' });
  } catch (error) {
    console.error('Accept challenge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Отклонить приглашение
export const declineChallenge = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = db.prepare(`
      DELETE FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ? AND role = 'participant' AND accepted_at IS NULL
    `).run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ message: 'Challenge declined' });
  } catch (error) {
    console.error('Decline challenge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Обновить статус челленджа
export const updateChallengeStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.userId;

    // Валидация статуса
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Проверяем, что пользователь - создатель челленджа
    const challenge = db.prepare(`
      SELECT * FROM challenges WHERE id = ? AND creator_id = ?
    `).get(id, userId);

    if (!challenge) {
      return res.status(403).json({ error: 'Only creator can update challenge status' });
    }

    db.prepare(`
      UPDATE challenges
      SET status = ?
      WHERE id = ?
    `).run(status, id);

    const updatedChallenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(id);

    res.json({
      message: 'Challenge status updated',
      challenge: updatedChallenge
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Удалить челлендж
export const deleteChallenge = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Проверяем, что пользователь - создатель
    const challenge = db.prepare(`
      SELECT * FROM challenges WHERE id = ? AND creator_id = ?
    `).get(id, userId);

    if (!challenge) {
      return res.status(403).json({ error: 'Only creator can delete challenge' });
    }

    // Удаляем (каскадно удалятся participants и progress благодаря ON DELETE CASCADE)
    db.prepare('DELETE FROM challenges WHERE id = ?').run(id);

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Получить рейтинг участников челленджа
export const getChallengeLeaderboard = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Проверяем доступ
    const isParticipant = db.prepare(`
      SELECT * FROM challenge_participants
      WHERE challenge_id = ? AND user_id = ?
    `).get(id, userId);

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const leaderboard = db.prepare(`
      SELECT 
        u.id,
        u.username,
        cp.role,
        COUNT(p.id) as total_entries,
        SUM(CASE WHEN p.completed = 1 THEN 1 ELSE 0 END) as completed_days,
        SUM(p.value) as total_value,
        MAX(p.date) as last_activity,
        -- Streak calculation (подряд выполненные дни)
        (
          SELECT COUNT(*)
          FROM progress p2
          WHERE p2.participant_id = cp.id 
            AND p2.completed = 1
            AND p2.date >= date('now', '-' || (
              SELECT COUNT(*) 
              FROM progress p3 
              WHERE p3.participant_id = cp.id 
                AND p3.date > p2.date 
                AND p3.completed = 0
            ) || ' days')
        ) as current_streak
      FROM challenge_participants cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN progress p ON cp.id = p.participant_id
      WHERE cp.challenge_id = ? AND cp.accepted_at IS NOT NULL
      GROUP BY cp.id, u.id, u.username, cp.role
      ORDER BY completed_days DESC, total_value DESC
    `).all(id);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};