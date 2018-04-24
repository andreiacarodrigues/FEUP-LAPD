const imdb = require('imdb-api');
const cheerio = require('cheerio');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config/config');
const imdbKEY = config.imdbKey;
const dbName = config.dbName;
const Throttle = require("promise-parallel-throttle");

const express = require('express');
const app = express();

const get_site = async url => {
  console.log("get_site", url);
  const response = await axios.get(url);
  if (response.status != 200) {
    throw Error("get_site error", response.status, "url");
  }
  return response;
};

const get_imdb = async id => {
  // console.log("get_imdb", id);
  return await imdb.getById(id, { apiKey: imdbKEY, timeout: 3000 });
};

const scrap_cinema = response => {
  let $ = cheerio.load(response.data);
  let cinema = {
    name: $("#contentsNoSidebar > div:nth-child(1) > div.cinemaMorada.vcard > h1").text(),
    geo: [
      {
        latitude: $("#filmePosterDiv > a > div.geo > span.latitude").text(),
        longitute: $("#filmePosterDiv > a > div.geo > span.longitude").text()
      }
    ],
    address: $('#filmeInfoDiv > div > div.street-address').text() + ' ' + $('#filmeInfoDiv > div > div > span.locality').text() + ' ' + $('#filmeInfoDiv > div > div> span.postal-code').text(),
    telephone: $('#filmeInfoDiv > div > p > span[itemprop=telephone]').text(),
    movies: []
  };

  $("#contentsNoSidebar > div").each((_, element) => {
    if ($("h2", element).text() != "") {
      let movie = {
        name: $("h2", element).text(),
        url: "https://filmspot.pt" + $("h2 > a:nth-child(2)", element).attr("href"),
        rooms: []
      };
      let tables = $(".cinemaTabelaSessoes > tbody", element);
      tables.each((_, table) => {
        let room = {
          name: $("tr:nth-child(1)", table).text(),
          sessions: []
        };
        $("tr:not(:first-child)", table).each((_, tr) => {
          $("td", tr).each((_, td) => {
            const hourText = $(td)
              .contents()
              .first()
              .text()
              .trim();
            if (hourText)
              room.sessions.push({
                day: $("th", tr).text(),
                hour: hourText
              });
          });
        });
        movie.rooms.push(room);
      });
      cinema.movies.push(movie);
    }
  });

  return cinema;
};

const scrap_movie = response => {
  let $ = cheerio.load(response.data);
  let genres = []
  $("#filmeInfoDivRight > p > span[itemprop=genre]").each(function (i, element) {
    genres.push($(this).text())
  });

  movie =  {
    name: $("#contentsNoSidebar > div > h1 > span[itemprop=name]").text(),
    description: $("#filmeInfoDivLeft > div[itemprop=description]").text(),
    imageurl: $("#filmePosterDiv > p > a").attr("href"),
    imdbtitle: $("#contentsNoSidebar > div:nth-child(1) > h1 > span.tituloOriginal").text(),
    realizacao: $("#filmeInfoDivLeft > p> span[itemprop=director]").text(),
    director: $("#filmeInfoDivLeft > p> span[itemprop=producer]").text(),
    author: $("#filmeInfoDivLeft > p> span[itemprop=author]").text(),
    imdbURL: $("#filmeInfoDivLeft > p> a[itemprop=sameAs]").text(),
    duration: ($(" #filmeInfoDivRight > p > span[itemprop=duration]").text().replace('T', '')).replace('M', ''),
    genre: genres.toString(),
    minAge: $("#filmeInfoDivRight > div > p > span[itemprop=contentRating]").text(),
    publishedDate: $("#filmeInfoDivRight > div > p > span[itemprop=datePublished]").text(),
    trailer: 'https://filmspot.pt' + $('#filmePosterDiv > div > a').attr('href'),
    url: response.config.url
  }

  if (movie.imdbtitle == "" ) {
    movie.imdbtitle = movie.name;
  }
  if (movie.imageurl == "") {
    movie.imageurl = "https://filmspot.com.pt/images/layout/poster_default.jpg";
  }
  if (movie.minAge == "") {
    movie.minAge = 'N/A';
  }

  return movie;
};

