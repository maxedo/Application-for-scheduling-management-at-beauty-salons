const jwt = require("jsonwebtoken");
const express=require("express");
const router = express.Router();


require('dotenv').config()
async function Autentificare(req,res,next){
    const Headercerere=req.headers.authorization;
    const jeton=Headercerere.split('Bearer ')[1];
    if(jeton==null){
        return res.status(401).json({message:"Acces neautorizat"})
    }
    jwt.verify(jeton,process.env.ACCESS_TOKEN_SECRET,async (err,UserId)=>{
        try{
            if(err){
                return res.status(403).send(err);
            }else{
                req.auth=UserId;
                next();  
            }
        }catch(e){
            res.status(422).send("Jeton invalid")
        }
        
    

    })
}
module.exports = {Autentificare};