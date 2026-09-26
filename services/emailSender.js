import dotenv from "dotenv";
dotenv.config();

const RESEND_API_URL = "https://api.resend.com/emails";

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

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  if (!process.env.GMAIL_USER) {
    throw new Error("GMAIL_USER is missing");
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BuyerFinder <onboarding@resend.dev>",
        to: [to],
        subject,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);

      throw new Error(
        data?.message ||
          data?.error?.message ||
          "Failed to send email"
      );
    }

    console.log(
      "Email sent successfully:",
      data.id
    );

    return {
      success: true,
      messageId: data.id,
      source: "Resend API",
    };
  } catch (error) {
    console.error(
      "Resend email error:",
      error.message
    );

    throw new Error(
      error.message ||
        "Failed to send email"
    );
  }
};

