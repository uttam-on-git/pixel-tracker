import express from "express";
const composeRouter = express.Router();
import client from "../client.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import config from "../utils/config.js";
import { google } from "googleapis";
import passport from "../utils/passport-config.js";

const getNewAccessToken = async (user) => {
  const oAuth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.callBackURL
  );
  oAuth2Client.setCredentials({ refresh_token: user.refreshToken });

  try {
    const { token } = await oAuth2Client.getAccessToken();
    console.log("New Access Token Generated:", token);
    await client.user.update({
      where: { id: user.id },
      data: { accessToken: token },
    });
    return token;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw new Error("Google authentication failed. Reconnect your account.");
  }
};

composeRouter.post(
  "/",
  passport.authenticate("session"),
  async (request, response) => {
    console.log("User in request when composing email:", request.user);
    const { recipient, subject, body } = request.body;
    console.log("request body", request.body)
    const user = request.user;
    console.log("User Data in Request:", user);
    console.log("Using Refresh Token:", user.refreshToken);
    console.log("Using Access Token:", user.accessToken);
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
    try {
      const accessToken = await getNewAccessToken(user);
      console.log("Using new Access Token:", accessToken);

      const trackingId = uuidv4();

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
      const trackingPixelUrl = `${config.BACKEND_URL.replace(/\/$/, '')}/track?trackingId=${trackingId}`;
      const emailBody = `${body}<br/><img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: user.email,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          refreshToken: user.refreshToken,
          accessToken: accessToken,
          expires: 3600
        },
        secure: false,
        tls: {
          rejectUnauthorized: false,
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
          return response.status(500).json({ error: "Error sending email" });
        }
        response.json({ message: "Email sent successfully", tracker });
      });
    } catch (error) {
      console.error("Error in compose endpoint:", error);
      response.status(500).json({ error: "Error creating tracker" });
    }
  }
);

export default composeRouter;
