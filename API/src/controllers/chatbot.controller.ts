import { Request, Response, NextFunction } from 'express';
import { ChatbotService } from '../services/chatbot.service';
import { ChatDto } from '../types/dto/chatbot.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppError } from '../utils/error.util';

export class ChatbotController {
  private chatbotService = new ChatbotService();

  public chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatData = plainToInstance(ChatDto, req.body);
      const errors = await validate(chatData);
      if (errors.length > 0) throw new AppError(`Validation failed: ${errors}`, 400);

      const botResponse = await this.chatbotService.generateResponse(chatData.message);
      res.status(200).json({ success: true, message: 'Response generated', data: { reply: botResponse } });
    } catch (error) {
      next(error);
    }
  };
}