import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';

import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const profileController = new ProfileController();

// All profile routes should be protected
router.use(AuthMiddleware.authenticate);

router.get('/me', profileController.getMyProfile);
router.put('/me', profileController.updateMyProfile);

export default router;