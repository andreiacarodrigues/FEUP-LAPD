/movies - retorna todos os filmes
ex: http://localhost:3000/movies
JSON Resposta:
{
    name: value,
    imageurl: value,
    genre: value,
    duration: value,
    minAge: value
}

/movie/:name - retorna o filme que tem o nome passado como parametro no URL
ex: http://localhost:3000/movie/"A Rapariga no Nevoeiro"
Array Resposta:
[{
    "name": "A Rapariga no Nevoeiro",
    "description": "Um detetive é enviado para uma remota cidade num vale isolado para investigar o desaparecimento de uma jovem adolescente. Com o caso no centro de um frenesim mediático, a linha entre a lei e os criminosos começa a esbater-se e, em pouco tempo, todos se tornam suspeitos.",
    "imageurl": "https://filmspot.com.pt/images/filmes/posters/big/468202_pt.jpg",
    "imdbtitle": "La ragazza nella nebbia",
    "realizacao": "Donato Carrisi",
    "director": "",
    "author": "Donato Carrisi",
    "imdbURL": "http://www.imdb.com/title/tt6892400/",
    "duration": "128",
    "genre": "Thriller,Crime",
    "minAge": "M/12",
    "publishedDate": "19 Abr. 2018",
    "trailer": "//www.youtube.com/embed/3-DeWD6_AmE?version=3&hl=pt_PT&rel=0&autoplay=1&autohide=1&showinfo=0&theme=light&iv_load_policy=3",
    "url": "https://filmspot.pt/filme/la-ragazza-nella-nebbia-468202/",
    "actors": "Toni Servillo, Alessio Boni, Lorenzo Richelmy, Galatea Ranzi",
    "ratings": [{
        "Source": "Internet Movie Database",
        "Value": "7.0/10"
    }]
}]

/debuts - retorna a lista de todos os filmes a estrear
ex:http://localhost:3000/debuts
[{
"name": "A Rapariga no Nevoeiro",
"imageurl": "https://filmspot.com.pt/images/filmes/posters/big/468202_pt.jpg",
"duration": "128",
"genre": "Thriller,Crime",
"minAge": "M/12"
},
"name": "A Morte de Estaline",
"imageurl": "https://filmspot.com.pt/images/filmes/posters/big/402897_pt.jpg",
"duration": "107",
"genre": "Comédia",
"minAge": "M/12"
}]

/debut/:name - retorna o filme a estrear que tem o nome passado como parametro no url
ex: http://localhost:3000/movie/"A Rapariga no Nevoeiro"
Array Resposta:
[{
    "name": "A Rapariga no Nevoeiro",
    "description": "Um detetive é enviado para uma remota cidade num vale isolado para investigar o desaparecimento de uma jovem adolescente. Com o caso no centro de um frenesim mediático, a linha entre a lei e os criminosos começa a esbater-se e, em pouco tempo, todos se tornam suspeitos.",
    "imageurl": "https://filmspot.com.pt/images/filmes/posters/big/468202_pt.jpg",
    "imdbtitle": "La ragazza nella nebbia",
    "realizacao": "Donato Carrisi",
    "director": "",
    "author": "Donato Carrisi",
    "imdbURL": "http://www.imdb.com/title/tt6892400/",
    "duration": "128",
    "genre": "Thriller,Crime",
    "minAge": "M/12",
    "publishedDate": "19 Abr. 2018",
    "trailer": "//www.youtube.com/embed/3-DeWD6_AmE?version=3&hl=pt_PT&rel=0&autoplay=1&autohide=1&showinfo=0&theme=light&iv_load_policy=3",
    "url": "https://filmspot.pt/filme/la-ragazza-nella-nebbia-468202/",
    "actors": "Toni Servillo, Alessio Boni, Lorenzo Richelmy, Galatea Ranzi",
    "ratings": [{
        "Source": "Internet Movie Database",
        "Value": "7.0/10"
    }]
}]

/listCinemas - retorna a lista de todos os cinemas
ex: http://localhost:3000/listCinemas
[{
"name": "Cinema City Alvalade - Lisboa",
"address": "Av. de Roma 100 Lisboa 1700-352"
},
{
"name": "Cinema City Campo Pequeno - Lisboa",
"address": "Praça do Campo Pequeno Lisboa 1000-082"
}]

/cinema/:name - retorna a informacao sobre o cinema cujo nome é passado como parametro url
ex: http://localhost:3000/cinema/%22Cinema%20Ideal%22

/localizations
