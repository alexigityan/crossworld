const express = require("express");
const app = express();

app.use(express.static(__dirname+"/assets"));

app.get("/",(req,res)=>res.render("crossworld-redactor.html"));

app.listen(3000, ()=>console.log("crossworld server listening on 3000"));