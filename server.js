const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const mongoUser = process.env.USER;
const mongoPass = process.env.PASS;
mongoose.connect(`mongodb://${mongoUser}:${mongoPass}@ds135817.mlab.com:35817/crossworld`);
mongoose.connection.on("error", ()=>console.log("connection-error"));

let crosswordSchema = new mongoose.Schema({
    data:{
        lines: Number,
        columns: Number,
        words: Object
    },
    solutions: Object
});

let CrosswordModel = mongoose.model("CrosswordModel", crosswordSchema);

let database = [];

app.use(express.static(__dirname+"/assets"));

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    CrosswordModel.find({}, (err,users)=>{
        let arr = [];
        users.forEach(user=>arr.push(user));
        database = arr;
        res.render("crossworld-list", {list:database});
    });
});

app.get("/cw/:id/", (req,res)=>{
    let id = req.params.id;
    res.render("crossworld-client.ejs", {id:id});
});


app.post("/save", (req,res)=>{
    let crosswordDocument = new CrosswordModel(req.body);
    crosswordDocument.save((err)=>(err) ? console.log("save error") : null);
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