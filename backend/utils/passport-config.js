import 'dotenv/config';
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import client from "../client.js";
import config from "./config.js"

console.log("Using Google OAuth Redirect URI:", config.callBackURL);


passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await client.user.findUnique({
          where: { email },
        });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (!user.password) {
          return done(null, false, {
            message: "User registered with Google. Use Google login.",
          });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callBackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await client.user.findUnique({
          where: { googleId: profile.id },
        });
        if (!user) {
          user = await client.user.create({
            data: {
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
            },
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await client.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

