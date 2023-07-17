const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
require('dotenv').config()
const { check, validationResult } = require("express-validator");
const mysql = require("mysql2/promise");


const db = mysql.createPool({
  host: process.env.HOSTDB,
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.DATABASE
});


router.route("/signup").post(async (req, res) => {
  check("Prenume").isLength({ min: 3 }),
  check("Nume_familie").isLength({min:3}),
  check("Email").isEmail(),
  check("DAN").isDate(),
  check("Parola_utilizator").isLength({ min: 4 })

  const errors = validationResult(req); 
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { Prenume, Nume_familie, Email, DAN, Parola_utilizator, Rol_admin } =
    req.body;
  try {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Parola_utilizator, salt);
    const [result] = await db.execute(
      "INSERT INTO utilizatori (Prenume,Nume_familie, email,DAN, Parola_utilizator,Rol_admin) VALUES (?, ?, ?,?, ?, ?)",
      [Prenume, Nume_familie, Email, DAN, hashedPassword, Rol_admin]
    );
    res.status(200).json({ message: "Utilizator creat" });
  } catch (err) {
    res.status(500).json(err);
    console.dir(err);
  }
});

module.exports = router;
