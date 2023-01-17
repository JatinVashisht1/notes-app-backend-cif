import express from "express";
import passport from "passport";

const router = express.Router();

router.get('/', passport.authenticate('google', { scope: ['email', 'profile', 'openid'] }))

router.get('/callback', passport.authenticate('google', {
    successRedirect: '/api/notes',
    failureRedirect: '/'
}));

export default router;