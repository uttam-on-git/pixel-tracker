import express from "express"
const authRouter = express.Router();
import bcrypt from "bcrypt";
import passport from "../utils/passport-config.js"
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
  if (request.isAuthenticated()) {
    response.json({ user: request.user });
  } else {
    response.status(401).json({ error: "Not authenticated" });
  }
});

authRouter.post("/login", passport.authenticate("local"),(request, response) => {
    response.json({
      message: "Loged in Successfully",
      user: request.user,
    });
  }
);

authRouter.get("/google",passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get("/google/callback",passport.authenticate("google",{ failureRedirect: config.FRONTEND_URL}),
    (request, response) => {
      response.redirect(config.FRONTEND_URL);
    }
  );

authRouter.get("/logout", (request, response, next) => {
  request.logout((err) => {
    if (err) return next(err);
    response.json({ message: "Logged out successfully" });
  });
});

export default authRouter
