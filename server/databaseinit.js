const imdb = require('imdb-api');
const cheerio = require('cheerio');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config/config');
const imdbKEY = config.imdbKey;
const dbName = config.dbName;

const concat = list => Array.prototype.concat.bind(list);
const promiseConcat = f => x => f().then(concat(x));
const promiseReduce = (acc, x) => acc.then(promiseConcat(x));
const serial = funcs => funcs.reduce(promiseReduce, Promise.resolve([]));

  function get_site(url) {
    console.log('get_site', url);
    return axios.get(url);
  }

  function get_imdb(id) {
    console.log('get_imdb', id);
    return imdb.getById(id, { apiKey: imdbKEY, timeout: 3000 });
  }


  function getListFilms() {
    return axios.get('https://filmspot.pt/filmes/');
  }

  function removeCollection(db, name, callback) {
    db.listCollections({ name: name }).next(function (err, collinfo) {
      if (collinfo) {
        db.collection(name).drop(function (e, results) {
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

  function insertCollection(db, doc, name, callback) {
    db.collection(name).insertMany(doc, {}, function (e, result) {
      if (e) throw e;
      console.log("Inserted " + result.result.n + " movies into the movies collection");
      callback();
    });
  }

  return module.exports = {
  populateDatabase: function() {
    console.log('GET /cinemas');
    get_site('https://filmspot.pt/salas/').then(function (response) {
      if (response.status != 200) {
        console.log(response.status);
        return;
      }
      let $ = cheerio.load(response.data);
      let salas = [];
      $('#contentsLeft > ul > li > a').each(function (i, element) {
        salas.push($(this).attr('href'));
      });
      return salas;
    }).then(function (salas) {
      let urls = [];
      var i = 0;
      salas.forEach(function (element) {
        urls.push('https://filmspot.pt' + element);
      });

      const funcs = urls.map(url => () => get_site(url));

      return serial(funcs);
    }).then(function (responses) {
      let cinemas = [];
      responses.forEach(function (response) {
        if (response.status != 200) {
          console.log('status', response.status);
          return;
        }
        let $ = cheerio.load(response.data);
        let cinema = { name: $('#contentsNoSidebar > div:nth-child(1) > div.cinemaMorada.vcard > h1').text(), geo: [], movies: [] };
        let latitude = $('#filmePosterDiv > a > div.geo > span.latitude').text();
        let longitude = $('#filmePosterDiv > a > div.geo > span.longitude').text();
        if (latitude != '' && longitude != '') {
          cinema.geo.push({ latitude: latitude, longitude: longitude });

        }
        $('#contentsNoSidebar > div').each(function (i, element) {
          if ($('h2', element).text() != "") {
            let movie = { name: $('h2', element).text(), url: "https://filmspot.pt" + $('h2 > a:nth-child(2)', element).attr('href'), rooms: [] };
            let tables = $('.cinemaTabelaSessoes > tbody', element);
            tables.each((_, table) => {
              let room = { name: $('tr:nth-child(1)', table).text(), sessions: [] }
              $('tr:not(:first-child)', table).each((_, tr) => {
                $('td', tr).each((_, td) => {
                  const hourText = $(td).contents().first().text().trim();
                  if (hourText)
                    room.sessions.push({ day: $('th', tr).text(), hour: hourText });
                });
              });
              movie.rooms.push(room);
            });
            cinema.movies.push(movie);
          }
        });
        cinemas.push(cinema);
      });
      return cinemas;
    }).catch(function (error) {
      console.error('Error:', error);
    }).then(function (cinemas) {
      const funcs = ['https://filmspot.pt/filmes/'].map(url => () => get_site(url));
      return {
        response: serial(funcs),
        cinemas: cinemas
      }
    }).then(function (result) {
      result.response.then(function (response) {
        let moviesURL = [];
        let $ = cheerio.load(response[0].data);
        $('#contents > div#contentsLeft > div.filmeLista').each(function (i, element) {
          if ($('div.filmeListaPoster > a', element).attr('href') != "") {
            moviesURL.push('https://filmspot.pt' + $('div.filmeListaPoster > a', element).attr('href'));
          }
        })
        return {
          cinemas: result.cinemas,
          moviesURL: moviesURL
        }
      }).then(function (result) {
        const funcs = result.moviesURL.map(url => () => get_site(url));
        return {
          moviesHtml: serial(funcs),
          cinemas: result.cinemas
        }
      }).then(function (result) {
        result.moviesHtml.then(function (moviesHtml) {
          let movies = [];
          let imdbMovies = [];
          moviesHtml.forEach(movieHtml => {
            //console.log(movieHtml);
            let $ = cheerio.load(movieHtml.data);

            movie = {
              name: $('#contentsNoSidebar > div > h1 > span[itemprop=name]').text(),
              description: $('#filmeInfoDivLeft > div[itemprop=description]').text(),
              imageurl: $('#filmePosterDiv > p > a').attr('href'),
              realizacao: $('#filmeInfoDivLeft > p> span[itemprop=director]').text(),
              director: $('#filmeInfoDivLeft > p> span[itemprop=producer]').text(),
              author: $('#filmeInfoDivLeft > p> span[itemprop=author]').text(),
              imdbURL: $('#filmeInfoDivLeft > p> a[itemprop=sameAs]').text(),
              duration: $(' #filmeInfoDivRight > p > span[itemprop=duration]').text(),
              genre: $('#filmeInfoDivRight > p > span[itemprop=genre]').text(),
              minAge: $('#filmeInfoDivRight > div > p > span[itemprop=contentRating]').text(),
              publishedDate: $('#filmeInfoDivRight > div > p > span[itemprop=datePublished]').text(),
              url: movieHtml.config.url
            };
            if($('#contentsNoSidebar > div:nth-child(1) > h1 > span.tituloOriginal').text() != '')
                movie.imdbtitle = $('#contentsNoSidebar > div:nth-child(1) > h1 > span.tituloOriginal').text()
            else movie.imdbtitle = movie.name;

            if (movie.imdbURL != "") {
              let parts = movie.imdbURL.split("/");
              parts.pop();
              let id = parts.pop();
              imdbMovies.push(id);
            }
            movies.push(movie);
          });
          const funcs = imdbMovies.map(imdbTitle => () => get_imdb(imdbTitle));
          return {
            imdbMovies: serial(funcs),
            movies: movies,
            cinemas: result.cinemas
          }
        }).then(function (moreResult) {
          moreResult.imdbMovies.then(function (imdbMovies) {
            moreResult.moviesDict = {};
            
            for (var idx in imdbMovies) {
              moreResult.movies[idx].actors = imdbMovies[idx].actors;
              moreResult.movies[idx].ratings = imdbMovies[idx].ratings;
              moreResult.moviesDict[moreResult.movies[idx].url] = moreResult.movies[idx];
            }

            moreResult.cinemas.forEach(cinema => {
              cinema.movies.forEach(movie => {
                movie = Object.assign(movie, moreResult.moviesDict[movie.url]);
              });
            });
            return moreResult;
          }).then(function (response) {
            MongoClient.connect("mongodb://localhost:27017/", function (err, client) {
              if (err) { return console.dir(err); }
              const db = client.db(dbName);
              removeCollection(db, 'movies', function () {
                removeCollection(db, 'cinemas', function () {
                  insertCollection(db, response.movies, 'movies', function () {
                    insertCollection(db, response.cinemas, 'cinemas', function () {
                      console.log("Finished database setup");
                    });
                  });
                });
              });
            });
          });
        });
      });
    })
  }
};


