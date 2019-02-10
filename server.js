const express = require("express");
const app = express();
const bodyParser = require("body-parser");

let database;

app.use(express.static(__dirname+"/assets"));

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>res.render("crossworld-redactor.html"));


app.post("/save", (req,res)=>{
    console.log(req.body);
    database = req.body;
    res.end();
});

app.post("/check", (req,res)=>{
    console.log(req.body);
    let check = req.body;
    let wrongWords = [];
    for (let id in check) {
        if (!(check[id] === database.solutions[id])) {
            wrongWords.push(id);
        }
    }
    res.send(wrongWords);
});

app.post("/solveword", (req,res)=>{
    console.log(req.body);
    let id = req.body;

    if (database.solutions[id]) {
        res.send(database.solutions[id]);
    } else {
        res.end();
    }

});

app.get("/load", (req,res)=>{
    console.log(database);
    res.send(database.data);
});

app.listen(3000, ()=>console.log("crossworld server listening on 3000"));