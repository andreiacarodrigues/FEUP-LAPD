const imdb = require("imdb-api");
const cheerio = require("cheerio");
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const config = require("./config/config");
const imdbKEY = config.imdbKey;
const dbName = config.dbName;
const Throttle = require("promise-parallel-throttle");

const express = require("express");
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
  return await imdb.getById(id, { apiKey: imdbKEY, timeout: 3000 });
};

const scrap_cinema = response => {
  let $ = cheerio.load(response.data);
  let cinema = {
    name: $("#contentsNoSidebar > div:nth-child(1) > div.cinemaMorada.vcard > h1").text(),
    geo: [
      {
        latitude: $("#filmePosterDiv > a > div.geo > span.latitude").text(),
        longitude: $("#filmePosterDiv > a > div.geo > span.longitude").text()
      }
    ],
    address:
      $("#filmeInfoDiv > div > div.street-address").text() +
      " " +
      $("#filmeInfoDiv > div > div > span.locality").text() +
      " " +
      $("#filmeInfoDiv > div > div> span.postal-code").text(),
    locality: $("#filmeInfoDiv > div > div > span.locality").text(),
    telephone: $("#filmeInfoDiv > div > p > span[itemprop=telephone]").text(),
    movies: []
  };

  $("#contentsNoSidebar > div").each((_, element) => {
    if ($("h2", element).text() != "") {
      let movie = {
        name: ($("h2", element).text()).split('/')[0].trim(),
        url: "https://filmspot.pt" + $("h2 > a:nth-child(2)", element).attr("href"),
        imageurl: $("div > a > img.filmePosterShadow.cinemaFilmePoster", element).attr("src"),
        rooms: []
      };
      let tables = $(".cinemaTabelaSessoes > tbody", element);
      tables.each((_, table) => {
        let room = {
          name: $("tr:nth-child(1)", table).text(),
          sessions: []
        };
        $("tr:not(:first-child)", table).each((_, tr) => {
          let session = {
            day: $("th", tr).text(),
            hour: []
          };
          $("td", tr).each((_, td) => {
            const hourText = $(td)
              .contents()
              .first()
              .text()
              .trim();
            if (hourText)
             session.hour.push(hourText)
          });
          room.sessions.push(session);
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
  let genres = [];
  $("#filmeInfoDivRight > p > span[itemprop=genre]").each(function(i, element) {
    genres.push($(this).text());
  });

  movie = {
    name: $("#contentsNoSidebar > div > h1 > span[itemprop=name]").text(),
    description: $("#filmeInfoDivLeft > div[itemprop=description]").text(),
    imageurl: $("#filmePosterDiv > p > a").attr("href"),
    imdbtitle: $("#contentsNoSidebar > div:nth-child(1) > h1 > span.tituloOriginal").text(),
    realizacao: $("#filmeInfoDivLeft > p> span[itemprop=director]").text(),
    director: $("#filmeInfoDivLeft > p> span[itemprop=producer]").text(),
    author: $("#filmeInfoDivLeft > p> span[itemprop=author]").text(),
    imdbURL: ($("#filmeInfoDivLeft > p> a[itemprop=sameAs]").text()).split("/")[4],
    duration: $(" #filmeInfoDivRight > p > span[itemprop=duration]")
      .text()
      .replace("T", "")
      .replace("M", ""),
    genre: genres.toString(),
    trailer:  $("#filmePosterDiv > div.trailerLinkDiv > a").attr("href") || null,
    minAge: $("#filmeInfoDivRight > div > p > span[itemprop=contentRating]").text(),
    publishedDate: $("#filmeInfoDivRight > div > p > span[itemprop=datePublished]").text(),
    url: response.config.url
  };

  if ($("#filmePosterDiv > div.trailerLinkDiv > a").attr("href") == "") {
    movie.trailer = null;
  }

  if(movie.imdbURL == "") {
    movie.imdbURL = null;
  }
  if (movie.imdbtitle == "") {
    movie.imdbtitle = movie.name;
  }
  if (movie.imageurl == "") {
    movie.imageurl = "https://filmspot.com.pt/images/layout/poster_default.jpg";
  }
  if (movie.minAge == "") {
    movie.minAge = "N/A";
  }

  return movie;
};

const scrap_movieDebut = response => {
  let $ = cheerio.load(response.data);
  let genres = $("#filmeInfoDivRight > p > span[itemprop=genre]").map((_, element) => $(element).text());

  movie = {
    name: $("#contentsNoSidebar > div > h1 > span[itemprop=name]").text(),
    description: $("#filmeInfoDivLeft > div[itemprop=description]").text(),
    imageurl: $("#filmePosterDiv > p > a").attr("href"),
    imdbtitle: $("#contentsNoSidebar > div:nth-child(1) > h1 > span.tituloOriginal").text(),
    realizacao: $("#filmeInfoDivLeft > p> span[itemprop=director]").text(),
    director: $("#filmeInfoDivLeft > p> span[itemprop=producer]").text(),
    author: $("#filmeInfoDivLeft > p> span[itemprop=author]").text(),
    duration: $(" #filmeInfoDivRight > p > span[itemprop=duration]")
      .text()
      .replace("T", "")
      .replace("M", ""),
    genre: genres.toString(),
    minAge: $("#filmeInfoDivRight > div > p > span[itemprop=contentRating]").text(),
    publishedDate: $("#filmeInfoDivRight > div > p > span[itemprop=datePublished]").text()
  };
  if (movie.imageurl == "") {
    movie.imageurl = "https://filmspot.com.pt/images/layout/poster_default.jpg";
  }
  if (movie.minAge == "") {
    movie.minAge = "N/A";
  }
  if (movie.imdbtitle == "") {
    movie.imdbtitle = movie.name;
  }

  return movie;
};

const scrap_trailer = response => {
  let $ = cheerio.load(response.data);
  return $("#contentsLeft > div.trailerDiv.filmePosterShadow > iframe").attr("src");
};

const get_debuts = async () => {
  let date = new Date().toISOString().split('T')[0];
  let year = date.split('-')[0];
  let month =  date.split('-')[1];
  const response = await get_site("https://filmspot.pt/estreias/" + year + month + "/");
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

  return moviesResponse.map(response => scrap_movieDebut(response));
};

const removeCollection = async (db, name) => {
  const collinfo = await db.listCollections({ name: name }).next();
  if (collinfo) {
    const results = await db.collection(name).drop();
    console.log("Dropped " + name + " collection!");
  } else {
    console.log("Collection " + name + " does not exist!");
  }
};

const insertCollection = async (db, doc, name) => {
  const result = await db.collection(name).insertMany(doc, {});
  console.log("Inserted " + result.result.n + " movies into the movies collection");
  return result;
};

const getMoviesID = async db => {
  const docs = await db
    .collection("movies")
    .find({})
    .project({ _id: true, url: true })
    .toArray();
  return docs;
};

const getMovies = () => {
  let moviesID = [];
  MongoClient.connect("mongodb://localhost:27017/", (err, client) => {
    if (err) {
      return console.dir(err);
    }
    const db = client.db(dbName);
    removeCollection(db, "movies", () => {
      insertCollection(db, movies, "movies", () => {
        getMoviesID(db, docs => {
          moviesID = docs;
          client.close();
          get_cinemas(moviesID);
        });
      });
    });
  });
};

const get_cinemas = async moviesID => {
  const responseMovie = await get_site("https://filmspot.pt/filmes/");
  let $ = cheerio.load(responseMovie.data);
  let allMovies = $("div.filmeLista")
    .map((_, element) => $("div.filmeListaPoster > a", element).attr("href"))
    .map((_, movie) => () => get_site("https://filmspot.pt" + movie));

  //allMovies = allMovies.slice(0,10);

  const moviesResponse = await Throttle.all(allMovies, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("movies", result.amountDone + "/" + allMovies.length + "\r");
    }
  });

  const movies = moviesResponse.map(response => scrap_movie(response));

  let trailerURLs = movies
    .filter(movie => movie.trailer != null)
    .map(movie => movie.trailer)
    .map(trailer => () => get_site("https://filmspot.pt" + trailer));

  //trailerURLs = trailerURLs.slice(0,10);

  const trailersResponses = await Throttle.all(trailerURLs, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("trailers", result.amountDone + "/" + trailerURLs.length + "\r");
    }
  });

  const trailers = trailersResponses.map(response => scrap_trailer(response));

  const imdbTasks = movies.filter(movie => movie.imdbURL != null).map(movie => movie.imdbURL).map(title => () => get_imdb(title));

  let imdbMovies = await Throttle.all(imdbTasks, {
    maxInProgress: 5,
    progressCallback: result => {
      console.log("imdb", result.amountDone + "/" + imdbTasks.length + "\r");
    }
  });

  for (var idx in imdbMovies) {
    console.log("IMDB: " + imdbMovies[idx].imdburl.split("/")[4]);
    movies[idx].actors = imdbMovies[idx].actors;
    movies[idx].trailer = trailers[idx];
    movies[idx].ratings = imdbMovies[idx].ratings;
  }

  const moviesDebuts = await get_debuts();

  const response = await get_site("https://filmspot.pt/salas/");
  $ = cheerio.load(response.data);
  let cinemasTasks = $("#contentsLeft > ul.dotsSpace > li")
    .map((_, element) => $("a", element).attr("href"))
    .map((_, cinema) => () => get_site("https://filmspot.pt" + cinema));

  //cinemasTasks = cinemasTasks.slice(0,10);
  const cinemasResponses = await Throttle.all(cinemasTasks, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("cinemas", result.amountDone + "/" + cinemasTasks.length);
    }
  });

  const cinemas = cinemasResponses.map(response => scrap_cinema(response));

  const client = await MongoClient.connect("mongodb://localhost:27017/");
  const db = client.db(dbName);
  await removeCollection(db, "movies");
  await removeCollection(db, "cinemas");
  await removeCollection(db, "debuts");

  const insertedMovies = await insertCollection(db, movies, "movies");

  const moviesIds = insertedMovies.ops.reduce((result, op) => {
    result[op.url] = op._id;
    return result;
  }, {});

  cinemas.forEach(cinema => {
    cinema.movies.forEach(movie => {
      movie._id = moviesIds[movie.url];
      
      console.log(movie._id + ' ' + movie.url);
    });
  });

  await insertCollection(db, cinemas, "cinemas");
  await insertCollection(db, moviesDebuts, "debuts");
  await db.collection("movies").createIndex({ name: "text" });
  await db.collection("debuts").createIndex({ name: "text" });
  await db.collection("cinemas").createIndex({ name: 1 , "movies._id": 1});
};

module.exports.get_cinemas = get_cinemas();
