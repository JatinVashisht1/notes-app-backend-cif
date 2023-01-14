import { RequestHandler } from "express";
import NoteModel from "../models/note"

/*
if we prefix any parameter with an underscore, like req here, it will work as _ in kotlin
i.e, it means we are not using the parameter int he function
*/
export const getNotes: RequestHandler = async (_req, res, next) => {
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
};

export const getNote: RequestHandler = async(req, res, next)=>{
    const noteId = req.params.noteId
    try {
        const note = await NoteModel.findById(noteId).exec()
        return res.status(200).json({success: true, message: note});
    } catch (error) {
        next(error);
    }
};

export const createNote: RequestHandler = async (req, res, next) => {

    const title = req.body.title;
    const text = req.body.text;
    
    try {
        const newNote = await NoteModel.create({
            title: title,
            text: text
        });
        res.status(201).json({success: true, message: newNote})
    } catch (error) {
        next(error)
    }
};