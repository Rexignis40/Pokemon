const express = require("express");
const dbo = require("./db/db");
const bodyParser = require('body-parser');
const app = express();
const port = 4444;
const jsonParser = bodyParser.json();
var ObjectId = require('mongodb').ObjectID;

dbo.connectToServer();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.send("<h1>Bienvenue sur le Pokedick");
  });

//GET
  //Pokedex
app.get("/pokedex", jsonParser, function (req, res) {
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokedex");
  let list;
  if(req.query.name != undefined) list = poke.find({name: { $eq: req.query.name }});
  else if(req.query.num != undefined) list = poke.find({num: { $eq: req.query.num }});
  else list = poke.find({});
  if(req.query.limit != undefined) list.limit(parseInt(req.query.limit));
  list.toArray(function (err, result) {
    if (err) {
      res.status(400).send("Error fetching pokemons!");
    } else {
      res.json(result);
    }
  });      
});

  //Type
app.get("/type", jsonParser, function (req, res) {
       GetType(req.query.name, req.query.limit).toArray(function (err, result) {
        if (err) {
          res.status(400).send("Error fetching type!");
        } else {
          res.json(result);
        }
      });
});

function GetType(name, limit){
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("type");
  let list;
  if(name != undefined) list = poke.find({name: { $eq: name }});
  else list = poke.find({});
  if(limit != undefined) list.limit(parseInt(limit));
  return list; 
}

//POST

//Pokedex
app.post("/pokedex/update", jsonParser, function (req, res) {
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokedex");

  let search;
  let update = {};
  if(req.body.search != undefined && req.body.search.num != undefined) search = {num: req.body.search.num};
  else if(req.body.search != undefined && req.body.search.name != undefined) search = {name: req.body.search.name};
  else{
    res.status(400).send("Not id or name to update pokemon");
    return;
  }

  if(req.body.name != undefined) update.name = req.body.name;
  if(req.body.num != undefined) update.num = req.body.num;
  if(req.body.type != undefined) update.type = req.body.type;
  
  poke.updateOne(
    {...search},
    {$set : {...update}},
    function (err, result) {
      if (err) throw err;
      res.status(400).json(result);
   }
  );
});

  //Type
  app.post("/type/update", jsonParser, function (req, res) {
    const dbConnect = dbo.getDb();
    const poke = dbConnect.collection("type");
  
    let search;
    let update = {};
    if(req.body.search != undefined && req.body.search.name != undefined) search = {name: req.body.search.name};
    else{
      res.status(400).send("Not id or name to update type");
      return;
    }
    if(req.body.name != undefined) update.name = req.body.name;

    poke.updateOne(
      {...search},
      {$set : {...update}},
      function (err, result) {
        if (err) throw err;
        res.status(400).json(result);
     }
    );
  });

//Insert

  //Type
  app.post("/type/insert", jsonParser, function (req, res) {
    const dbConnect = dbo.getDb();
    const poke = dbConnect.collection("type");

    let insert = {};
    if(req.body.name != undefined) insert.name = req.body.name;

    poke.insertOne(
      {...insert},
      function (err, result) {
        if (err) throw err;
        res.status(400).json(result);
     }
    );
  });

//Delete

  //Type
  app.delete("/type/delete", jsonParser, function (req, res) {
    const dbConnect = dbo.getDb();
    const poke = dbConnect.collection("type");

    let search = {};
    if(req.body.name != undefined) search.name = req.body.name;
    if(req.body.id != undefined) search._id = ObjectId(req.body.id);

    console.log({...search});
    if(Object.keys(search).length === 0){
      res.status(400).send("Aucun paramètre.");
      return;
    }

    poke.deleteOne(
      {...search},
      function (err, result) {
        if (err) throw err;
        res.status(400).json(result);
     }
    );
  });

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });