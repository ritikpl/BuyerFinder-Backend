import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  message,
}) => {
  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!message) {
    throw new Error("Email message is required");
  }

  if (!process.env.GMAIL_USER) {
    throw new Error(
      "GMAIL_USER is missing in .env"
    );
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      "GMAIL_APP_PASSWORD is missing in .env"
    );
  }

  try {
    const info = await transporter.sendMail({
      from: {
        name:
          process.env.EMAIL_FROM_NAME ||
          "BuyerFinder",
        address: process.env.GMAIL_USER,
      },
      to,
      subject,
      text: message,
    });

    console.log(
      "Email sent successfully:",
      info.messageId
    );

    return {
      success: true,
      messageId: info.messageId,
      source: "Gmail SMTP",
    };
  } catch (error) {
    console.error(
      "Gmail SMTP error:",
      error.message
    );

    throw new Error(
      error.message ||
        "Failed to send email"
    );
  }
};




