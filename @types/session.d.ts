import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

declare module "express-session" {
    interface SessionData {
        userId: mongoose.Types.ObjectId;
    }
}

declare global {
    namespace Express {
        interface User {
            id: string,
            token: string,
            email: string,
        }
        interface Request {
            jwt: JwtPayload | string,
            token: string,
          }
    }
}

declare module ""