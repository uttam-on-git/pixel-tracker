import express, { request, response } from "express";
const oauthRouter = express.Router();
import { google } from "googleapis";
import client from "../client.js";
import config from "../utils/config.js";

const oAuth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  config.callBackURL
);

oauthRouter.get("/connect", (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: "Not authenticated" });
  }
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
    prompt: "consent",
  });
  response.redirect(authUrl);
});

oauthRouter.get("/callback", async (request, response) => {
  const { code } = request.query;
  if (!code) {
    return response.status(400).json({ error: "No code provided" });
  }
  const { tokens }  = await oAuth2Client.getToken(code);
  await client.user.update({
    where: { id: request.user.id },
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    },
  });

  response.redirect(config.FRONTEND_URL);
});

export default oauthRouter;
