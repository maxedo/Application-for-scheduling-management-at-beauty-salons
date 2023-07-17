const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const { Autentificare } = require('../Middleware/auth'); 
require('dotenv').config()

const db = mysql.createPool({
  host: process.env.HOSTDB,
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.DATABASE
});

router.get("/me",Autentificare, async(req,res)=>{
    const UtilizatorId=req.auth;
    try{
        const [result]=await db.execute("SELECT Nume FROM clienti WHERE UserId= ?",[UtilizatorId.id]);
        if(result[0]!=undefined)
            res.status(200).json(result[0]);
        else res.status(404).json({mesaj:"nu a fost gasit niciun user"});
    }catch(err){
        res.status(500).json(err);
        console.dir(err);
    }
    
});
router.post("/me",Autentificare, async(req,res)=>{
    const UtilizatorId=req.auth;
    const {Nume}=req.body;
    try{
        const [result]=await db.execute("INSERT INTO clienti(UserId,Nume) VALUES (?,?)",[UtilizatorId.id,Nume]);
        res.status(200).json({message:"Nume creat"});
    }catch(err){
        res.status(500).json(err);
        console.log(err);
        
    }
    
});

module.exports=router;