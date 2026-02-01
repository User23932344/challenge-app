import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { initDatabase } from '../config/database';
import authRoutes from '../routes/authRoutes';
import challengeRoutes from '../routes/challengeRoutes';
import progressRoutes from '../routes/progressRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);

beforeAll(() => {
  initDatabase();
});

describe('Progress API', () => {
  let token: string;
  let challengeId: number;

  beforeEach(async () => {
    // Регистрируем пользователя
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: '123456'
      });

    token = userResponse.body.token;

    // Создаём челлендж
    const challengeResponse = await request(app)
      .post('/api/challenges')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Challenge',
        type: 'recurring',
        duration_days: 7
      });

    challengeId = challengeResponse.body.challenge.id;
  });

  describe('POST /api/progress/:challengeId', () => {
    it('should mark progress', async () => {
      const response = await request(app)
        .post(`/api/progress/${challengeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          completed: true,
          value: 10,
          note: 'Great workout'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Progress marked successfully');
      expect(response.body.progress.completed).toBe(1);
      expect(response.body.progress.value).toBe(10);
    });

    it('should reject without auth', async () => {
      const response = await request(app)
        .post(`/api/progress/${challengeId}`)
        .send({
          completed: true
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/progress/:challengeId/my', () => {
    it('should get my progress', async () => {
      // Отмечаем прогресс
      await request(app)
        .post(`/api/progress/${challengeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          completed: true,
          value: 10
        });

      const response = await request(app)
        .get(`/api/progress/${challengeId}/my`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.progress).toHaveLength(1);
      expect(response.body.stats.completed_days).toBe(1);
      expect(response.body.stats.total_value).toBe(10);
    });

    it('should return empty if no progress', async () => {
      const response = await request(app)
        .get(`/api/progress/${challengeId}/my`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.progress).toHaveLength(0);
    });
  });
});