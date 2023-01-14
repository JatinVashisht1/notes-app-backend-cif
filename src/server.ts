import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";

const PORT = env.PORT

mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log(`mongoose connected`)
        app.listen(PORT, () => {
            console.log(`server up on http://localhost:${PORT}/`);
        });
    })
    // not invoking because we are referencing the function
    // similar to :: in kotlin
    .catch(console.error);
