import { JwtPayload } from "jsonwebtoken";

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