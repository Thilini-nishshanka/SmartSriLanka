import nodemailer from 'nodemailer';

// Interface for the contact form data
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Interface for the email template structure
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// 1. Create a reusable transporter object
const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: Number(process.env['SMTP_PORT'] || 587),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
});

// Verify connection configuration on startup
transporter.verify((error, _success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

// 2. Define email templates
const emailTemplates = {
  contactMessage: (data: ContactFormData): EmailTemplate => ({
    subject: `New Contact Form Message: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Message from Contact Form</h2>
        <p>You have received a new message from your website's contact form.</p>
        <hr>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <h3>Message:</h3>
        <p style="padding: 10px; border-left: 3px solid #ccc;">${data.message.replace(/\n/g, '<br>')}</p>
      </div>
    `,
    text: `
      New Message from Contact Form
      -----------------------------
      Name: ${data.name}
      Email: ${data.email}
      Subject: ${data.subject}
      Message:
      ${data.message}
    `,
  }),
};

// 3. Create the Email Service Class
export class ContactEmailService {
  static async send(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const template = emailTemplates.contactMessage(data);
      const mailOptions = {
        from: `"${data.name}" <${process.env['SMTP_USER']}>`, // Use system email as sender for better deliverability
        to: process.env['ADMIN_EMAIL'],
        replyTo: data.email, // Set the user's email as the reply-to address
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending contact form email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
  }
}