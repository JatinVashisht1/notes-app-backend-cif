import { InferSchemaType, model, Schema } from "mongoose";

const passwordType = new Schema({
    salt: String,
    hash: String,
});

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },

    password:{
        type: passwordType,
        required: false,
        unique: false,
    },

    tokens: {
        type: [String],
        required: false,
        unique: false,
        default: null,
    }

});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);