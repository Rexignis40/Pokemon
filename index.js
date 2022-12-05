const express = require("express");
const dbo = require("./db/db");
const bodyParser = require('body-parser');
const app = express();
const port = 4444;

dbo.connectToServer();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.send("<h1>Bienvenue sur le Pokedick");
  });

app.get("/pokedex", function (req, res) {
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

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });