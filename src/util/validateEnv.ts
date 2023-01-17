import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
    SESSION_SECRET: str(),
    CLIENT_SECRET: str(),
    CLIENT_ID: str(),
    REDIRECT_URI: str(),
})