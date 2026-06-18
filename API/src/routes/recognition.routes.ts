import { Router } from 'express';
import multer from 'multer';
import { RecognitionController } from '../controllers/recognition.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const recognitionController = new RecognitionController();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage

router.post('/image', AuthMiddleware.authenticate, upload.single('image'), (req, res) => recognitionController.recognizeImage(req, res));

export default router;