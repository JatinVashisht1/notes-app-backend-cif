import passport from "passport";
import { Express } from "express";
import { Strategy } from "passport-google-oauth2";

export default class PassportManager{
    app: Express;
    constructor(app: Express){
        this.app = app;
    }

    initialisePassport(){
        this.app.use(passport.initialize());

        this.app.use(passport.session());
    }

    useStrategy(strategy: Strategy){
        passport.use(strategy);

        passport.serializeUser((user, done)=>{
            done(null, user);
        })

        passport.deserializeUser((user: Express.User, done)=>{
            done(null, user);
        });        
    }

}