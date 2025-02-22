import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import client from "../client.js";
import config from "./config.js";

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
      passReqToCallback: true,
      scope: ["profile", "email", "https://mail.google.com/"],
      accessType: "offline",
      prompt: "consent",
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
      console.log(config.callBackURL)
      console.log("Google Profile:", profile);
      if (!refreshToken) {
        return done(new Error("No refresh token received from Google"));
      } 
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error("No email found in Google profile"));
      }
      const email = profile.emails[0]?.value;
      if (!email) {
        return done(new Error("Email field is missing"));
      }
      let user = await client.user.findUnique({
        where: { googleId: profile.id },
      });
        if (!user) {
          user = await client.user.create({
            data: {
              email,
              username: profile.displayName || profile.name?.givenName || "User",
              googleId: profile.id,
              accessToken,
              refreshToken
            },
          });
        } else {
          await client.user.update({
            where: { email },
            data: { accessToken, refreshToken },
          });
        }
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await client.user.findUnique({ 
      where: { id }
     });
    console.log("Deserializing user:", user);
    done(null, user);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

export default passport;
