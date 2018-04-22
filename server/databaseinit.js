const imdb = require('imdb-api');
const cheerio = require('cheerio');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config/config');
const imdbKEY = config.imdbKey;
const dbName = config.dbName;
const Throttle = require("promise-parallel-throttle");

const get_site = async url => {
  // console.log("get_site", url);
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
        // FIXME: remove array
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
  return {
    name: $("#contentsNoSidebar > div > h1 > span[itemprop=name]").text(),
    description: $("#filmeInfoDivLeft > div[itemprop=description]").text(),
    imageurl: $("#filmePosterDiv > p > a").attr("href"),
    imdbtitle: $("#contentsNoSidebar > div:nth-child(1) > h1 > span.tituloOriginal").text(),
    realizacao: $("#filmeInfoDivLeft > p> span[itemprop=director]").text(),
    director: $("#filmeInfoDivLeft > p> span[itemprop=producer]").text(),
    author: $("#filmeInfoDivLeft > p> span[itemprop=author]").text(),
    imdbURL: $("#filmeInfoDivLeft > p> a[itemprop=sameAs]").text(),
    duration: $(" #filmeInfoDivRight > p > span[itemprop=duration]").text(),
    genre: $("#filmeInfoDivRight > p > span[itemprop=genre]").text(),
    minAge: $("#filmeInfoDivRight > div > p > span[itemprop=contentRating]").text(),
    publishedDate: $("#filmeInfoDivRight > div > p > span[itemprop=datePublished]").text(),
    trailler:'https://filmspot.pt' +  $('#filmePosterDiv > div > a').attr('href'),
    url: response.config.url
  };
};
 
const scrap_trailler = response => {
  let $ = cheerio.load(response.data);
  return $('#contentsLeft > div.trailerDiv.filmePosterShadow > iframe').attr('src');
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
 
  cinemasTasks = cinemasTasks; // Remove me
 
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
  
  const traillerURLs = movies.map(movie => movie.trailler).map(trailler => () => get_site(trailler));

  const traillersResponses = await Throttle.all(traillerURLs, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("trailers", result.amountDone + "/" + moviesTasks.length + "\r");
    }
  });

  const traillers = traillersResponses.map(response => scrap_trailler(response));
  

  const imdbTasks = movies.map(movie => movie.imdbURL.split("/")[4]).map(title => () => get_imdb(title));
 
  const imdbMovies = await Throttle.all(imdbTasks, {
    maxInProgress: 10,
    progressCallback: result => {
      console.log("imdb", result.amountDone + "/" + imdbTasks.length + "\r");
    }
  });
 
  for (var idx in imdbMovies) {
    movies[idx].actors = imdbMovies[idx].actors;
    movies[idx].trailler = traillers[idx];
    movies[idx].ratings = imdbMovies[idx].ratings;
  }
 
  MongoClient.connect("mongodb://localhost:27017/", function (err, client) {
    if (err) { return console.dir(err); }
    const db = client.db(dbName);
    removeCollection(db, 'movies', function () {
      removeCollection(db, 'cinemas', function () {
        insertCollection(db, movies, 'movies', function () {
          insertCollection(db, cinemas, 'cinemas', function () {
            console.log("Finished database setup");
          });
        });
      });
    });
  });
};
 
module.exports.populateDatabase = get_cinemas();