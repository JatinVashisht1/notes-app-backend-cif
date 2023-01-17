import { Strategy } from "passport-google-oauth2";
import env from "./validateEnv";
import { VerifyFunctionWithRequest } from "passport-google-oauth2";

const GOOGLE_CLIENT_ID = env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = env.REDIRECT_URI;

const auth: VerifyFunctionWithRequest = (
    req,
    accessToken,
    refreshToken,
    profile,
    done) =>{
        profile.token = accessToken;
        return done(null, profile);
    }

export default new Strategy(
    {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_REDIRECT_URI,
        passReqToCallback: true,
        scope: ['email', 'profile', 'openid']
    },
    auth
)