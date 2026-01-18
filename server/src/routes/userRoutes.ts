import { Router } from 'express';
import { searchUsers, getUserProfile } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/search', authMiddleware, searchUsers);
router.get('/:id', authMiddleware, getUserProfile);

export default router;