const express = require("express");
const dbo = require("./db/db");
const bodyParser = require('body-parser');
const app = express();
const port = 4445;
const jsonParser = bodyParser.json();

dbo.connectToServer();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.send("<h1>Bienvenue sur le Pokedick");
  });

app.get("/pokedex", jsonParser, function (req, res) {
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokemon");
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


//DELETE
app.delete("/pokedex/delete", jsonParser, function (req, res) {
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokedex");
  let list;
  if(req.body.name != undefined) list = poke.deleteOne({ name: req.body.name }, deleteCallBack);
  else if(req.body.num != undefined) list = poke.deleteOne({ num: req.body.num }, deleteCallBack);
  else if(req.body.type != undefined) list = poke.deleteOne({ type: req.body.type }, deleteCallBack);
  function deleteCallBack (err, result){
    if (err) {
      res.status(400).send("Error deleting pokemon");
    } else {
      res.status(400).send("Pokemon successfully deleted");
    }
  }
});

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });