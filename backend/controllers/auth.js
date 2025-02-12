import express, { request, response } from "express";
const authRouter = express.Router();
import bcrypt from "bcrypt";
import passport from "passport";
import client from "../prisma.js";

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
    res.json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "google/callback",
  passport.authenticate(
    "google",
    {
      failureRedirect: "http://localhost:3000/login",
    },
    (request, response) => {
      response.redirect("http://localhost:3000");
    }
  )
);

authRouter.get("/logout", (request, response) => {
  request.logout((err) => {
    if (err) return response.status(500).json({ error: "Logout error" });
    response.json({ message: "Logged out successfully" });
  });
});

export default authRouter
