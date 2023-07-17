const express = require("express");
const router = express.Router();
const multer=require('multer')
const { check, validationResult } = require("express-validator");
const mysql = require("mysql2/promise");
const { Autentificare } = require('../Middleware/auth'); 
require('dotenv').config()


const db = mysql.createPool({
  host: process.env.HOSTDB,
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.DATABASE
});


const filtruimagine = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Doar fisierele de tip imagine sunt permise.", false);
  }
};

const stocare= multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'E:/Android studio apps/NodeJS_API/poze')
  },
  filename: function (req, file, cb) {
    const sufixunic = Date.now() + '-' + Math.round(Math.random() * 1E9);
    originalName=file.originalname;
    const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
    cb(null, file.fieldname + '-' + sufixunic+fileExtension)
  }
})

const upload = multer({ storage: stocare,fileFilter: filtruimagine })


router.get("/saloanecautare/:Nume_Salon", async(req,res)=>{
 
  try{
    const [rand]= await db.execute(`SELECT IdSalon,Nume_salon,Descriere_Salon,Adresa,Program, Imagine_Coperta,Nr_frizeri FROM saloane WHERE Nume_salon LIKE '%${req.params.Nume_Salon}%'`,);
    res.status(200).json(rand);
  }
  catch(err){
    res.status(500).json(err);
  }
})


router.get("/saloane", async(req,res)=>{
    try{
      const [randuri]=await db.execute("SELECT IdSalon,Nume_salon,Descriere_Salon,Adresa,Program, Imagine_Coperta,Nr_frizeri FROM saloane ORDER BY RAND()");
      res.status(200).json(randuri);   
    }
    catch (err) {
      console.log(err)
      res.status(500).json(err);
  }
});

router.get("/saloaneAdmin",Autentificare, async(req,res)=>{
    const UtilizatorId=req.auth;
    try{
      const [rez1]=await db.execute("SELECT IdSalon,Nume_salon,Descriere_Salon,Adresa,Program, Imagine_Coperta, Nr_frizeri FROM saloane WHERE UserId=?",[UtilizatorId.id]);
      if(rez1.length!==0){
        res.status(200).json(rez1[0]);
      }
      else res.status(404).json({mesaj:"nu a fost gasit niciun salon"});
    }catch(err){
      console.log(err)
      res.status(500).json(err)
    }
})

router.post("/saloane",Autentificare,upload.single('image'), async(req,res)=>{
  const UtilizatorId=req.auth;
  const {Nume_Salon,Descriere_Salon,Adresa,Program,Nr_frizeri}=req.body;
  const {filename,path}=req.file;
  try{
    const [ver]=await db.execute("SELECT Rol_admin FROM utilizatori WHERE UserId=?",[UtilizatorId.id]);
    if(ver[0].Rol_admin===1){
      const [rezultat]=await db.execute("INSERT INTO saloane (UserId,Nume_Salon,Descriere_Salon,Adresa,Program,Imagine_Coperta,Nr_frizeri,Path_poza) VALUES(?,?,?,?,?,?,?,?)",[UtilizatorId.id,Nume_Salon,Descriere_Salon,Adresa,Program,filename,Nr_frizeri,path]);
      res.status(200).json({message:"Realizare Salon cu succes"});
    }
    else{
      res.status(408).json({message:"Nu ai rolul de administrator"})
    }
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/saloane",Autentificare,async(req,res)=>{
  const UtilizatorId=req.auth;
  const {Nume_Salon,Descriere_Salon,Adresa,Program,Nr_frizeri}=req.body;
  try{
    const [ver1]=await db.execute("SELECT Rol_admin FROM utilizatori WHERE UserId=?",[UtilizatorId.id]);
    if(ver1[0].Rol_admin===1){
      const [rez2]=await db.execute("UPDATE saloane SET Nume_Salon=?,Descriere_Salon=?,Adresa=?,Program=?,Nr_frizeri=? WHERE UserId=?",[Nume_Salon,Descriere_Salon,Adresa,Program,Nr_frizeri,UtilizatorId.id]);
      res.status(200).json({message:"Realizare Salon cu succes"});
    }
    else{
      res.status(408).json({message:"Nu ai rolul de administrator"})
    }
  }
  catch(err){
    console.log(err)
    res.status(500).json(err);
  }

})


module.exports = router;