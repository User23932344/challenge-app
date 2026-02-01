import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { initDatabase } from '../config/database';
import authRoutes from '../routes/authRoutes';
import challengeRoutes from '../routes/challengeRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);

beforeAll(() => {
  initDatabase();
});

describe('Challenge API', () => {
  let token: string;
  let userId: number;

  beforeEach(async () => {
    // Регистрируем пользователя и получаем токен
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: '123456'
      });

    token = response.body.token;
    userId = response.body.user.id;
  });

  describe('POST /api/challenges', () => {
    it('should create a new challenge', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '30 дней медитации',
          description: 'Медитировать каждый день',
          type: 'recurring',
          frequency: 'daily',
          duration_days: 30
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Challenge created successfully');
      expect(response.body.challenge.title).toBe('30 дней медитации');
      expect(response.body.challenge.type).toBe('recurring');
      expect(response.body.challenge.status).toBe('pending');
    });

    it('should create one-time challenge', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Пробежать марафон',
          type: 'one-time'
        });

      expect(response.status).toBe(201);
      expect(response.body.challenge.type).toBe('one-time');
    });

    it('should reject challenge without title', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'recurring'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and type are required');
    });

    it('should reject recurring challenge without duration', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test',
          type: 'recurring'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Duration is required for recurring challenges');
    });

    it('should reject without auth token', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .send({
          title: 'Test',
          type: 'one-time'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/challenges', () => {
    it('should get user challenges', async () => {
      // Создаём челлендж
      await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Challenge',
          type: 'one-time'
        });

      const response = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.challenges).toHaveLength(1);
      expect(response.body.challenges[0].title).toBe('Test Challenge');
    });

    it('should return empty array if no challenges', async () => {
      const response = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.challenges).toHaveLength(0);
    });
  });

  describe('PATCH /api/challenges/:id/status', () => {
    it('should update challenge status', async () => {
      // Создаём челлендж
      const createResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test',
          type: 'one-time'
        });

      const challengeId = createResponse.body.challenge.id;

      // Обновляем статус
      const response = await request(app)
        .patch(`/api/challenges/${challengeId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'active'
        });

      expect(response.status).toBe(200);
      expect(response.body.challenge.status).toBe('active');
    });

    it('should reject invalid status', async () => {
      const createResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test',
          type: 'one-time'
        });

      const challengeId = createResponse.body.challenge.id;

      const response = await request(app)
        .patch(`/api/challenges/${challengeId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'invalid'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/challenges/:id', () => {
    it('should delete challenge', async () => {
      const createResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test',
          type: 'one-time'
        });

      const challengeId = createResponse.body.challenge.id;

      const response = await request(app)
        .delete(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Challenge deleted successfully');
    });

    it('should not allow non-creator to delete', async () => {
      // Создаём второго пользователя
      const user2Response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: '123456'
        });

      const token2 = user2Response.body.token;

      // Первый пользователь создаёт челлендж
      const createResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test',
          type: 'one-time'
        });

      const challengeId = createResponse.body.challenge.id;

      // Второй пользователь пытается удалить
      const response = await request(app)
        .delete(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(response.status).toBe(403);
    });
  });
});