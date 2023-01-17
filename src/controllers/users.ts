import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/users";
import * as jwtUtils from "../util/jwtUtil";
import { OAuth2Client } from "google-auth-library";
import { assertIsDefined } from "../util/assertIsDefined";
import env from "../util/validateEnv";
import { LoginTicket } from "google-auth-library/build/src/auth/loginticket";

export const getAuthenticatedUser: RequestHandler = async (req, res, next)=>{
    const authenticatedUserId = req.session.userId;

    try {
        // if(!authenticatedUserId) throw createHttpError(401, "User not authenticated.")

        const user = await UserModel.findById(authenticatedUserId).select("+email").exec()

        return res.status(200).json({success: true, message: user})

    } catch (error) {
        next(error)
    }
}

interface signUpBody{
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, signUpBody, unknown> = async (req, res, next) => {
    const email = req.body.email;
    const passwordRaw = req.body.password;

    try {
        if(!email || !passwordRaw) throw createHttpError(400, "Parameters missing.");

        const existingEmail = await UserModel.findOne({email: email,}).exec();
        
        if(existingEmail) throw createHttpError(409, "Email already taken. Please choose a different one or log in instead.")

        // user does not exist if we reached here

        const {salt, hash} = jwtUtils.genPassword(passwordRaw);

        const newUser = await UserModel.create({
            email: email,
            password: {
                salt: salt,
                hash: hash,
            },
        })

        const id = newUser.id;

        const jwt = jwtUtils.issueJWT(id);

        return res.status(201).json({success: true, message: jwt});

    } catch (error) {
        next(error)
    }
}

interface loginBody{
    email?: string,
    password?: string,
}
export const login: RequestHandler<unknown, unknown, loginBody, unknown> = async(req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;

    try {
        if(!email || !password) throw createHttpError(400, "Parameters missing.");

        const user = await UserModel.findOne({email: email}).exec();

        if(!user) throw createHttpError(401, "Invalid credentials.");

        const passwordHashed = user.password;
        if(!passwordHashed || !passwordHashed.salt || !passwordHashed.hash) throw createHttpError(401, "Login with google to continue");
        
        const passwordJwtType: jwtUtils.passwordType = {
            salt: passwordHashed.salt,
            hash: passwordHashed.hash,
        };

        const isPasswordValid = jwtUtils.validPassword(password, passwordJwtType);

        if(!isPasswordValid) throw createHttpError(401, "Invalid credentials");

        req.session.userId = user._id;
        req.isAuthenticated = () => {return true};

        const jwt = jwtUtils.issueJWT(user._id);

        return res.status(201).json({success: true, message: jwt});


    } catch (error) {
        next(error);
    }
};

export const logout: RequestHandler = async (req, res, next)=>{
    
    // this does not return a promise, instead it returns a callback
    req.session.destroy(error => {
        if(error) next(error)
        else{
            res.status(200).json({success: true, message: "User logged out successfully."});
        }
    })
}

interface loginGoogleBody{
    idToken?: string,
}
export const loginGoogle: RequestHandler<unknown, unknown, loginGoogleBody, unknown> = async (req, res, next)=>{

    const idToken = req.body.idToken;
    const CLIENT_ID = env.CLIENT_ID;
    try {
        assertIsDefined(idToken);
        const email = await verify(idToken, CLIENT_ID);
        assertIsDefined(email);
        let userDb = await UserModel.findOne({email: email}).exec();
        if(!userDb){
            const newUser = await UserModel.create({
                email: email,
            })
            userDb = newUser;
        }

        const jwt: jwtUtils.jwtType = jwtUtils.issueJWT(userDb._id);
        return res.status(200).json({success: true, message: jwt});
        
    } catch (error) {
        next(error);
    }
    
}

async function verify(idToken: string, clientId: string) {
    const client = new OAuth2Client();
    const ticket: LoginTicket = await client.verifyIdToken({
        idToken: idToken,
        audience: clientId,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    if(!payload) throw createHttpError(401, "Unauthorized access.");
    // const userid = payload['sub'];
    return payload['email'];
    
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }