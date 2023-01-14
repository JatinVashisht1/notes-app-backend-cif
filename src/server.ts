import express, {Express} from "express";

const app: Express = express();
const PORT = 5000;

app.get("/", (req, res)=>{
    res.status(200).json({success:true, message: "home page"})
})

app.listen(PORT, ()=>{
    console.log(`server up on http://localhost:${PORT}/`);
});