import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/users";
import * as jwtUtils from "../util/jwtUtil";
import { OAuth2Client } from "google-auth-library";
import { assertIsDefined } from "../util/assertIsDefined";
import env from "../util/validateEnv";
import { LoginTicket } from "google-auth-library/build/src/auth/loginticket";
import jwtDbChecker from "../util/jwtDbChecker";

export const getAuthenticatedUser: RequestHandler = async (req, res, next)=>{
    const authenticatedUserId = req.jwt.sub;

    try {
        if(!authenticatedUserId) throw createHttpError(401, "User not authenticated.")

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
        
        await newUser.update({$push: {tokens: jwt.token}}).exec();
        // await newUser.save();


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

        const jwt = jwtUtils.issueJWT(user._id);

        await user.update({$push: {tokens: jwt.token}}).exec();

        return res.status(201).json({success: true, message: jwt});


    } catch (error) {
        next(error);
    }
};

export const logout: RequestHandler = async (req, res, next)=>{
    const jwt = req.jwt;
    const token = req.token;
    try {
        if(!jwt) throw createHttpError(401, "Unauthorized access");
        if(!token) throw createHttpError(401, "Unauthorized access");
        const userId = jwt['sub']?.toString() || "";
        const userDb = await UserModel.findOne({id: userId}).exec();
        if(!userDb) {
            next(createHttpError(401, "Unauthorized access."));
        }else{

            // console.log(`token req and token db comparison ${token===userDb.tokens![0]}`);
            // console.log(`token req\n${token}\ntoken db ${userDb.tokens![0]}`);

            const jwtExist = jwtDbChecker(userId, req.token);
            if(!jwtExist){
                next(createHttpError(400, "User is not logged in."));
            }else{
                // await userDb.update({$pullAll: {tokens: token}}).exec();
                const userUpdated = await UserModel.updateOne({_id: userDb._id}, {
                    $pull:{
                        tokens: token
                    },
                }).exec();
                // console.log(`user updated is ${JSON.stringify(userUpdated)}`);
                if(userUpdated['acknowledged'])
                    return res.status(200).json({success: true, message: "User logged out successfully!"});
                else throw createHttpError(500, "Unable to logout.");
            }
            
        }
    } catch (error) {
        next(error);
    }
}

interface loginGoogleBody{
    idToken?: string,
}
export const loginGoogle: RequestHandler<unknown, unknown, loginGoogleBody, unknown> = async (req, res, next)=>{

    const idToken = req.body.idToken;
    const CLIENT_ID = env.CLIENT_ID;
    try {
        console.log(`id token is ${idToken}`)
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