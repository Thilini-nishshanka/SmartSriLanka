import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';

export class UploadController {
  uploadImage = (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 'No image file uploaded.', 400);
      }

      // Return the relative path to the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      sendSuccess(res, { url: fileUrl }, 'Image uploaded successfully.');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };
}