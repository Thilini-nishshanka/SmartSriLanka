import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';

const router = Router();
const chatbotController = new ChatbotController();

// POST /api/v1/chatbot/chat
router.post('/chat', chatbotController.chat);

export default router;