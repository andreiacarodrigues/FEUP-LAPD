const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');
const https = require("https");
const config = require('./config/config');

// Database Name
const url = 'mongodb://localhost:27017';
const dbName = config.dbName;

app.get('/init', function (req, res) {
    const cinemaData = require('./databaseinit.js');
    res.send('Created database!');
});

app.get('/', function (req, res) {
    res.send();
});

app.get('/movies', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('movies').find({}).project({ 'name': 1, 'imageurl': 1, 'genre': 1, 'duration': 1, 'minAge': 1 }).toArray(function (err, docs) {
            if (err)
                throw err;
            res.send(docs)
        });
    });
});


app.get('/movie/:name', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('movies').createIndex({ name: "text" })
        db.collection('movies').find({ $text: { $search: req.params.name } }).project({ '_id': 0 }).toArray(function (err, docs) {
            if (err)
                throw err;
            if(docs.length == 1)
                res.send(docs[0])
            else
                res.send(docs);
        });
    });
});




app.get('/movieID/:id', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        let id = req.params.id;
        if (id.indexOf('\"') >= 0) {
            id = JSON.parse(id)
        }
        db.collection('movies').findOne({ _id: new ObjectId(id)}, function (err, info) {
            if (err)
                throw err;
            res.send(info)
        });
    });
});

app.get('/debuts', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('debuts').find({}).project({ 'name': 1, 'imageurl': 1, 'genre': 1, 'duration': 1, 'minAge': 1 }).toArray(function (err, docs) {
            if (err)
                throw err;
            res.send(docs)
        });
    });
});

app.get('/debutID/:id', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        let id = req.params.id;
        if (id.indexOf('\"') >= 0) {
            id = JSON.parse(id)
        }
        db.collection('debuts').findOne({ _id: new ObjectId(id)}, function (err, info) {
            if (err)
                throw err;
            res.send(info)
        });
    });
});

app.get('/debut/:name', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('debuts').createIndex({ name: "text" })
        db.collection('debuts').find({ $text: { $search: req.params.name } }).project({ '_id': 0 }).toArray(function (err, docs) {
            if (err)
                throw err;
            if (docs.length == 1)
                res.send(docs[0])
            else
                res.send(docs);
        });
    });
});


app.get('/listCinemas', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('cinemas').find({}).project({'name': 1, 'address': 1 }).toArray(function (err, docs) {
            if (err)
                throw err;
            res.send(docs)
        });
    });
});

app.get('/cinemaID/:id', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        let id = req.params.id;
        if (id.indexOf('\"') >= 0) {
            id = JSON.parse(id)
        }
        db.collection('cinemas').findOne({ _id: new ObjectId(id)}, function (err, info) {
            if (err)
                throw err;
            res.send(info)
        });
    });
});

app.get('/cinema/:name', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('cinemas').createIndex({ name: "text" })
        db.collection('cinemas').find({ $text: { $search:  req.params.name } }).project({ '_id': 0, 'movies': 1 }).toArray(function (err, docs) {
            if (err)
                throw err;
            if (docs.length == 1)
                res.send(docs[0])
            else
                res.send(docs);
        });
    });
});

app.get('/localizations', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('cinemas').find({}).project({ movies: false, address: false, telephone: false }).toArray(function (err, docs) {
            if (err)
                throw err;
            res.send(docs)
        });
    });
});

app.listen(3000, () => {
    console.log('Listening on port 3000!');
});
