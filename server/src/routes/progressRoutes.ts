import { Router } from 'express';
import { markProgress, 
    getChallengeProgress, 
    getMyProgress,
    uploadProof } from '../controllers/progressController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';


const router = Router();

router.post('/:challengeId', authMiddleware, markProgress);
router.get('/:challengeId', authMiddleware, getChallengeProgress);
router.get('/:challengeId/my', authMiddleware, getMyProgress);
router.post('/:progressId/upload', authMiddleware, upload.single('photo'), uploadProof);

export default router;