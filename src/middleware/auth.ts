// import { RequestHandler } from "express";
// import createHttpError from "http-errors";
// import UserModel from "../models/users";
// import bcrypt from "bcrypt";

// interface userBodyWithGoogle {
//     email: string,
//     id: string,
//     token: string,
//     username: string,
// }

// export const requiresAuth: RequestHandler = async (req, res, next) => {
//     try {

//         if (req.session.userId) {
//             req.isAuthenticated = () => { return true; };
//             next();
//         }
//         else if (req.isAuthenticated()) {
//             console.log(req.user)
//             const user = req.user;

//             const userDb = await UserModel.findOne({ username: user.email}, 'google.id').exec();
            

//             if (!userDb) {
//                 console.log(`auth.ts: req.isAuthenticated() ===> ${req.isAuthenticated()}, \nuserDb ===> ${JSON.stringify(userDb)}`)

//                 const accessTokenEncrypted = bcrypt.hashSync(user.token, 10);


//                 const userBody: userBodyWithGoogle = {
//                     email: user.email,
//                     id: user.id,
//                     token: accessTokenEncrypted,
//                     username: user.email
//                 }
//                 console.log(`user is ${JSON.stringify(userBody)}`)
//                 const newUserDb = await UserModel.create({
//                     username: userBody.username,
//                     local: null,
//                     google: {
//                         emailGoogle: userBody.email,
//                         id: userBody.id,
//                         accessToken: userBody.token,
//                     },
//                     // google: null,
//                 })

//                 req.session.userId = newUserDb._id;
//                 next();
//             } else {
//                 if (!userDb.google) {
//                     throw createHttpError(401, "You have not used this authentication method while logging in.")
//                 }
//                 console.log(`id: ${user.id}, google id ${userDb.google.id} google ${JSON.stringify(userDb.google)}`)


//                 if(user.id !== userDb.google.id) {
//                     req.logOut({keepSessionInfo: false}, (err)=>{if(err) throw(err)});
//                     throw createHttpError(401, "Unauthorized access. Or use different login method.");
//                 }

//                 req.session.userId = userDb._id;
//                 next();
//             }

//         }
//         else {
//             next(createHttpError(401, "User not authenticated."));
//         }
//     } catch (error) {
//         next(error);
//     }
// }

