const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const assert = require("assert");
const https = require("https");
const config = require("./config/config");

// Database Name
const url = "mongodb://localhost:27017";
const dbName = config.dbName;

app.get("/init", async (req, res) => {
  try {
    const cinemaData = await require("./databaseinit.js");
    return res.send("Created database!");
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/", (req, res) => {
  return res.send();
});

app.get("/movies", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const docs = await db
      .collection("movies")
      .find({})
      .project({ name: 1, imageurl: 1, genre: 1, duration: 1, minAge: 1 })
      .toArray();
    return res.json(docs);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/movies/:name", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    await db.collection("movies").createIndex({ name: "text" });
    const docs = await db
      .collection("movies")
      .find({ $text: { $search: req.params.name } })
      .project({ _id: 0 })
      .toArray();
    return res.json(docs);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/movieID/:id", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    let id = req.params.id;

    if (id.indexOf('"') >= 0) {
      id = JSON.parse(id);
    }

    const info = await db.collection("movies").findOne({ _id: new ObjectId(id) });
    return res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/debuts", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const docs = await db
      .collection("debuts")
      .find({})
      .project({
        name: 1,
        imageurl: 1,
        genre: 1,
        duration: 1,
        minAge: 1
      })
      .toArray();
    return res.json(docs);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/debutID/:id", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    let id = req.params.id;
    if (id.indexOf('"') >= 0) {
      id = JSON.parse(id);
    }
    const info = await db.collection("debuts").findOne({ _id: new ObjectId(id) });
    res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/debut/:name", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const info = await db
      .collection("debuts")
      .find({ $text: { $search: req.params.name } })
      .project({ _id: 0 })
      .toArray();
    res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/listCinemas", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const info = await db
      .collection("cinemas")
      .find({})
      .project({ name: 1, address: 1 })
      .toArray();
    res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/cinemaID/:id", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    let id = req.params.id;
    if (id.indexOf('"') >= 0) {
      id = JSON.parse(id);
    }
    const info = await db.collection("cinemas").findOne({ _id: new ObjectId(id) });
    res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/cinema/:name", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const info = await db
      .collection("cinemas")
      .find({ $text: { $search: req.params.name } })
      .project({ _id: 0, movies: 1 })
      .toArray();
    res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/localizations", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const info = await db
      .collection("cinemas")
      .find({})
      .project({ movies: false, address: false, telephone: false })
      .toArray();
    res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
