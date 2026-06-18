import { Request, Response } from "express";
import { ZodError } from "zod";
import { ContactEmailService } from "../services/email.service";
import { contactFormSchema } from "../utils/Validation";
import { sendSuccess, sendError } from "../utils/response.util";

export class ContactController {
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validatedData = contactFormSchema.parse(req.body);

      // Send email using the static method
      const result = await ContactEmailService.send(validatedData);

      if (!result.success) {
        // The service has already logged the error, send a generic message to the client
        return sendError(res, "Failed to send the message. Please try again later.", 500);
      }

      // Respond with success
      sendSuccess(res, { success: true }, "Message sent successfully");
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Handle validation errors
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return sendError(res, "Validation failed", 400, validationErrors);
      }
      // Handle other unexpected errors
      console.error("Error in sendMessage controller:", error);
      sendError(res, "An unexpected server error occurred.", 500);
    }
  };
}
