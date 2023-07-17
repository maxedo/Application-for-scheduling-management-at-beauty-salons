const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const moment=require('moment');
const { Autentificare } = require('../Middleware/auth'); 
require('dotenv').config()

const db = mysql.createPool({
  host: process.env.HOSTDB,
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.DATABASE
});


router.post("/programare/:IdServiciu",Autentificare,async (req,res)=>{
  const {dataprogramata,Ora}=req.body;
  const UtilizatorId=req.auth;
  try{
    const [cautareclient]=await db.execute("SELECT IdClient FROM clienti WHERE UserId=?",[UtilizatorId.id]);
    const [rand]=await db.execute("INSERT INTO programari(DataProgramare,Ora,IdClient,IdServiciu,Acceptat) VALUES(?,?,?,?,?)",[dataprogramata,Ora,cautareclient[0].IdClient,req.params.IdServiciu,false]);
    res.status(200).json({message:"Succes"})
  }catch(err){
    console.log()
    console.log(err)
    res.status(500).json(err)
  }

});

router.get("/programare/:IdSalon",Autentificare, async(req,res)=>{
  try{
    const [programari]=await db.execute("SELECT p.Id_Programare,p.DataProgramare, p.Ora,ser.Denumire FROM programari AS p, saloane AS s, servicii AS ser,clienti AS c  WHERE s.IdSalon=? AND p.IdClient=c.IdClient AND  s.IdSalon=ser.IdSalon  AND p.IdServiciu=ser.IdServiciu AND  p.Acceptat=1",[req.params.IdSalon] );
    res.status(200).json(programari);
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
});


router.get("/programare",Autentificare, async(req,res)=>{
  const UtilizatoId=req.auth;
  try{
    const [cautaresalon]=await db.execute("SELECT IdSalon FROM saloane WHERE UserId=?",[UtilizatoId.id])
    const [programari]=await db.execute("SELECT p.Id_Programare, p.DataProgramare, p.Ora,ser.Denumire, c.Nume FROM programari AS p, saloane AS s, servicii AS ser, clienti AS c WHERE p.IdClient=c.IdClient AND s.IdSalon=ser.IdSalon  AND p.IdServiciu=ser.IdServiciu AND s.IdSalon=? AND p.Acceptat=0",[cautaresalon[0].IdSalon]);
    for(i=0;i<programari.length;i++){
      programari[i].DataProgramare=moment(programari[i].DataProgramare).add(3,'hours');
    }
    res.status(200).json(programari);
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
});

router.get("/programareacceptate",Autentificare, async(req,res)=>{
  const UtilizatoId=req.auth;
  try{
    const [cautaresalon]=await db.execute("SELECT IdSalon FROM saloane WHERE UserId=?",[UtilizatoId.id])
    const [programari]=await db.execute("SELECT p.Id_Programare,p.DataProgramare, p.Ora,ser.Denumire, p.Acceptat,c.Nume FROM programari AS p, saloane AS s, servicii AS ser,clienti AS c  WHERE s.IdSalon=? AND p.IdClient=c.IdClient AND  s.IdSalon=ser.IdSalon  AND p.IdServiciu=ser.IdServiciu AND  p.Acceptat=1",[cautaresalon[0].IdSalon]);
    for(i=0;i<programari.length;i++){
      programari[i].DataProgramare=moment(programari[i].DataProgramare).add(3,'hours');
    }
    res.status(200).json(programari);
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
});


router.delete("/programare/:Id_Programare",Autentificare, async(req,res)=>{
  const UtilizatoId=req.auth;
  try{
    const [schimba]= await db.execute("DELETE FROM programari WHERE Id_Programare=?",[req.params.Id_Programare])
    res.status(200).json({message:"Succes"})
  }
  catch(err){
    console.log(err)
    res.status(500).json(err);
  }
});


router.put("/programare/:Id_Programare",Autentificare, async(req,res)=>{
  const UtilizatoId=req.auth;
  try{
    const [schimba]= await db.execute("UPDATE programari SET ACCEPTAT=1 WHERE Id_Programare=?",[req.params.Id_Programare])
    res.status(200).json({message:"Succes"})
  }
  catch(err){
    res.status(500).json(err);
  }
});

router.get("/programareUser",Autentificare, async(req,res)=>{
  const UtilizatorId=req.auth;
  try {
    const [rez1]=await db.execute("SELECT IdClient FROM clienti WHERE UserId= ?",[UtilizatorId.id]);
    const [utilizator]= await db.execute("SELECT p.Id_Programare,p.DataProgramare, p.Ora,ser.Denumire, p.Acceptat,s.Nume_Salon FROM programari AS p, saloane AS s, servicii AS ser,clienti AS c  WHERE p.IdClient=? AND p.IdClient=c.IdClient AND  s.IdSalon=ser.IdSalon  AND p.IdServiciu=ser.IdServiciu AND  p.Acceptat=1",[rez1[0].IdClient])
    res.status(200).json(utilizator)
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
})


module.exports = router;