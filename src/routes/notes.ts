import express from "express"
import * as NotesController from "../controllers/notes"

const router = express.Router();

// not invoking with paranthesis because we are refering the function
router.get("/", NotesController.getNotes);

router.post("/", NotesController.createNote);

router.get("/:noteId", NotesController.getNote);

router.patch("/:noteId", NotesController.updateNote);

router.delete("/:noteId", NotesController.deleteNote);

export default router