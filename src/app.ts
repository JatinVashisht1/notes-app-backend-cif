import "dotenv/config";
import express, { Express, NextFunction, Request, Response } from "express";
import createHttpError, {isHttpError} from "http-errors";
import morgan from "morgan"
import notesRoutes from "../src/routes/notes"
import userRoutes from "../src/routes/users"

const app: Express = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/notes', notesRoutes);

app.use('/api/users', userRoutes);

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