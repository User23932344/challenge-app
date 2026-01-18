import { Router } from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/progress/:progressId', authMiddleware, addComment);
router.get('/progress/:progressId', authMiddleware, getComments);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;