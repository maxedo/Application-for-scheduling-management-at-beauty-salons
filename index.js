const express = require("express");
const cors = require('cors');
const multer=require('multer');
const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

app.use("/poze",express.static("poze"));

const signupRouter = require("./routes/signup.js");
const loginRouter=require("./routes/login");
const recenzieRouter=require("./routes/recenzie");
const MeRouter=require("./routes/me");
const SalonRouter=require("./routes/saloane");
const ServiciiRouter=require("./routes/servicii");
const ProgramareRouter=require("./routes/programare");

app.use(signupRouter);
app.use(loginRouter);
app.use(recenzieRouter);
app.use(MeRouter);
app.use(SalonRouter);
app.use(ServiciiRouter);
app.use(ProgramareRouter);



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});