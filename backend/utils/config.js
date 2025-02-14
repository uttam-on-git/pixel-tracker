import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 10000;
const EMAIL = process.env.EMAIL;
const PASS = process.env.PASS;
const SESSIONSECRET = process.env.SESSION_SECRET;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;
const DATABASE_URI = process.env.DATABASE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

export default {
  PORT,
  EMAIL,
  PASS,
  SESSIONSECRET,
  clientId,
  clientSecret,
  callbackURL,
  DATABASE_URI,
  FRONTEND_URL,
};
