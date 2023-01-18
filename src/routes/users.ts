import express from "express"
import * as UserController from "../controllers/users"
// import { requiresAuth } from "../middleware/auth";
import * as jwtUtils from "../util/jwtUtil";

const router = express.Router();

router.post("/signup", UserController.signUp);

router.post("/login", UserController.login);

router.post("/loginGoogle", UserController.loginGoogle);

router.post("/logout", jwtUtils.authMiddleware, UserController.logout);

router.get("/", jwtUtils.authMiddleware , UserController.getAuthenticatedUser);


export default router;