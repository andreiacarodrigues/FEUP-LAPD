const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const https = require("https");
const GooglePlaces = require('node-googleplaces');
const config = require('./config/config');

// Database Name
const url = 'mongodb://localhost:27017';
const dbName = config.dbName;
const googleplaces = new GooglePlaces(config.googleplacesKey);

app.get('/init', function () {
    const cinemaData = require('./databaseinit.js');
    res.send('Created database!');
});

app.get('/', function (req, res) {
    res.send('Database API');
});

app.get('/movies', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('movies').find({}).project({ '_id': 0 }).toArray(function (err, docs) {
            if (err)
                throw err;
            res.send(docs)
        });
    });
});

app.get('/cinemas', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('cinemas').find({}).project({'_id': 0 }).toArray(function (err, docs) {
            if (err)
                throw err;
            res.send(docs)
        });
    });
});

app.get('/localizations', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { return console.dir(err); }
        const db = client.db(dbName);
        db.collection('cinemas').find({}).project({ '_id': false, movies: false, address: false, telephone: false}).toArray(function (err, docs) {
            if (err)
                throw err;
            res.send(docs)
        });
    });
});

app.listen(3000, () => {
    console.log('Listening on port 3000!');
});
