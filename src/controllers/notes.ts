import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import NoteModel from "../models/note"
import { assertIsDefined } from "../util/assertIsDefined";



/*
if we prefix any parameter with an underscore, like req here, it will work as _ in kotlin
i.e, it means we are not using the parameter int he function
*/
export const getNotes: RequestHandler = async (req, res, next) => {

    const jwtPayload = req.jwt as JwtPayload;
    const authenticatedUserId = jwtPayload.sub;
    

    
    /*
    if our code was synchronous then expree would have automatically called next function
    if will be changed in next major version of express
    node version as of writing the comment is 4.18.2
    default next function calling will be introduced for async code also
    */
   try {
        assertIsDefined(authenticatedUserId);

        // throw Error("An unknown error")
        const notes = await NoteModel.find({userId: authenticatedUserId}).exec();
        return res.status(200).json({ success: true, notes: notes });
    } catch (error) {
        next(error);
    }
};

export const getNote: RequestHandler = async(req, res, next)=>{
    const noteId = req.params.noteId;
    const jwtPayload = req.jwt as JwtPayload;
    const authenticatedUserId = jwtPayload.sub;
    try {

        assertIsDefined(authenticatedUserId)

        if(!mongoose.isValidObjectId(noteId)) throw createHttpError(400, "Invalid note id");

        const note = await NoteModel.findById(noteId).exec();
        
        if(!note) throw createHttpError(404, "Note not found.");

        if(!note.userId.equals(authenticatedUserId)) throw createHttpError(401, "You cannot access this note.")

        return res.status(200).json({success: true, message: note});
    } catch (error) {
        next(error);
    }
};

// all these fields are made optional because we don't know whether user sent these fields or not
interface CreateNoteBody{
    title?: string
    text?: string
}

// look up the documentation of RequestHandler to see the type parameters it takes
export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (req, res, next) => {

    const title = req.body.title;
    const text = req.body.text;
    
    const jwtPayload = req.jwt as JwtPayload;
    const authenticatedUserId = jwtPayload.sub;

    try {

        assertIsDefined(authenticatedUserId);

        if(!title) throw createHttpError(400, "Note must have a title.");

        const newNote = await NoteModel.create({
            userId: authenticatedUserId,
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

    const jwtPayload = req.jwt as JwtPayload;
    const authenticatedUserId = jwtPayload.sub;

    try {

        assertIsDefined(authenticatedUserId);

        if(!newTitle) throw createHttpError(400, "Note must have a title.");
        
        if(!mongoose.isValidObjectId(noteId)) throw createHttpError(400, "Invalid note id");

        const note = await NoteModel.findById(noteId).exec();

        if(!note) throw createHttpError(404, "Note not found.");
        
        if(!note.userId.equals(authenticatedUserId)) throw createHttpError(401, "You cannot access this note.")

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
    
    const jwt = req.jwt;
    const authenticatedUserIdStr = jwt['sub'];
    try {
        assertIsDefined(jwt);
        assertIsDefined(authenticatedUserIdStr);
        
        const authenticatedUserId = new mongoose.Types.ObjectId(authenticatedUserIdStr.toString());
        

        if(!mongoose.isValidObjectId(noteId)) throw createHttpError(400, "Invalid note id");

        
        const note = await NoteModel.findById(noteId).exec();
        
        if(!note) throw createHttpError(404, "Note not found.");
        
        if(!note.userId.equals(authenticatedUserId)) throw createHttpError(401, "You cannot access this note.")

        await note.remove()

        return res.status(200).json({success: true, message: "Note deleted successfully."})

    } catch (error) {
        next(error);
    }
}