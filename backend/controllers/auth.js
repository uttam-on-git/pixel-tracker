import express from "express";
const authRouter = express.Router();
import bcrypt from "bcrypt";
import passport from "../utils/passport-config.js";
import client from "../client.js";
import config from "../utils/config.js";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  config.callBackURL
)

authRouter.post("/register", async (request, response) => {
  const { username, password, email } = request.body;
  try {
    const existedUser = await client.user.findUnique({
      where: { email },
    });
    if (existedUser) {
      return response.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await client.user.create({
      data: { username, email, password: hashedPassword },
    });
    response.json({ message: "User registered successfully", user });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

authRouter.get("/session", (request, response) => {
  console.log("User session:", request.user);
  if (request.isAuthenticated()) {
    response.json({ user: request.user });
  } else {
    response.status(401).json({ error: "Not authenticated" });
  }
});

authRouter.post(
  "/login",
  passport.authenticate("local"),
  (request, response) => {
    response.json({
      message: "Loged in Successfully",
      user: request.user,
    });
  }
);

authRouter.get("/google", (request, response, next) => {
  console.log("Redirecting to Google OAuth...");
  console.log("Redirect URI:", config.callBackURL);
  next();
}, passport.authenticate("google", { 
  scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.send"],
  accessType: "offline",
  prompt: "consent"
})
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: config.FRONTEND_URL }),
   async (request, response) => {
    if (!request.user || !request.user.emails || request.user.emails.length === 0) {
      console.error("Google OAuth Error: No email received from Google");
      return response.status(400).json({ error: "Google did not return an email." });
    }
    const { id, displayName, emails } = request.user;
    const email = emails[0].value
    const tokens = request.authInfo

    await client.user.upsert({
      where: { googleId: id },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      },
      create: {
        username: displayName,
        email: email,
        googleId: id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      },
    });
    response.redirect('/dashboard')
  }
);

authRouter.get("/logout", (request, response, next) => {
  request.logout((err) => {
    if (err) return next(err);
    response.json({ message: "Logged out successfully" });
  });
});

export default authRouter;
