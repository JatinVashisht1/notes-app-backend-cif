import { InferSchemaType, model, Schema } from "mongoose";

const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
    },
}, {
    // will manage timestamps for our database out of the box
    timestamps: true
});

// will create a type for our notes inferring from our schema
type Note = InferSchemaType<typeof noteSchema>

export default model<Note>("Note", noteSchema)