import 'dotenv/config'
import config from './utils/config.js'
import express from "express";
const app = express();
import cors from "cors";
import session from "express-session";
import cookieParser from 'cookie-parser';
import passport from "./utils/passport-config.js"
import client from "./client.js";
import trackerRouter from "./controllers/tracker.js";
import composeRouter from "./controllers/compose.js";
import authRouter from "./controllers/auth.js";

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
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

app.get("/track", async (request, response) => {
  const { trackingId } = request.query;
  if (!trackingId){
    console.error('no trackingId provided')
    return response.status(400).json({ error: "No trackingId provided" });
  }
  try {
    console.log('recieved tracking request for id: ', trackingId)
    const tracker = await client.tracker.findUnique({
      where: { trackingId}
    })
    if (!tracker) {
      console.log('tracker not found')
      return response.status(404).json({ error: "Tracker not found" })
    }
    console.log('tracker found')
    if(tracker.status !== 'seen'){
      const updatedTracker = await client.tracker.update({
        where: trackingId,
        data: { status: 'seen', seenAt: new Date() }
      })
      console.log('tracker updated: ', updatedTracker)
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

export default app