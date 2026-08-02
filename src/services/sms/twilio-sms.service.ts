import dotenv from "dotenv";
import Twilio from "twilio";

dotenv.config();

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

async function sendSMS() {
  try {
    const message = await client.messages.create({
      body: "Hello from Twilio + TypeScript 🚀",
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: "+1234567890", // replace with recipient number
    });

    console.log("Message sent:", message.sid);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}
