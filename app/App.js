import React from 'react';
import { WebBrowser, Font, AppLoading, MapView, Permissions } from 'expo';
import { Picker, ActivityIndicator, AppRegistry, Dimensions, StyleSheet, Text, View, StatusBar, Button, TouchableOpacity,
    TouchableNativeFeedback, Linking, TouchableHighlight, Image, TextInput, ScrollView, Keyboard } from 'react-native';
import { StackNavigator, TabBarTop, TabNavigator, NavigationActions  } from 'react-navigation';

const config = require('./config/config');

/* ------------------------------------- ENUMERATORS ------------------------------------------- */
/* To know which search is being done and redirect the user to the right page */
const SearchEnum = {
    NONE: 0,
    CINEMA: 1,
    LOCATION: 2,
    MOVIE: 3,
};

/* Used for the search bar logic */
const CurPageEnum = {
    CINEMA: 0,
    INTHEATERS: 1,
    OTHER: 2,
};

/* ----------------------------------- GLOBAL VARIABLES ---------------------------------------- */
/* Search being done */
let searchType = SearchEnum.NONE;

/* Search bar reference (used to show/hide the bar) */
let searchBarObj = null;

/* Current page (used for the search bar logic) */
let curPage = CurPageEnum.CINEMA;

/* Default user location coordinates (if the user denies the location services) */
let userLocation = {coords: {latitude: 38.730481, longitude: -9.146430}};

/* ----------------------------------------- PAGES --------------------------------------------- */

/* Page to showcase a movie (whether it's a movie in exibition or a debut movie) */
class MovieScreen extends React.Component{
    state = {
        isReady: false,
        name:"",
        info:[],
        ratingImdb:"-",
        ratingRt:"-",
        ratingMc:"-",
    };

    /* Adds movie title to the main navigation bar */
    static navigationOptions = ({ navigation }) => ({
        headerTitle: (
            <View style={styles.leftHeader}>
                <Text style={styles.titleHeader}>{navigation.state.params.name}</Text>
            </View>),
        headerRight: (null),
    });

    /* Adds the trailer button and the cinema list where the movie is available to the page layout if it's not a debut movie */
    getMoreInfo(isDebut) {
        if(!isDebut)
        {
            return(<View style={{flexDirection: 'column', flex: 1}}>
                <TouchableHighlight underlayColor={'transparent'}  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }} onPress={() => {
                    WebBrowser.openBrowserAsync('https:' + this.state.info.trailer);
                }}>
                    <View style={styles.movieTrailerBtn}>
                        <Text style={styles.movieTrailerBtnText}> Ver Trailer </Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight underlayColor={'transparent'}  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }} onPress={() => {
                    this.props.navigation.navigate('CinemaSearch', {search:this.state.info['_id'], isSearch:false})
                }}>
                    <View style={styles.movieTrailerBtn}>
                        <Text style={styles.movieTrailerBtnText}> Ver Todos os Cinemas </Text>
                    </View>
                </TouchableHighlight>
            </View>);
        }
        else return(null);
    }

    async componentDidMount() {
        curPage = CurPageEnum.OTHER;

        try {
            let url = 'http://' + config.ip + ':3000/movieID/' + this.props.navigation.state.params.id;
            if(this.props.navigation.state.params.isDebut) {
                url = 'http://' + config.ip + ':3000/debutID/' + this.props.navigation.state.params.id;
            }

            const request = async () => {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }});
                const json = await response.json();
                this.setState({info: json});

                if(this.state.info.ratings && this.state.info.ratings !== [])
                {
                    for(let i = 0; i < this.state.info.ratings.length; i++)
                    {
                        if(this.state.info.ratings[i]['Source'] === "Internet Movie Database")
                        {
                            this.setState({ratingImdb: this.state.info.ratings[i]['Value']});
                        }
                        else if(this.state.info.ratings[i]['Source'] === "Rotten Tomatoes")
                        {
                            this.setState({ratingRt: this.state.info.ratings[i]['Value']});
                        }
                        else if(this.state.info.ratings[i]['Source'] === "Metacritic")
                        {
                            this.setState({ratingMc: this.state.info.ratings[i]['Value']});
                        }
                    }
                }
                this.setState({isReady: true});
            };
            request();
        }
        catch (e) {
            console.log(e);
        }
    }

    render(){
        if(this.state.isReady) {
            return (<ScrollView keyboardShouldPersistTaps="always" keyboardDismissMode='on-drag'>
                <View style={{flexDirection: 'row', margin: 4}}>
                    <View style={styles.movieScreenTopLeft}>
                        <Image source={{uri: this.state.info.imageurl}} style={styles.movieScreenImage}/>
                    </View>
                    <View style={styles.movieScreenTopRight}>
                        <View style={{
                            flex: 3,
                            justifyContent: 'center',
                            backgroundColor: '#822f3b',
                            padding: 15,
                            marginLeft: 4
                        }}>
                            <Text style={styles.movieScreenTextClassTitle}> Classificação </Text>
                            <View style={[styles.movieScreenTextWrapper, {flexDirection: 'row'}]}>
                                <Image style={{width: 30, height: 30}} source={require('./assets/img/imdb.png')}/>
                                <Text style={[styles.movieScreenTextClass, {justifyContent: 'center'}]}>
                                    <Text style={{fontWeight: 'bold'}}> IMDb: </Text>
                                    <Text>{this.state.ratingImdb}</Text>
                                </Text>
                            </View>
                            <View style={[styles.movieScreenTextWrapper, {flexDirection: 'row'}]}>
                                <Image style={{width: 31, height: 32}} source={require('./assets/img/rt.png')}/>
                                <Text style={[styles.movieScreenTextClass, {justifyContent: 'center'}]}>
                                    <Text style={{fontWeight: 'bold'}}> Rotten Tomatoes: </Text>
                                    <Text>{this.state.ratingRt}</Text>
                                </Text>
                            </View>
                            <View style={[styles.movieScreenTextWrapper, {flexDirection: 'row'}]}>
                                <Image style={{width: 30, height: 30}} source={require('./assets/img/mc.png')}/>
                                <Text style={[styles.movieScreenTextClass, {justifyContent: 'center'}]}>
                                    <Text style={{fontWeight: 'bold'}}> Meta Critic: </Text>
                                    <Text>{this.state.ratingMc}</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{
                    flexDirection: 'column',
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 8,
                    paddingBottom: 8,
                    backgroundColor: "white",
                    marginLeft: 4,
                    marginRight: 4,
                    marginBottom: 4
                }}>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Titulo: </Text>
                        <Text>{this.state.info.name} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Titulo Original: </Text>
                        <Text>{this.state.info.imdbtitle}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Género: </Text>
                        <Text>{this.state.info.genre}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Estreia em Portugal: </Text>
                        <Text>{this.state.info.publishedDate}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Classificação Etária: </Text>
                        <Text>{this.state.info.minAge}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Duração: </Text>
                        <Text>{this.state.info.duration} minutos</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Sinopse: </Text>
                        <Text>{this.state.info.description} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Com: </Text>
                        <Text>{this.state.info.actors} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Realização: </Text>
                        <Text>{this.state.info.realizacao} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText]}>
                        <Text style={{fontFamily: 'quicksand'}}> Produção: </Text>
                        <Text>{this.state.info.director} </Text>
                    </Text>
                </View>
                {this.getMoreInfo(this.props.navigation.state.params.isDebut)}
            </ScrollView>);
        }
        else
        {
            return(<View  style={{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <ActivityIndicator size="large" color="#9b3a45" />
            </View>);
        }
    }
}

