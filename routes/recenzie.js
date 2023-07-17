const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const { Autentificare } = require('../Middleware/auth'); 
const moment=require('moment');
require('dotenv').config()

const db = mysql.createPool({
  host: process.env.HOSTDB,
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.DATABASE
});

router.post("/recenzie/:Salon",Autentificare,async (req, res) => {
  const UtilizatorId=req.auth;
  const {Continut,Rating,Data_postarii}=req.body;
  try{
    const [rez1]=await db.execute("SELECT IdClient FROM clienti WHERE UserId= ?",[UtilizatorId.id]);
    const IdClient=rez1[0].IdClient;
    const [rez2]=await db.execute("INSERT INTO recenzie(IdSalon,IdClient,Continut,Rating,Data_postarii) VALUES(?,?,?,?,?)",[req.params.Salon,IdClient,Continut,Rating,Data_postarii]);
    res.status(200).json({message:"Recenzia a fost adaugata"})
  }catch(err){
    res.status(500).json(err);
    console.dir(err);
  }
});


router.get("/recenzie/:Salon",Autentificare,async (req,res)=>{
  try{
    const [rez3]=await db.execute("SELECT r.IdRecenzie,c.Nume,r.Continut,r.Rating,r.Data_postarii FROM recenzie AS r,clienti AS c WHERE IdSalon=? AND r.IdClient=c.IdClient",[req.params.Salon]);
    for(i=0;i<rez3.length;i++){
      rez3[i].Data_postarii=moment(rez3[i].Data_postarii).add(3,'hours');
    }
    res.status(200).json(rez3)
  }catch(err){
    res.status(500).json(err);
    console.dir(err);
  }
});


router.delete("/recenzie/:IdRecenzie",Autentificare,async(req,res)=>{
  const UtilizatorId=req.auth;
  try{
    // const [rez4]=await db.execute("SELECT IdClient FROM clienti WHERE UserId= ?",[UtilizatorId.id]);
    // const IdClient=rez1[0].IdClient;
    const [rez5]=await db.execute("DELETE FROM recenzie WHERE IdRecenzie=?",[req.params.IdRecenzie]);
    res.status(200).json({message:"Stergerea rencenziei a avut succes."});
  }catch(err){
    res.status(500).json(err);
    console.dir(err);
  }
})

module.exports = router;
