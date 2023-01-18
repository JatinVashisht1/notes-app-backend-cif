import "dotenv/config";
import express, { Express, NextFunction, Request, Response } from "express";
import createHttpError, {isHttpError} from "http-errors";
import morgan from "morgan"
import session from "express-session"
import notesRoutes from "../src/routes/notes"
import userRoutes from "../src/routes/users"
import env from "./util/validateEnv"
import MongoStore from "connect-mongo";
// import { requiresAuth } from "./middleware/auth";
import PassportManager from "./util/passportUtils";
import strategy from "./util/passportGoogleStrategy";
import * as jwtUtils from "./util/jwtUtil";

const SESSION_SECRET = env.SESSION_SECRET

const MONGO_URI = env.MONGO_CONNECTION_STRING

const app: Express = express();


app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60*60*1000,
    },
    // making rolling to true will keep user signed in if he comes back before the cookie expires
    // if user visits withing time limit then cookie will be refreshed and he will remain signed in
    rolling: true,
    store: MongoStore.create({
        mongoUrl: MONGO_URI
    }),
}));


const passportManager = new PassportManager(app);
passportManager.initialisePassport();
passportManager.useStrategy(strategy);

app.use('/api/notes', jwtUtils.authMiddleware, notesRoutes);

app.use('/api/users', userRoutes);

app.get('/protected', jwtUtils.authMiddleware);

app.use((req, res, next)=>{
   next(createHttpError(404,"Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "An unknown error occurred.";
    let statusCode = 500;
    if (isHttpError(error)){
        statusCode = error.status;
        errorMessage = error.message;
    } 
    return res.status(statusCode).json({ success: false, message: errorMessage });
});


export default app;