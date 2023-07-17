const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const mysql = require("mysql2/promise");
require('dotenv').config()

const db = mysql.createPool({
  host: process.env.HOSTDB,
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.DATABASE
});


router.post("/login", [
    check("Email").isEmail(),
    check("Parola_utilizator").isLength({ min: 4 })
], async (req, res) => {
    const eroare = validationResult(req);
    if (!eroare.isEmpty()) {
        return res.status(422).json({ eroare: eroare.array() });
    }
    
    const { Email,Parola_utilizator } = req.body;
    try {
        
        const [rows] = await db.execute("SELECT * FROM utilizatori WHERE Email = ?", [Email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Credidentiale invalide" });
        }
        
        const potrivire = await bcrypt.compare(Parola_utilizator, rows[0].Parola_utilizator);
        if (!potrivire) {
            return res.status(401).json({ message: "Credidentiale invalide" });
        }
        const rol_utilizator=rows[0].Rol_admin;
        const token = jwt.sign({ id: rows[0].UserId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token,rol_utilizator});
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

module.exports = router;
