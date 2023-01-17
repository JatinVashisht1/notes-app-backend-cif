import { InferSchemaType, model, Schema } from "mongoose";

// const localSchema = new Schema({
//     password: {
//         type: String,
//         select: false,
//         required: true,
//     },
//     emailLocal: {
//         type: String,
//         required: true,
//         select: false,
//         // unique: true,
//     },
// });

// const googleSchema = new Schema({
//     id: {
//         type: String,
//         required: true,
//         select: false,
//         // unique: true,
//     },
//     accessToken: {
//         type: String,
//         required: true,
//         select: false,
//         // unique: true,
//     },
    
// })


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

    // select: false
    // it means email and password will not be returned to us when we'll fetch the user.
    // we have to request it explicitly

    password:{
        type: passwordType,
        required: false,
        unique: false,
    }

});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);