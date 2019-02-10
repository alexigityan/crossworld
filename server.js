const express = require("express");
const app = express();
const bodyParser = require("body-parser");

let database = [];

app.use(express.static(__dirname+"/assets"));

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>res.render("crossworld-list", {list:database}));

app.get("/cw/:id/", (req,res)=>{
    let id = req.params.id;
    res.render("crossworld-client.ejs", {id:id});
});


app.post("/save", (req,res)=>{
    database.push(req.body);
    res.end();
});

app.post("/check/:id", (req,res)=>{
    let id = parseInt(req.params.id);
    let check = req.body;
    let wrongWords = [];
    for (let word in check) {
        if (!(check[word] === database[id].solutions[word])) {
            wrongWords.push(word);
        }
    }
    if (wrongWords.length>0)
        res.send(wrongWords);
    else
        res.send("w");
});

app.post("/solveword/:id", (req,res)=>{
    let id = parseInt(req.params.id);
    let word = req.body;

    if (database[id].solutions[word]) {
        res.send(database[id].solutions[word]);
    } else {
        res.end();
    }

});

app.get("/load/:id", (req,res)=>{
    let id = parseInt(req.params.id);
    res.send(database[id].data);
});

app.listen(3000, ()=>console.log("crossworld server listening on 3000"));