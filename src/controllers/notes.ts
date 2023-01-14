import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
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
    const noteId = req.params.noteId;
    try {

        if(!mongoose.isValidObjectId(noteId)) throw createHttpError(400, "Invalid note id");

        const note = await NoteModel.findById(noteId).exec();

        if(!note) throw createHttpError(404, "Note not found.");
        return res.status(200).json({success: true, message: note});
    } catch (error) {
        next(error);
    }
};

interface CreateNoteBody{
    title?: string
    text?: string
}

// look up the documentation of RequestHandler to see the type parameters it takes
export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (req, res, next) => {

    const title = req.body.title;
    const text = req.body.text;
    
    try {

        if(!title) throw createHttpError(400, "Note must have a title.");

        const newNote = await NoteModel.create({
            title: title,
            text: text
        });
        res.status(201).json({success: true, message: newNote})
    } catch (error) {
        next(error)
    }
};

interface updateNoteParams{
    noteId: string,
}

interface updateNoteBody {
    title?: string,
    text?: string,
}
export const updateNote: RequestHandler<updateNoteParams, unknown, updateNoteBody, unknown> =async (req, res, next) => {
    const noteId = req.params.noteId;
    const newTitle = req.body.title;
    const newText = req.body.text;
    try {
        if(!newTitle) throw createHttpError(400, "Note must have a title.");
        
        if(!mongoose.isValidObjectId(noteId)) throw createHttpError(400, "Invalid note id");

        const note = await NoteModel.findById(noteId).exec();

        if(!note) throw createHttpError(404, "Note not found.");
        
        note.title = newTitle;
        note.text = newText;

        const updatedNote = await note.save();
        
        return res.status(200).json({success: true, message: updatedNote})
    } catch (error) {
        next(error)
    }
}

interface delteNoteParams{
    noteId: string,
}
export const deleteNote: RequestHandler<delteNoteParams, unknown, unknown, unknown> = async(req, res, next)=>{
    const noteId = req.params.noteId;
    
    try {
        if(!mongoose.isValidObjectId(noteId)) throw createHttpError(400, "Invalid note id");

        const note = await NoteModel.findById(noteId).exec();

        if(!note) throw createHttpError(404, "Note not found.");

        await note.remove()

        return res.status(200).json({success: true, message: "Note deleted successfully."})

    } catch (error) {
        next(error)
    }
}