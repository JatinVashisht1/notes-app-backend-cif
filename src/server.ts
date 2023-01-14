import "dotenv/config";
import mongoose from "mongoose";
import express, { Express } from "express";
import env from "./util/validateEnv"

const app: Express = express();
const PORT = env.PORT

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "home page" })
})

mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log(`mongoose connected`)
        app.listen(PORT, () => {
            console.log(`server up on http://localhost:${PORT}/`);
        });
    })
    // not invoking because we are referencing the function
    // similar to :: in kotlin
    .catch(console.error)
