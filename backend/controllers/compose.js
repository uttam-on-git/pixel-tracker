import express from "express";
const composeRouter = express.Router();
import client from "../client.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import config from "../utils/config.js";
import { google } from "googleapis";

composeRouter.post("/", async (request, response) => {
  const { recipient, subject, body } = request.body;
  const user = request.user;
  if (!user || !user.email || !user.accessToken || !user.refreshToken) {
    return response
      .status(400)
      .json({ error: "User not authenticated or Gmail not linked" });
  }
  if (!recipient || !subject || !body) {
    return response
      .status(400)
      .json({ error: "Please provide recipient, subject, and body" });
  }
  const trackingId = uuidv4();
  try {
    const tracker = await client.tracker.create({
      data: {
        trackingId,
        recipient,
        subject,
        body,
        userId: user.id,
        status: "sent",
      },
    });
    const trackingPixelUrl = `https://pixel-tracker-bypd.onrender.com/track?trackingId=${trackingId}`;
    const emailBody = `${body}<br/><img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`;

    const oAuth2Client = new google.auth.OAuth2(
      (config.clientId, config.clientSecret, config.callBackURL)
    );

    oAuth2Client.setCredentials({
      refresh_token: user.refreshToken,
    });

    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: user.email,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
    const mailOptions = {
      from: user.email,
      to: recipient,
      subject,
      html: emailBody,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Error sending email" });
      }
      response.json({ message: "Email sent successfully", tracker });
    });
  } catch (error) {
    console.error("Error in compose endpoint:", error);
    response.status(500).json({ error: "Error creating tracker" });
  }
});

export default composeRouter;
