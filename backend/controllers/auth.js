import express from "express";
const authRouter = express.Router();
import bcrypt from "bcrypt";
import passport from "../utils/passport-config.js";
import client from "../client.js";
import config from "../utils/config.js";

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
  if (request.isAuthenticated() && request.user) {
    response.json({
      email: request.user.email,
      username: request.user.username,
      accessToken: request.user.accessToken,
      refreshToken: request.user.refreshToken,
    });
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

authRouter.get("/google", (req, res, next) => {
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.status(500).json({ error: "Session could not be saved" });
    }
    passport.authenticate("google", {
      scope: ["profile", "email", "https://mail.google.com/"],
      accessType: "offline",
      prompt: "consent",
    })(req, res, next);
  });
});

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.FRONTEND_URL}/login`,
    failureMessage: true,
  }),
  async (request, response) => {
    try {
      if (!request.user) {
        console.error("No user data in request");
        return response.status(401).json({ error: "Authentication failed" });
      }

      await new Promise((resolve, reject) => {
        request.login(request.user, (error) => {
          if (error) reject(error);
          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        request.session.save((err) => {
          if (err) reject(err);
          resolve();
        });
      });

      response.redirect(config.FRONTEND_URL);
    } catch (error) {
      console.error("Authentication error:", error);
      response.status(500).json({ error: "Authentication failed" });
    }
  }
);
authRouter.get("/logout", (request, response, next) => {
  request.logout((err) => {
    if (err) return next(err);
    response.json({ message: "Logged out successfully" });
  });
});

export default authRouter;
