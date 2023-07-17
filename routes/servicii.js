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



router.post("/servicii",Autentificare,async(req,res)=>{
  const UtilizatorId=req.auth;
  const {Denumire,Pret,Program,Durata}=req.body;
  try{
    const [cautareAdmin]=await db.execute("SELECT Rol_admin FROM utilizatori WHERE UserId=?",[UtilizatorId.id]);
    if(cautareAdmin[0].Rol_admin==1){
      const [cautareSalon]=await db.execute("SELECT IdSalon FROM saloane WHERE UserId=?",[UtilizatorId.id]);
      const [rand1]=await db.execute("INSERT INTO servicii(Denumire,Pret,Program,IdSalon,Durata) VALUES(?,?,?,?,?)",[Denumire,Pret,Program,cautareSalon[0].IdSalon,Durata]);
    }
    else res.status(408).json({mesaj:"Nu ai rolul de admininstrator"})
    
  }catch(err){
    console.log(err)
    res.status(500).json(err);
  }
});

router.get("/serviciiAdmin",Autentificare, async(req,res)=>{
  const UtilizatorId=req.auth;
  try{
    const [cautareAdmin]=await db.execute("SELECT Rol_admin FROM utilizatori WHERE UserId=?",[UtilizatorId.id]);
    if(cautareAdmin[0].Rol_admin==1){
      const [cautareSalon]=await db.execute("SELECT IdSalon FROM saloane WHERE UserId=?",[UtilizatorId.id]);
      const [rezserviciiAdmin]=await db.execute("SELECT IdServiciu,Denumire,Pret,Program,Durata FROM servicii WHERE IdSalon=?",[cautareSalon[0].IdSalon]);
      res.status(200).json(rezserviciiAdmin);
    }
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
})



router.get("/servicii/:IdSalon",async(req,res)=>{
  try{
    const [rez1]= await db.execute("SELECT IdServiciu,Denumire,Pret,Program,Durata FROM servicii WHERE IdSalon=?",[req.params.IdSalon]);
    res.status(200).json(rez1);
  }catch(err){
    res.status(500).json(err);
  }
});

router.delete("/servicii/:IdServiciu",Autentificare,async(req,res)=>{
  const UtilizatorId=req.auth;
  try{
    const [cautareAdmin]=await db.execute("SELECT Rol_admin FROM utilizatori WHERE UserId=?",[UtilizatorId.id]);
    if(cautareAdmin[0].Rol_admin==1){
      const[stergere2]=await db.execute("DELETE FROM programari WHERE IdServiciu=?",[req.params.IdServiciu])
      const [stergere]=await db.execute("DELETE FROM servicii WHERE IdServiciu=?",[req.params.IdServiciu]);
      res.status(200).json({message:"succes"})
    }
    else res.status(408).json({mesaj:"Nu ai rolul de administrator"});
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});


router.put("/servicii/:IdServiciu",Autentificare,async(req,res)=>{
  const UtilizatorId=req.auth;
  const {DenumirePUT,PretPUT,ProgramPUT,Durata}=req.body;
  try{
    const [cautareAdmin]=await db.execute("SELECT Rol_admin FROM utilizatori WHERE UserId=?",[UtilizatorId.id]);
    if(cautareAdmin[0].Rol_admin==1){
      const [actualizare]=await db.execute("UPDATE servicii SET Denumire=?,Pret=?,Program=?,Durata=? WHERE IdServiciu=?",[DenumirePUT,PretPUT,ProgramPUT,Durata,req.params.IdServiciu]);
      res.status(200).json({mesaj:"Actiunea a avut succes"});
    }
    else res.status(408).json({mesaj:"Nu ai rolul de administrator"});
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;