const scrap_movieDebut = response => {
  let $ = cheerio.load(response.data);
  let genres = []
  $("#filmeInfoDivRight > p > span[itemprop=genre]").each(function (i, element) {
    genres.push($(this).text())
  });

  movie = {
    name: $("#contentsNoSidebar > div > h1 > span[itemprop=name]").text(),
    description: $("#filmeInfoDivLeft > div[itemprop=description]").text(),
    imageurl: $("#filmePosterDiv > p > a").attr("href"),
    imdbtitle: $("#contentsNoSidebar > div:nth-child(1) > h1 > span.tituloOriginal").text(),
    realizacao: $("#filmeInfoDivLeft > p> span[itemprop=director]").text(),
    director: $("#filmeInfoDivLeft > p> span[itemprop=producer]").text(),
    author: $("#filmeInfoDivLeft > p> span[itemprop=author]").text(),
    duration: ($(" #filmeInfoDivRight > p > span[itemprop=duration]").text().replace('T', '')).replace('M', ''),
    genre: genres.toString(),
    minAge: $("#filmeInfoDivRight > div > p > span[itemprop=contentRating]").text(),
    publishedDate: $("#filmeInfoDivRight > div > p > span[itemprop=datePublished]").text(),
  }
  if (movie.imageurl == "") {
    movie.imageurl = "https://filmspot.com.pt/images/layout/poster_default.jpg";
  }
  if (movie.minAge == "") {
    movie.minAge = 'N/A';
  }
  if (movie.imdbtitle == "") {
    movie.imdbtitle = movie.name;
  }

  return movie;
};

const scrap_trailer = response => {
  let $ = cheerio.load(response.data);
  return {
    trailer: $('#contentsLeft > div.trailerDiv.filmePosterShadow > iframe').attr('src'),
    url: 'https://filmspot.pt/' + $('#filmeLista > div.filmeListaInfo > h2 > a').attr('href')
  }
};

const removeCollection = (db, name, callback) => {
  db.listCollections({ name: name }).next((err, collinfo) => {
    if (collinfo) {
      db.collection(name).drop((e, results) => {
        if (e) throw e;
        console.log("Dropped " + name + " collection!");
        callback();
      });
    } else {
      console.log("Collection " + name + " does not exist!");
      callback();
    }
  });
};

const insertCollection = (db, doc, name, callback) => {
  db.collection(name).insertMany(doc, {}, (e, result) => {
    if (e) throw e;
    console.log("Inserted " + result.result.n + " movies into the movies collection");
    callback();
  });
}

const get_cinemas = async () => {
  const response = await get_site("https://filmspot.pt/salas/");
  let $ = cheerio.load(response.data);
  let cinemasTasks = $("#contentsLeft > ul > li > a")
    .map((_, element) => $(element).attr("href"))
    .map((_, cinema) => () => get_site("https://filmspot.pt" + cinema));

  const cinemasResponses = await Throttle.all(cinemasTasks, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("cinemas", result.amountDone + "/" + cinemasTasks.length);
    }
  });

  const cinemas = cinemasResponses.map(response => scrap_cinema(response));

  const allMovies = new Set([].concat.apply([], cinemas.map(cinema => cinema.movies)).map(movie => movie.url));
  const moviesTasks = [...allMovies].map(movie => () =>
    get_site(movie)
  );

  const moviesResponse = await Throttle.all(moviesTasks, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("movies", result.amountDone + "/" + moviesTasks.length + "\r");
    }
  });

  const movies = moviesResponse.map(response => scrap_movie(response));

  const trailerURLs = movies.map(movie => movie.trailer).map(trailer => () => get_site(trailer));

  const trailersResponses = await Throttle.all(trailerURLs, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("trailers", result.amountDone + "/" + trailerURLs.length + "\r");
    }
  });

  const trailers = trailersResponses.map(response => scrap_trailer(response));

  const imdbTasks = movies.map(movie => movie.imdbURL.split("/")[4]).map(title => () => get_imdb(title));

  const imdbMovies = await Throttle.all(imdbTasks, {
    maxInProgress: 5,
    progressCallback: result => {
      console.log("imdb", result.amountDone + "/" + imdbTasks.length + "\r");
    }
  });

  for (var idx in imdbMovies) {
    movies[idx].actors = imdbMovies[idx].actors;
    movies[idx].trailer = trailers[idx].trailer;
    movies[idx].ratings = imdbMovies[idx].ratings;

  }

  const moviesDebuts = await get_debuts();

  MongoClient.connect("mongodb://localhost:27017/", (err,  client) => {
    if (err) { return console.dir(err); }
    const db = client.db(dbName);
    removeCollection(db, 'movies', () => {
      removeCollection(db, 'cinemas', () => {
        removeCollection(db, 'debuts', () => {
          insertCollection(db, movies, 'movies', () => {
            insertCollection(db, cinemas, 'cinemas', () => {
              insertCollection(db, moviesDebuts, 'debuts', () => {
                console.log("Finished database setup");
              });
            });
          });
        });
      });
    });
  });
};




const get_debuts = async () => {
  const response = await get_site("https://filmspot.pt/estreias/");
  let $ = cheerio.load(response.data);
  let debutTasks = $("#contentsLeft > div > div.filmeLista > div.filmeListaInfo > h3 > a")
    .map((_, element) => $(element).attr("href"))
    .map((_, debut) => () => get_site("https://filmspot.pt" + debut));

  const moviesResponse = await Throttle.all(debutTasks, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("Debut movies", result.amountDone + "/" + debutTasks.length);
    }
  });
  
  return movies = moviesResponse.map(response => scrap_movieDebut(response));
};

module.exports.get_cinemas = get_cinemas();

