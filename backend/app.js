import 'dotenv/config';
import config from './utils/config.js'
import express from "express";
const app = express();
import cors from "cors";
import session from "express-session";
import passport from "passport";
import client from "./prisma.js";
import trackerRouter from "./controllers/tracker.js";
import composeRouter from "./controllers/compose.js";
import authRouter from "./controllers/auth.js";

app.use(
  cors({
    origin: " http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: config.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/tracker", trackerRouter);
app.use("/compose", composeRouter);
app.use("/auth", authRouter);

app.get("/track", async (req, res) => {
  const { trackingId } = req.query;
  if (!trackingId)
    return res.status(400).json({ error: "No trackingId provided" });

  try {
    const tracker = await client.tracker.update({
      where: { trackingId },
      data: { status: "seen", seenAt: new Date() },
    });
    if (!tracker) return res.status(404).json({ error: "Tracker not found" });

    const imgBuffer = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": imgBuffer.length,
    });
    res.end(imgBuffer);
  } catch (error) {
    console.error("Error processing tracking request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default app