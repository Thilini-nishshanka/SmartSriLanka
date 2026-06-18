import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';

interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    reply: string;
  };
}

export const sendMessageToBot = async (message: string): Promise<string> => {
  const response = await axiosInstance.post<ChatResponse>(API_PATHS.CHATBOT.CHAT, { message });
  if (response.data.success) {
    return response.data.data.reply;
  }
  throw new Error(response.data.message || 'Failed to get response from bot.');
};