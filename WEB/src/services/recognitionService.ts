import axiosInstance from '@/lib/axios';
import { API_PATHS } from '@/lib/api-paths';

export interface RecognitionResponse {
  name: string;
  description: string;
  confidence?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const recognitionService = {
  /**
   * Upload and recognize a landmark image
   * @param file - Image file to recognize
   * @returns Promise with landmark information
   */
  async recognizeImage(file: File): Promise<RecognitionResponse> {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axiosInstance.post<ApiResponse<RecognitionResponse>>(
        API_PATHS.RECOGNIZE.IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.message || 'Failed to recognize image');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your internet connection.');
      } else {
        // Error in request setup
        throw new Error(error.message || 'An error occurred while processing the image.');
      }
    }
  },
};