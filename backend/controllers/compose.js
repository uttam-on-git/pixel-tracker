import express, { response } from "express";
const composeRouter = express.Router();
import client from "../prisma.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import config from "../utils/config.js";

composeRouter.post("/", async (request, response) => {
  const { recipient, subject, body } = request.body;
  const userId = request.user ? request.user.id : null;
  if (!recipient || !subject || !body) {
    response
      .status(400)
      .json({ error: "Please provide recipient, subject, and body" });
  }
  const trackingId = uuidv4();
  try {
    const tracker = await client.tracker.create({
      data: { trackingId, recipient, subject, body, userId },
    });
    const trackingPixelUrl = `http://localhost:${config.PORT}/track?trackingId=${trackingId}`;
    const emailBody = `${body}<br/><img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.EMAIL,
        pass: config.PASS,
      },
    });
    const mailOptions = {
      from: config.EMAIL,
      to: recipient,
      subject,
      html: emailBody,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Error sending email" });
      }
      res.json({ message: "Email sent successfully", tracker });
    });
  } catch (error) {
    console.error("Error in compose endpoint:", error);
    res.status(500).json({ error: "Error creating tracker" });
  }
});

export default composeRouter
