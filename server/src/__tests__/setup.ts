import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, '../../database/test.db');

// Удаляем тестовую БД перед запуском всех тестов
beforeAll(() => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Очистка БД перед каждым тестом
beforeEach(() => {
  const { db } = require('../config/database');
  
  try {
    // Отключаем foreign keys временно
    db.pragma('foreign_keys = OFF');
    
    // Очищаем все таблицы
    db.exec('DELETE FROM progress_comments');
    db.exec('DELETE FROM notifications');
    db.exec('DELETE FROM progress');
    db.exec('DELETE FROM challenge_participants');
    db.exec('DELETE FROM challenges');
    db.exec('DELETE FROM users');
    
    // Включаем обратно foreign keys
    db.pragma('foreign_keys = ON');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
});

// Закрываем соединение после всех тестов
afterAll(() => {
  const { db } = require('../config/database');
  
  try {
    db.close();
  } catch (e) {
    // Игнорируем ошибки
  }
  
  // Удаляем тестовую БД
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});