/* Information tab to show the cinema's location and contact */
class CinemaInfo extends React.Component {
    state = {
        isReady: false,
        cinema: [],
    };

    async componentDidMount() {
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.OTHER)
                    curPage = CurPageEnum.OTHER;
            }
        );

        try {
             const request = async () => {
                 const response = await fetch('http://' + config.ip + ':3000/cinemaID/' + this.props.navigation.state.params.id, {
                 //const response = await fetch('http://' + config.ip + ':3000/cinemaID/5b02d6acedbe240484e2720c', {
                     method: 'GET',
                     headers: {
                         'Accept': 'application/json',
                         'Content-Type': 'application/json'
                     }
                 });

                 const json = await response.json();
                 this.setState({cinema: json});
                 this.setState({isReady: true});
             };

             request();
        }
        catch(e) {
            console.log(e);
        }
    }

    render(){
        const { navigate } = this.props.navigation;
        if(this.state.isReady)
        {
            return(<View style={{flex:1, flexDirection:'column'}}>
                <View style={{flex:1.5}}>
                        <MapView
                            style={{
                                zIndex :1,
                                flex: 1,
                                width: Dimensions.get('window').width,
                                height:50,
                            }}
                            region={{
                                latitude: Number(this.state.cinema.geo[0].latitude),
                                longitude: Number(this.state.cinema.geo[0].longitude),
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421
                            }}>

                        <MapView.Marker
                            coordinate={{
                                latitude: Number(this.state.cinema.geo[0].latitude),
                                longitude: Number(this.state.cinema.geo[0].longitude)
                            }}
                            title={this.state.cinema.name}
                        />
                    </MapView>
                </View>
                <View style={{flex:2, backgroundColor:'white', margin:2, paddingTop:5, paddingBottom:5}}>
                    <View style={{margin:10}}>{this.state.cinema.address.length > 0 &&
                        <View>
                            <Text style={styles.inTheatersListTextTitle}>Morada</Text>
                            <Text style={styles.inTheatersListText}>{this.state.cinema.name}</Text>
                            <Text style={styles.inTheatersListText}>{this.state.cinema.address}</Text>
                        </View>}
                    </View>
                    <View style={{margin:10}}>{this.state.cinema.telephone.length > 0 &&
                        <View>
                            <Text style={styles.inTheatersListTextTitle}>Contacto</Text>
                            <Text style={styles.inTheatersListText}>{this.state.cinema.telephone}</Text>
                        </View>}
                    </View>
                </View>
            </View>);
        }
        else{
            return(<View  style={{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <ActivityIndicator size="large" color="#9b3a45" />
            </View>);
        }
    }
}

/* Information tab to show the movie sessions schedule in a cinema */
class CinemaSessions extends React.Component {
    state = {
        isReady: false,
        cinema: [],
    };

    async componentDidMount() {
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.OTHER)
                    curPage = CurPageEnum.OTHER;
            }
        );

        try {
            /* REQUEST DO CINEMA */
             const request = async () => {
                 const response = await fetch('http://' + config.ip + ':3000/cinemaID/' + this.props.navigation.state.params.id, {
                     method: 'GET',
                     headers: {
                         'Accept': 'application/json',
                         'Content-Type': 'application/json'
                     }
                 });
                 const json = await response.json();
                 this.setState({cinema: json});
                 this.setState({ isReady: true });
             };

             request();
        }
        catch(e) {
            console.log(e);
        }
    }

    /* Constructs the schedule for a movie based on the information received in a json and adds it to the movie element
    in the page's layout */
    parseSchedule(schedule, index) {
        var returnValue = [];
        for (var i = 0; i < 5; i++) {
            if(schedule[i]) {
                returnValue.push(
                    <View key={i} style={[{flex:1, backgroundColor: '#f5f5f5'}, index%2 && {backgroundColor: 'transparent'}]}>
                        <Text style={[styles.sessionMovieText, {textAlign:'right'}]}>{schedule[i]}</Text>
                    </View>
                );
            }
            else {
                returnValue.push(
                    <View key={i} style={[{flex:1, backgroundColor: '#f5f5f5'}, index%2 && {backgroundColor: 'transparent'}]}/>
                )
            }
        }
        return returnValue;
    }

    render(){
        const { navigate } = this.props.navigation;
        if(this.state.isReady) {
            if(this.state.cinema.movies.length === 0) {
                return (<View style={{flex: 1, alignContent: 'center',padding:10}}>
                    <Text style={[styles.sessionMovieTitle, {lineHeight:22}]}>Não existem filmes em exibição de momento no cinema selecionado.</Text>
                </View>);
            }
            else {
                return (<ScrollView style={{flex: 1, backgroundColor: '#f4f4f4'}}>
                    {this.state.cinema.movies.map((movie) => (
                        <TouchableHighlight underlayColor={'transparent'} key={movie['_id']} onPress={() =>
                            navigate('Movie', {name: movie.name, id: movie['_id'], isDebut: false})
                        }>
                            <View style={{flexDirection: 'row', margin: 1, backgroundColor: 'white'}}>
                                <View style={{justifyContent: 'center', alignContent: 'center', flex: 0.8}}>
                                    <Image source={{uri: movie.imageurl}} style={styles.inTheatersImg}/>
                                </View>
                                <View style={{flex: 3.4, paddingTop: 5, paddingBottom: 5}}>
                                    <Text style={styles.sessionMovieTitle}>{movie.name}</Text>
                                    {movie.rooms.map((room, index) => (
                                        <View key={index} style={{flexDirection: 'column', padding: 4, marginTop: 5}}>
                                            <Text style={[styles.sessionMovieText, {fontFamily: 'quicksand'}]}>
                                                {room.name}
                                            </Text>
                                            {room.sessions.map((session, index) => (
                                                <View key={index} style={{flexDirection: 'row'}}>
                                                    <View style={[{
                                                        flex: 2,
                                                        backgroundColor: '#f5f5f5'
                                                    }, index % 2 && {backgroundColor: 'transparent'}]}>
                                                        <Text style={styles.sessionMovieText}>{session.day}</Text>
                                                    </View>
                                                    {this.parseSchedule(session.hour, index)}
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </TouchableHighlight>
                    ))
                    }
                </ScrollView>);
            }
        }
        else{
            return(<View  style={{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <ActivityIndicator size="large" color="#9b3a45" />
            </View>);
        }
    }
}

/* Cinema's page: schedule and info tabs */
const CinemaTabs = TabNavigator({
        'Filmes Em Cartaz': {screen: CinemaSessions},
        'Saber Mais': {screen: CinemaInfo},
    },
    {   tabBarComponent: TabBarTop,
        navigationOptions: ({navigation}) => ({
            headerRight: (null),
        }),
        tabBarOptions: {
            swipeEnabled: false,
            upperCaseLabel: false,
            activeTintColor:'white',
            labelStyle: {
                fontSize: 19,
                fontFamily: 'quicksand',
            },
            indicatorStyle: {
                backgroundColor: '#e0e0e0'
            },

            style: {
                backgroundColor: '#822f3b',
            },
        },
    });

/* Get's the user's current location using the gps */
async function getLocationAsync() {
    const { Location } = Expo;
    return Location.getCurrentPositionAsync({enableHighAccuracy: true});
}

/* Search bar element - allows search by cinema's name, movie's name and location's name */
class SearchBar extends React.Component {
    state = {
        text: "",
        search_bar: null,
    };

    /* Search bar submit handler - handles the diferent types of search available: search by cinema's name, movie's name
     and location's name */
    onSubmit(text){
        Keyboard.dismiss();
        if(this.props.search === SearchEnum.CINEMA)
        {
            this.props.navigation.navigate('CinemaSearch', {search: text, isSearch:true});
        }
        else if(this.props.search === SearchEnum.LOCATION)
        {
            let longitude = userLocation.coords.longitude;
            let latitude = userLocation.coords.latitude;

            try {
                const request = async () => {
                    const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + text + '&key=' + config.googleMapsAPI, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    const json = await response.json();

                    if(json.results.length > 0)
                    {
                        latitude = json.results[0].geometry.location.lat;
                        longitude = json.results[0].geometry.location.lng;
                        this.setState({cinema: json});
                    }
                    this.setState({ isReady: true });

                    const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({ routeName: 'Home', params: {latitude: latitude, longitude:longitude} }),
                        ],
                    });
                    this.props.navigation.dispatch(resetAction);
                };

                request();
            }
            catch(e) {
                console.log(e);
            }
        }
        else if(this.props.search === SearchEnum.MOVIE)
        {
            this.props.navigation.navigate('MovieSearch', {search: text});
        }
    };

    render() {
        return (
            <View>
                <View style={{flexDirection:'row', padding:2, alignItems:'center', justifyContent:'center',backgroundColor:'#fff'}}>
                    <View style={{paddingLeft:15, flex:1}}>
                        <TouchableHighlight underlayColor={'transparent'} onPress={() => this.search_bar.clear() }>
                            <Image source={ require('./assets/img/cancel3.png') } style={ {width: 20, height: 20 } } />
                        </TouchableHighlight>
                    </View>
                    <View style={{flex:6,padding:2,  paddingRight: 5, justifyContent:'center', height:50}}>
                        <TextInput
                            onChangeText={(text) => this.setState({text})}
                            value={this.state.text}
                            style={{backgroundColor:'transparent', fontFamily:'quicksand', fontSize:18, paddingLeft:20, paddingRight:20}}
                            onSubmitEditing = {()=>{this.onSubmit(this.state.text)}}
                            placeholder="Pesquisar"
                            ref={element => {
                                this.search_bar = element
                            }}
                            autoCorrect={false}
                            underlineColorAndroid='transparent'
                        />
                    </View>
                    <View style={{paddingLeft:10,flex:1}}>
                        <TouchableHighlight underlayColor={'transparent'} onPress={() => this.onSubmit(this.state.text) }>
                            <Image source={ require('./assets/img/search2.png') } style={ { width: 25, height: 25 } } />
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        );
    }
}

/* Search element - includes the Search Bar element and the buttons to choose which type of search the user wants to
perform */
class Search extends React.Component {
    state = {
        search: SearchEnum.CINEMA,
        showing: false,
        text: "",
    };

    /* Shows the search element */
    show(){
        this.setState({showing: true});
    }

    /* Hides the search element */
    hide(){
        this.setState({showing: false});
    }

    /* Returns state of the search element, if it's showing or not */
    isShowing(){
        return this.state.showing;
    }

    render(){
        if(this.state.showing) {
            if (this.state.search === SearchEnum.CINEMA || this.state.search === SearchEnum.NONE) {
                return (
                    <View style={styles.searchBarZ}>
                        <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
                            <View style={styles.searchButtonsPressed}>
                                <TouchableHighlight underlayColor={'transparent'} onPress={() => {
                                    this.setState({search: SearchEnum.CINEMA})
                                }}>
                                    <Text style={styles.searchButtonsTxtPressed}>Cinema</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableHighlight underlayColor={'transparent'} onPress={() => {
                                    this.setState({search: SearchEnum.MOVIE})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Filme</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableHighlight underlayColor={'transparent'}  onPress={() => {
                                    this.setState({search: SearchEnum.LOCATION})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Localização</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <SearchBar search={this.state.search} navigation={this.props.navigation}/>
                    </View>
                )
            }
            else if (this.state.search === SearchEnum.MOVIE) {
                return (
                    <View style={styles.searchBarZ}>
                        <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
                            <View style={styles.searchButtons}>
                                <TouchableHighlight underlayColor={'transparent'}  onPress={() => {
                                    this.setState({search: SearchEnum.CINEMA})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Cinema</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={styles.searchButtonsPressed}>
                                <TouchableHighlight underlayColor={'transparent'}  onPress={() => {
                                    this.setState({search: SearchEnum.MOVIE})
                                }}>
                                    <Text style={styles.searchButtonsTxtPressed}>Filme</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableHighlight underlayColor={'transparent'}  onPress={() => {
                                    this.setState({search: SearchEnum.LOCATION})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Localização</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <SearchBar search={this.state.search} navigation={this.props.navigation}/>
                    </View>
                )
            }
            else if (this.state.search === SearchEnum.LOCATION) {
                return (
                    <View style={styles.searchBarZ}>
                        <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
                            <View style={styles.searchButtons}>
                                <TouchableHighlight underlayColor={'transparent'}  onPress={() => {
                                    this.setState({search: SearchEnum.CINEMA})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Cinema</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableHighlight underlayColor={'transparent'}  onPress={() => {
                                    this.setState({search: SearchEnum.MOVIE})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Filme</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={styles.searchButtonsPressed}>
                                <TouchableHighlight underlayColor={'transparent'}  onPress={() => {
                                    this.setState({search: SearchEnum.LOCATION})
                                }}>
                                    <Text style={styles.searchButtonsTxtPressed}>Localização</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <SearchBar search={this.state.search} navigation={this.props.navigation}/>
                    </View>
                )
            }
            else return(null);
        }
        else return(null);
    };

}

/* Application's home screen, where the map is placed and the search can be done */
class HomeScreen extends React.Component {
    state = {
        isReady: false,
        search: searchType,
        location: userLocation,
        markers: [],
        searchResults: [],
    };

    async componentDidMount() {
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.CINEMA)
                    curPage = CurPageEnum.CINEMA;
            }
        );

        try {
            if(!(this.props.navigation.state.params)){
                let {status} = await Permissions.askAsync(Permissions.LOCATION);
                if (status !== 'granted') {
                    this.setState({isReady: true});
                }
                else {
                    let location = await getLocationAsync();
                    userLocation = location;
                    this.setState({location: location});
                }
            }
            else
            {
                let location = {coords: {latitude: this.props.navigation.state.params.latitude, longitude: this.props.navigation.state.params.longitude}};
                this.setState({location: location});
            }
        }
        catch (e) {
            console.log(e.message);
        }
        finally {
            try{
                const request = async () => {
                    const response = await fetch('http://' + config.ip + ':3000/localizations', {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    const json = await response.json();
                    this.setState({markers: json});
                };

                request();
            }
            finally {
                this.setState({ isReady: true });
            }
        }
    }

   render(){
      const { navigate } = this.props.navigation;
      if(this.state.isReady) {
              return (
                  <View style={{backgroundColor: 'black', flex: 1}}>
                      <Search ref={(ref) => searchBarObj = ref} navigation={this.props.navigation}/>
                      <MapView
                          style={{
                              zIndex :1,
                              flex: 1,
                              width: Dimensions.get('window').width,
                              height: Dimensions.get('window').height
                          }}
                          region={{
                              latitude: this.state.location.coords.latitude,
                              longitude: this.state.location.coords.longitude,
                              latitudeDelta: 0.0922,
                              longitudeDelta: 0.0421
                          }}>
                          {this.state.markers.length > 0 && this.state.markers.map((marker) => (
                              <MapView.Marker
                                  key={marker.name}
                                  coordinate={{
                                      latitude: Number(marker.geo[0].latitude),
                                      longitude: Number(marker.geo[0].longitude)
                                  }}
                                  title={marker.name}
                                  onCalloutPress={() => navigate('Cinema', { id: marker['_id'], name: marker.name })}
                              />
                          ))}
                      </MapView>
                  </View>);
          }
          else {
              return null;
          }
      }
}

/* Movies currently on theaters */
class InTheatersScreen extends React.Component{
    state = {
        isReady: false,
        movies: [],
    };

    async componentDidMount() {
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.INTHEATERS)
                    curPage = CurPageEnum.INTHEATERS;
            }
        );

        try {
            const request = async () => {
                const response = await fetch('http://' + config.ip + ':3000/movies', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();
                this.setState({movies: json});
                this.setState({ isReady: true });
            };

            request();
        }
        catch(e) {
            console.log(e);
        }
    }

    render(){
        const { navigate } = this.props.navigation;
        if(this.state.isReady) {
            if(this.state.movies.length === 0) {
                return (<View style={{flex: 1, alignContent: 'center',padding:10}}>
                    <Text style={[styles.sessionMovieTitle, {lineHeight:22}]}>Não existem filmes em exibição de momento.</Text>
                </View>);
            }
            else {
                return (
                    <ScrollView style={{backgroundColor: '#f4f4f4'}}
                                keyboardShouldPersistTaps="always"
                                keyboardDismissMode='on-drag'>
                        {this.state.movies.map((movie) => (

                            <TouchableHighlight underlayColor={'transparent'} key={movie['_id']} onPress={() =>
                                navigate('Movie', {name: movie.name, id: movie['_id'], isDebut: false})
                            }>
                                <View style={styles.inTheatersList}>
                                    <Image source={{uri: movie.imageurl}} style={styles.inTheatersListImg}/>
                                    <View style={styles.inTheatersListTextView}>
                                        <Text style={styles.inTheatersListTextTitle}>{movie.name}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.genre}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.minAge}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.duration} minutos</Text>
                                    </View>
                                    <View style={styles.inTheatersListButtonView}>
                                        <Image
                                            style={styles.inTheatersListButton}
                                            source={require('./assets/img/next.png')}
                                        />
                                    </View>
                                </View>
                            </TouchableHighlight>
                        ))
                        }
                    </ScrollView>
                );
            }
        }
        else{
            return(<View  style={{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <ActivityIndicator size="large" color="#9b3a45" />
            </View>);
        }
    }
}

/* Movies that will premier in the near future */
class PremiersScreen extends React.Component{
    state = {
        isReady: false,
        movies: [],
    };

    async componentDidMount() {
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.INTHEATERS)
                    curPage = CurPageEnum.INTHEATERS;
            }
        );

        try {
            const request = async () => {
                const response = await fetch('http://' + config.ip + ':3000/debuts', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();
                this.setState({movies: json});
                this.setState({ isReady: true });
            };

            request();
        }
        catch(e) {
            console.log(e);
        }
    }

    render(){
        const { navigate } = this.props.navigation;
        if(this.state.isReady) {
            if(this.state.movies.length === 0) {
                return (<View style={{flex: 1, alignContent: 'center',padding:10}}>
                    <Text style={[styles.sessionMovieTitle, {lineHeight:22}]}>Não existem próximas estreias de momento.</Text>
                </View>);
            }
            else {
                return (
                    <ScrollView style={{backgroundColor: '#f4f4f4'}}
                                keyboardShouldPersistTaps="always"
                                keyboardDismissMode='on-drag'>
                        {this.state.movies.map((movie) => (

                            <TouchableHighlight underlayColor={'transparent'} key={movie['_id']} onPress={() =>
                                navigate('Movie', {id: movie['_id'], name: movie.name, isDebut: true})
                            }>
                                <View style={styles.inTheatersList}>
                                    <Image source={{uri: movie.imageurl}} style={styles.inTheatersListImg}/>
                                    <View style={styles.inTheatersListTextView}>
                                        <Text style={styles.inTheatersListTextTitle}>{movie.name}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.genre}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.minAge}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.duration} minutos</Text>
                                    </View>
                                    <View style={styles.inTheatersListButtonView}>
                                        <Image
                                            style={styles.inTheatersListButton}
                                            source={require('./assets/img/next.png')}
                                        />
                                    </View>
                                </View>
                            </TouchableHighlight>
                        ))
                        }
                    </ScrollView>
                );
            }
        }
        else{
            return(<View  style={{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <ActivityIndicator size="large" color="#9b3a45" />
            </View>);
        }
    }
}

/* Cinema search results page - lists all the cinemas that match the search made by the user */
class CinemaSearch extends React.Component {
    state = {
        isReady: false,
        searchResults: [],
    };

    async componentDidMount() {
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.OTHER)
                    curPage = CurPageEnum.OTHER;
            }
        );

        try {
            let url = 'http://' + config.ip + ':3000/cinema/"' + this.props.navigation.state.params.search + '"';
            if(!this.props.navigation.state.params.isSearch) {
                url = 'http://' + config.ip + ':3000/moviescinemas/"' +  this.props.navigation.state.params.search + '"';
            }

            const request = async () => {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                    });
                const json = await response.json();
                this.setState({searchResults: json});
                this.setState({ isReady: true });

            };
            request();
        }
        catch(e) {
            console.log(e);
        }
    }

    render(){
        const { navigate } = this.props.navigation;
        if(this.state.isReady)
        {
            if(this.state.searchResults.length !== 0) {
                return (<ScrollView style={{flex: 1}}>
                    {this.state.searchResults.map((cinema) => (
                        <TouchableHighlight underlayColor={'transparent'} key={cinema['_id']} onPress={() =>
                            navigate('Cinema', {id: cinema['_id'], name: cinema['name'], navigator: this.props.navigation})
                        }>
                            <View style={styles.inTheatersList}>
                                <View style={styles.inTheatersListTextView}>
                                    <Text style={styles.inTheatersListTextTitle}>{cinema.name}</Text>
                                    <Text style={styles.inTheatersListText}> <Image style={{width: 30, height: 40}}
                                                                                    source={require('./assets/img/location.png')}/>
                                        <Text>{cinema.locality}</Text></Text>
                                </View>
                                <View style={styles.inTheatersListButtonView}>
                                    <Image
                                        style={styles.inTheatersListButton}
                                        source={require('./assets/img/next.png')}
                                    />
                                </View>
                            </View>
                        </TouchableHighlight>
                    ))
                    }
                </ScrollView>);
            }
            else {
                return (<View style={{flex: 1, alignContent: 'center',padding:10}}>
                    <Text style={[styles.sessionMovieTitle, {lineHeight:22}]}>Não foram encontrados resultados para a pesquisa: "{this.props.navigation.state.params.search}".</Text>
                </View>);
            }
        }
        else return(<View  style={{
            flex:1,
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center'
        }}>
            <ActivityIndicator size="large" color="#9b3a45" />
        </View>);
    }
}

/* Movie search results page - lists all the movies that match the search made by the user */
class MovieSearch extends React.Component{
    state = {
        isReady: false,
        movies: [],
    };

    async componentDidMount() {
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.OTHER)
                    curPage = CurPageEnum.OTHER;
            }
        );

        try {
            const request = async () => {
                const response = await fetch('http://' + config.ip + ':3000/movies/"' +  this.props.navigation.state.params.search + '"', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();
                this.setState({movies: json});
                this.setState({ isReady: true });
            };

            request();
        }
        catch(e) {
            console.log(e);
        }
    }

    render(){
        const { navigate } = this.props.navigation;
        if(this.state.isReady) {
            if(this.state.movies.length !== 0) {
                return (
                    <ScrollView style={{backgroundColor: '#f4f4f4'}}
                                keyboardShouldPersistTaps="always"
                                keyboardDismissMode='on-drag'>
                        {this.state.movies.map((movie) => (

                            <TouchableHighlight underlayColor={'transparent'} key={movie.name} onPress={() =>
                                navigate('Movie', {name: movie.name, id: movie['_id'], isDebut: false})
                            }>
                                <View style={styles.inTheatersList}>
                                    <Image source={{uri: movie.imageurl}} style={styles.inTheatersListImg}/>
                                    <View style={styles.inTheatersListTextView}>
                                        <Text style={styles.inTheatersListTextTitle}>{movie.name}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.genre}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.minAge}</Text>
                                        <Text style={styles.inTheatersListText}>{movie.duration} minutos</Text>
                                    </View>
                                    <View style={styles.inTheatersListButtonView}>
                                        <Image
                                            style={styles.inTheatersListButton}
                                            source={require('./assets/img/next.png')}
                                        />
                                    </View>
                                </View>
                            </TouchableHighlight>
                        ))
                        }
                    </ScrollView>
                );
            }
            else {
                return (<View style={{flex: 1, alignContent: 'center',padding:10}}>
                    <Text style={[styles.sessionMovieTitle, {lineHeight:22}]}>Não foram encontrados resultados para a pesquisa: "{this.props.navigation.state.params.search}".</Text>
                </View>);
            }
        }
        else{
            return(<View  style={{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <ActivityIndicator size="large" color="#9b3a45" />
            </View>);
        }
    }
}

/* Homepage tabs, home screen with the map and the searching functionality, list of movies in exibition and list of next
 premiers*/
const HomePageTabs = TabNavigator({
    'Cinemas': {screen: HomeScreen},
    'Em Cartaz': {screen: InTheatersScreen},
    'Estreias': {screen: PremiersScreen},
},
{   tabBarComponent: TabBarTop,
    navigationOptions: ({navigation}) => ({
        tabBarOnPress: ({scene, jumpToIndex}) => {
            //if the current tab is selected and the initial route is focused => do nothing
            if (scene.focused === true && scene.route.index === 0) {
                return;
            }
            //if the current tab is not selected => jump to the new tab
            if (scene.focused === false) {
                if(scene.index === 0){ // Cinema
                    curPage = CurPageEnum.CINEMA;
                }
                else { // Em Cartaz
                    curPage = CurPageEnum.INTHEATERS;
                }
                jumpToIndex(scene.index);
            }
            //if the route is not the initial one => pop all stacked routes from the sstack to reach the initial route
            if (scene.route.index !== 0) {
                navigation.popToTop();
            }
        },
    }),
    tabBarOptions: {
        swipeEnabled: false,
        upperCaseLabel: false,
        activeTintColor:'white',
        labelStyle: {
            fontSize: 19,
            fontFamily: 'quicksand',
        },
        indicatorStyle: {
            backgroundColor: '#e0e0e0'
        },

        style: {
            backgroundColor: '#822f3b',
        },
    },
});

/* Homepage header logo */
class HeaderLogo extends React.Component {
    render() {
        return (
            <View style={styles.leftHeader}>
            </View>
        );
    }
}

/* Stack Navigator - is what allows the page flow, creates a stack where a page is inserted when accessed and it's
removed when the navigation bar back button is clicked. The buttons on the navigation bar (search and map update)
reset the stack, redirecting the user to the application's home page. Allows customization of what is shown on the
navigation bar of each existent page */
const Navigator = StackNavigator({
        Home: {screen: HomePageTabs},
        Movie: {screen: MovieScreen},
        CinemaSearch: {screen: CinemaSearch,
            navigationOptions:({navigation}) => ({
                headerTitle: (navigation.state.params.isSearch &&
                    <View style={styles.leftHeader}>
                        <Text style={styles.titleHeader}>Pesquisa: {navigation.state.params.search}</Text>
                    </View>),
                headerRight: (null),
            })},
        MovieSearch: {screen: MovieSearch,
            navigationOptions:({navigation}) => ({
                headerTitle: (
                    <View style={styles.leftHeader}>
                        <Text style={styles.titleHeader}>Pesquisa: {navigation.state.params.search}</Text>
                    </View>),
                headerRight: (null),
            })},
        Cinema: {screen: CinemaTabs,
            navigationOptions:({navigation}) => ({
                headerTitle: (
                    <View style={styles.leftHeader}>
                        <Text style={styles.titleHeader}>{navigation.state.params.name}</Text>
                    </View>),
                headerRight: (null),
            })},
    },
    {
        initialRouteName: 'Home',
        navigationOptions: ({ navigation }) => ({
            headerTitle: <HeaderLogo />,
            headerStyle: {
                backgroundColor: "#9b3a45",
                elevation: 1, // Para não tornar tão acentuado o shadow effect da header
            },
            headerTintColor: '#fff',
                headerTitleStyle: {
                fontWeight: 'normal',
            },
            headerRight: (
                <View
                      style={{
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:'#9b3a45',
                    flexDirection:'row',
                    paddingRight: 10,
                    paddingLeft: 20,}}>
                    <TouchableOpacity onPress={() =>{
                        if(curPage !== CurPageEnum.CINEMA) {
                            if(curPage !== CurPageEnum.INTHEATERS)
                            {
                                navigation.goBack();
                            }
                            navigation.navigate('Cinemas');
                            searchBarObj.show();
                        }
                        else {
                            if(searchBarObj)
                            {
                                if (searchBarObj.isShowing()) {
                                    searchBarObj.hide();
                                }
                                else {
                                    searchBarObj.show();
                                }
                            }
                        }
                    }}>
                        <Image style={{
                            resizeMode: 'contain',
                            height:25,
                            width:25,
                            paddingRight: 40,
                        }} source={require("./assets/img/search.png")}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        if(curPage !== CurPageEnum.CINEMA) {
                            if(curPage !== CurPageEnum.INTHEATERS)
                            {
                                navigation.goBack();
                            }
                            if(searchBarObj)
                            {
                                if (searchBarObj.isShowing()) {
                                    searchBarObj.hide();
                                }
                            }
                            const resetAction = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({ routeName: 'Home' })],
                            });
                            navigation.dispatch(resetAction);
                        }
                        else {
                            if(searchBarObj)
                            {
                                if (searchBarObj.isShowing()) {
                                    searchBarObj.hide();
                                }
                            }
                            const resetAction = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({ routeName: 'Home' })],
                            });
                            navigation.dispatch(resetAction);
                        }
                    }}>
                        <Image style={{
                            resizeMode: 'contain',
                            height:25,
                            width:25,
                            paddingRight: 40,
                        }} source={require("./assets/img/map.png")}/>
                    </TouchableOpacity>
                </View>
            ),
        })
    }
);

