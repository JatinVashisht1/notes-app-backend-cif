import "dotenv/config";
import express, { Express } from "express";

const app: Express = express();

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "home page" })
})

export default app;