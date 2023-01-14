import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    
    // select: false
    // it means email and password will not be returned to us when we'll fetch the user.
    // we have to request it explicitly
    email: {
        type: String,
        required: true,
        select: false,
        unique: true,
    },
    
    password: {
        type: String,
        required: true,
        select: false,
        unique: true,
    },

});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);