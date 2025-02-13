import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;
const EMAIL = process.env.EMAIL;
const PASS = process.env.PASS;
const SESSIONSECRET = process.env.SESSION_SECRET;
const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const callBackURL = process.env.GOOGLE_CALLBACK_URL
const DATABASE_URI = process.env.DATABASE_URL

export default {
  PORT,
  EMAIL,
  PASS,
  SESSIONSECRET,
  clientId,
  clientSecret,
  callBackURL,
  DATABASE_URI
};
