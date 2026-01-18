import { Router } from 'express';
import {
    createChallenge,
    getUserChallenges,
    getChallengeById,
    acceptChallenge,
    declineChallenge,
    updateChallengeStatus,
    deleteChallenge,
    getChallengeLeaderboard
  } from '../controllers/challengeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Все роуты защищены authMiddleware
router.post('/', authMiddleware, createChallenge);
router.post('/:id/accept', authMiddleware, acceptChallenge);
router.get('/', authMiddleware, getUserChallenges);
router.get('/:id', authMiddleware, getChallengeById);
router.get('/:id/leaderboard', authMiddleware, getChallengeLeaderboard);
router.patch('/:id/status', authMiddleware, updateChallengeStatus);
router.delete('/:id', authMiddleware, deleteChallenge);
router.delete('/:id/decline', authMiddleware, declineChallenge);


export default router;