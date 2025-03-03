import "dotenv/config";
import config from "./utils/config.js";
import express from "express";
const app = express();
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;
import cookieParser from "cookie-parser";
import passport from "./utils/passport-config.js";
import client from "./client.js";
import trackerRouter from "./controllers/tracker.js";
import composeRouter from "./controllers/compose.js";
import authRouter from "./controllers/auth.js";
import oauthRouter from "./controllers/oauth.js";
import path from 'path'

const PGStore = pgSession(session)
const pool = new Pool({
  connectionString: config.DATABASE_URI,
  ssl: { rejectUnauthorized: false}
})

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.static(path.join(process.cwd(), 'dist')))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new PGStore({
      pool: pool,
      tableName: 'session'
    }),
    secret: config.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  console.log("🔍 Checking Session Middleware...");
  console.log("🔹 Session ID:", req.sessionID);
  console.log("🔹 Session Data:", req.session);
  console.log("🔹 User:", req.user);
  next();
});


app.use("/tracker", trackerRouter);
app.use("/compose", composeRouter);
app.use("/auth", authRouter);
app.use("/oauth", oauthRouter)

app.get("/track", async (request, response) => {
  const { trackingId } = request.query;
  if (!trackingId) {
    console.error("no trackingId provided");
    return response.status(400).json({ error: "No trackingId provided" });
  }
  try {
    console.log("recieved tracking request for id: ", trackingId);
    const tracker = await client.tracker.findUnique({
      where: { trackingId },
    });
    if (!tracker) {
      console.log("tracker not found");
      return response.status(404).json({ error: "Tracker not found" });
    }
    console.log("tracker found");
    if (tracker.status !== "seen") {
      const updatedTracker = await client.tracker.update({
        where: { trackingId },
        data: { status: "seen", seenAt: new Date() },
      });
      console.log("tracker updated: ", updatedTracker);
    }

    const imgBuffer = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    response.writeHead(200, {
      "Content-Type": "image/gif",
      "Content-Length": imgBuffer.length,
    });
    response.end(imgBuffer);
  } catch (error) {
    console.error("Error processing tracking request:", error);
    response.status(500).json({ error: "Server error" });
  }
});

export default app;
