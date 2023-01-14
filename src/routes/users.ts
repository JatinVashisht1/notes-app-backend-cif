import express from "express"
import * as UserController from "../controllers/users"

const router = express.Router();

router.post("/signup", UserController.signUp);

router.post("/login", UserController.login);

router.post("/logout", UserController.logout);

router.get("/", UserController.getAuthenticatedUser);


export default router;