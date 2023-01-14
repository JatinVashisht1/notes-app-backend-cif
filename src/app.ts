import "dotenv/config";
import express, { Express, NextFunction, Request, Response } from "express";
import NoteModel from "./models/note"

const app: Express = express();

app.get("/", async (req, res, next) => {
    /*
    if our code was synchronous then expree would have automatically called next function
    if will be changed in next major version of express
    node version as of writing the comment is 4.18.2
    default next function calling will be introduced for async code also
    */
    try {
        // throw Error("An unknown error")
        const notes = await NoteModel.find().exec();
        return res.status(200).json({ success: true, notes: notes });
    } catch (error) {
        next(error);
    }
});

app.use((req, res, next)=>{
   next(Error("Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) errorMessage = error.message;
    return res.status(500).json({ success: false, message: errorMessage });
});

export default app;