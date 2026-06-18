import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { localUpload } from '../services/upload.service';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const uploadController = new UploadController();

router.post('/image', AuthMiddleware.authenticate, localUpload, uploadController.uploadImage);

export default router;