/* Application initializer */
export default class App extends React.Component {

    state = {
        appIsReady: false,
    };

    /* Loads Assets */
    async componentDidMount() {
        try {
            await Font.loadAsync({
                'quicksand': require('./assets/fonts/Quicksand_Book.otf'),
                'quicksand-light': require('./assets/fonts/Quicksand_Light.otf'),
                'quicksand-bold': require('./assets/fonts/Quicksand_Bold.otf'),
            });
        }
        catch (e) {
            console.log(e.message);
        }
        finally{
            this.setState({ appIsReady: true });
        }
    }

    render() {
        if(this.state.appIsReady)
            return <Navigator/>;
        else
            return(<View  style={{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
                <ActivityIndicator size="large" color="#9b3a45" />
            </View>);
    }
}

// -----------------------------------------  Styles --------------------------------------------------

const styles = StyleSheet.create({
    searchBarZ:{
        zIndex:100,
        position: 'absolute',
        width:'100%',
    },
    sessionMovieTitle:{
        fontSize: 16,
        color:"#404040",
        fontFamily: 'quicksand',
        paddingTop:5,
        paddingLeft:4,
        paddingRight:4,
    },
    sessionMovieText:{
        fontSize: 13,
        color:"#161616",
        marginTop:2,
        marginBottom:2,
        fontFamily: 'quicksand-light',
    },
    searchBar:{
        backgroundColor: 'white',
        color: '#161616',

    },
    searchButtonsTxt:{
        fontSize: 17,
        fontFamily: 'quicksand',
        color: '#9b3a45',
        textAlign:'center',
        padding:5,
    },
    searchButtonsTxtPressed:{
        fontSize: 17,
        fontFamily: 'quicksand',
        color: 'white',
        textAlign:'center',
        padding:5,
    },
    searchButtonsPressed:{
        justifyContent:'center',
        flex:1,
        height:35,
        backgroundColor:'#9b3a45',
        borderColor:'#9b3a45',
        borderWidth:1,
        margin:.5,
    },
    searchButtons:{
        justifyContent:'center',
        flex:1,
        height:35,
        backgroundColor:'white',
        borderColor:'#9b3a45',
        borderWidth:1,
        margin:.5,
    },
    movieTrailerBtnText:{
         color:"white",
        fontSize: 16,
        fontFamily: 'quicksand',
        padding:10,
        textAlign: 'center',
    },
    movieTrailerBtn:{
        backgroundColor:'#9b3a45',
        flex:1,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
        borderRadius: 25,
    },
    movieScreenText:{
        fontSize: 14,
        lineHeight: 22,
        color:"#161616",
        fontFamily: 'quicksand-light',
        paddingBottom: 3,
        paddingTop: 3,
    },
    movieScreenTextClassTitle:{
        textAlign: 'center',
        fontSize: 16,
        color:"white",
        fontFamily: 'quicksand',
        paddingBottom: 10,
    },
    movieScreenTextWrapper:{
        paddingBottom: 3,
        paddingTop: 3,
        paddingLeft:5,
        paddingRight: 5
    },
    movieScreenTextClass:{
        fontSize: 14,
        color:"white",
        textAlignVertical: 'center',
        fontFamily: 'quicksand-light',
    },
    movieScreenImage:{
        width: '100%',
        height: 180,
    },
    movieScreenTopLeft:{
        flex:2.2
    },
    movieScreenTopRight:{
        flex:4,
        height: 180,
        flexDirection:'column'
    },
    inTheatersListButtonView:{
        flex:1,
        padding:15,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    inTheatersListButton:{
       width:20,
        height:20,
    },
    inTheatersListTextView:{
        flex:4,
        padding:15,
        justifyContent: 'center',
    },
    inTheatersListTextTitle:{
        fontSize: 18,
        color:"#404040",
        fontFamily: 'quicksand',
        paddingBottom:5,
    },
    inTheatersListText:{
        fontSize: 14,
        color:"#161616",
        paddingBottom: 1,
        fontFamily: 'quicksand-light',
    },
    inTheatersListImg:{
        width:105,
        height: 130,
        flex:2,
    },
    inTheatersImg:{
        width:65,
        height: 100,
    },
    inTheatersList:{
        backgroundColor: 'white',
        marginTop:1,
        flexDirection: 'row'
    },

    /* Header */
    rightHeaderButtons:{
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'#9b3a45',
        flexDirection:'row',
        paddingRight: 10,
        paddingLeft: 20,
    },
    headerButtonImage:{
        resizeMode: 'center',
        height:25,
        width:25,
        paddingRight: 40,
    },
    titleHeader:{
        fontSize: 18,
        color:"white",
        fontFamily: 'quicksand',
    },
    leftHeader: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft:25,
        paddingRight:25,
    },
    logo:{
        color: '#fff',
        flex:4,
        flexDirection:'row',
        alignItems: 'center',
        alignSelf:'stretch',
        justifyContent:'flex-start'
    },

    /* Default */
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

AppRegistry.registerComponent('LAPD', () => FlexDimensionsBasics);
