const express = require("express");
const dbo = require("./db/db");
const bodyParser = require('body-parser');
const app = express();
const port = 4444;
const jsonParser = bodyParser.json();
var ObjectId = require('mongodb').ObjectID;
var cors = require('cors');

dbo.connectToServer();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", function (req, res) {
  res.send("<h1>Bienvenue sur le Pokedick</h1>");
});


const Pokemon = require('pokemon.js');
 
Pokemon.setLanguage('french');

app.get("/pokemon/set", async function (req, res) {
  let i = 1;
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokemon");
  while(true){
    await Pokemon.getPokemon(i).then((p) =>{
      console.log(p.name);
      let insert = {};
      insert.name = p.name;
      insert.num = p.id;
  
      insert.type = [];
      let err = undefined;
      p.types.forEach(elm => {
        GetType(elm["name"], 1).then((t) , t.toArray(function (err, result) {
          if (err) {
            err = err;
          } else {
            insert.type.push(result[0]._id);
          }
        }));
      });
      if(err != undefined){
        res.status(400).send("Error fetching type!");
        return;
      }
      
      insert.genera = p.genera;
      insert.sprites = p.sprites
  
      poke.insertOne(
        {...insert},
        function (err, result) {
          if (err) throw err;
       }
      );
    });
    i++;
  }
});


//GET
  //Pokedex
  app.get("/pokedex", jsonParser, function (req, res) {
    const dbConnect = dbo.getDb();
    const poke = dbConnect.collection("pokedex");
    let list;
    if(req.query.name != undefined) list = poke.find({name: new RegExp('.*' + req.query.name + '.*', 'i')});
    else if(req.query.num != undefined) list = poke.find({num: { $eq: req.query.num }});
    else list = poke.find({});
    if(req.query.limit != undefined) list.limit(parseInt(req.query.limit));
    list.toArray(function (err, result) {
      if (err) {
        res.status(400).json({err :"Error fetching pokemons!"});
      } else {
        res.status(200).json(result);
      }
    });      
  });

    //Pokedex
app.get("/pokemon", jsonParser, function (req, res) {
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokemon");
  let list;
  if(req.query.name != undefined) list = poke.find({name: new RegExp('.*' + req.query.name + '.*', 'i')});
  else if(req.query.num != undefined) list = poke.find({num: { $eq: parseInt(req.query.num) }});
  else list = poke.find({});
  if(req.query.limit != undefined) list.limit(parseInt(req.query.limit));
  list.toArray(function (err, result) {
    if (err) {
      res.status(400).json({err :"Error fetching pokemons!"});
    } else {
      res.status(200).json(result);
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

async function GetType(name, limit){
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
  if(req.body.type != undefined){
    update.type = [];
    let err = undefined;
    req.body.type.forEach(elm => {
      GetType(elm, 1).toArray(function (err, result) {
        if (err) {
          err = err;
        } else {
          update.type.push(result[0]._id);
        }
      });
    });
    if(err != undefined){
      res.status(400).send("Error fetching type!");
      return;
    }
  }
  
  poke.updateOne(
    {...search},
    {$set : {...update}},
    function (err, result) {
      if (err) throw err;
      res.status(200).json(result);
   }
  );
});

app.post("/pokemon/update", jsonParser, function (req, res) {
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokemon");

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
  if(req.body.type != undefined){
    update.type = [];
    let err = undefined;
    req.body.type.forEach(elm => {
      GetType(elm, 1).toArray(function (err, result) {
        if (err) {
          err = err;
        } else {
          update.type.push(result[0]._id);
        }
      });
    });
    if(err != undefined){
      res.status(400).send("Error fetching type!");
      return;
    }
  }
  
  poke.updateOne(
    {...search},
    {$set : {...update}},
    function (err, result) {
      if (err) throw err;
      res.status(200).json(result);
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
        res.status(200).json(result);
     }
    );
  });

//Insert

  //Pokedex
  app.post("/pokedex/insert", jsonParser, function (req, res) {
    const dbConnect = dbo.getDb();
    const poke = dbConnect.collection("pokedex");

    let insert = {};
    if(req.body.name == undefined || req.body.type == undefined || req.body.num == undefined){
      res.status(400).send("Tout les paramètres ne sont pas envoyés.");
      return;
    }

    insert.name = req.body.name;
    insert.num = req.body.num;

    insert.type = [];
    let err = undefined;
    req.body.type.forEach(elm => {
      GetType(elm, 1).toArray(function (err, result) {
        if (err) {
          err = err;
        } else {
          insert.type.push(result[0]._id);
        }
      });
    });
    if(err != undefined){
      res.status(400).send("Error fetching type!");
      return;
    }
    
    poke.insertOne(
      {...insert},
      function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
     }
    );
  });

    //Pokemon
  app.post("/pokemon/insert", jsonParser, function (req, res) {
    const dbConnect = dbo.getDb();
    const poke = dbConnect.collection("pokemon");

    let insert = {};
    if(req.body.name == undefined || req.body.type == undefined || req.body.num == undefined){
      res.status(400).send("Tout les paramètres ne sont pas envoyés.");
      return;
    }

    insert.name = req.body.name;
    insert.num = req.body.num;

    insert.type = [];
    let err = undefined;
    req.body.type.forEach(elm => {
      GetType(elm, 1).toArray(function (err, result) {
        if (err) {
          err = err;
        } else {
          insert.type.push(result[0]._id);
        }
      });
    });
    if(err != undefined){
      res.status(400).send("Error fetching type!");
      return;
    }
    
    if( req.body.genera == undefined || req.body.genera == "") insert.genera = "Pokemon";
    else insert.genera = req.body.genera;
    insert.sprites = {};
    if(req.body.sprites == undefined) { insert.sprites["front_default"] = "https://clipground.com/images/interrogation-point-clipart-4.jpg";}
    else insert.sprites["front_default"] = req.body.sprites;

    poke.insertOne(
      {...insert},
      function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
     }
    );
  });

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
        res.status(200).json(result);
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

    if(Object.keys(search).length === 0){
      res.status(400).send("Aucun paramètre.");
      return;
    }

    poke.deleteOne(
      {...search},
      function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
     }
    );
  });

//pokedex
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
      res.status(200).send("Pokemon successfully deleted");
    }
  }
});

//pokemon
app.delete("/pokemon/delete", jsonParser, function (req, res) {
  const dbConnect = dbo.getDb();
  const poke = dbConnect.collection("pokemon");
  let list;
  if(req.body.uid != undefined) list = poke.deleteOne({ _id: ObjectId(req.body.uid) }, deleteCallBack);
  else if(req.body.name != undefined) list = poke.deleteOne({ name: req.body.name }, deleteCallBack);
  else if(req.body.num != undefined) list = poke.deleteOne({ num: req.body.num }, deleteCallBack);
  else if(req.body.type != undefined) list = poke.deleteOne({ type: req.body.type }, deleteCallBack);
  function deleteCallBack (err, result){
    if (err) {
      res.status(400).send("Error deleting pokemon");
    } else {
      res.status(200).send("Pokemon successfully deleted");
    }
  }
});

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });