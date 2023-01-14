import { RequestHandler } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt"
import UserModel from "../models/users";

interface signUpBody{
    username?: string,
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, signUpBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;

    try {
        if(!username || !email || !passwordRaw) throw createHttpError(400, "Parameters missing.");

        const existingUsername = await UserModel.findOne({username: username,}).exec();

        if(existingUsername) throw createHttpError(409, "Username already taken. Please choose a different one or log in instead.")

        const existingEmail = await UserModel.findOne({email: email})

        if(existingEmail) throw createHttpError(409, "User with this email already exist. Please chooose a different one or log in instead.")

        // user does not exist if we reached here

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        const newUser = await UserModel.create({
            username: username,
            email: email,
            password: passwordHashed
        })

        return res.status(201).json({success: true, message: newUser})

    } catch (error) {
        next(error)
    }

}