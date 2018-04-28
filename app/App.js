import React from 'react';
import { WebBrowser, Font, AppLoading, MapView, Permissions } from 'expo';
import { Picker, ActivityIndicator, AppRegistry, Dimensions, StyleSheet, Text, View, StatusBar, Button, TouchableOpacity,
    TouchableNativeFeedback, Linking, TouchableHighlight, Image, TextInput, ScrollView } from 'react-native';
import { StackNavigator, TabBarTop, TabNavigator } from 'react-navigation';

const config = require('./config/config');

const SearchEnum = {
    NONE: 0,
    CINEMA: 1,
    LOCATION: 2,
    MOVIE: 3,
};

const CurPageEnum = {
    CINEMA: 0,
    INTHEATERS: 1,
    OTHER: 2,
};

let searchType = SearchEnum.NONE;
let searchBarObj = null;
let searchBarInTheaters = null;
let curPage = CurPageEnum.CINEMA;

/* API Calls -------------------------------------------------------------------------------------------------- */

function getSearchResults() {
    // TODO ir buscar info do scraping e meter neste array
    return  [{id: 0, name:'Marker 1', location: "d1"},
        {id: 1, name:'Marker 1', location: "d1"},
        {id: 2, name:'Marker 1', location: "d1"},
        {id: 3, name:'Marker 1', location: "d1"},
    ];
}

/* Movie Info Page -------------------------------------------------------------------------------------------------- */

class MovieScreen extends React.Component{
    state = {
        isReady: false,
        name:"",
        info:[],
        ratingImdb:"-",
        ratingRt:"-",
        ratingMc:"-",
    };

    static navigationOptions = ({ navigation }) => ({
        headerTitle: (
            <View style={styles.leftHeader}>
                <Text style={styles.titleHeader}>{navigation.state.params.name}</Text>
            </View>),
    headerRight: (null),
    });

    async componentDidMount() {
        curPage = CurPageEnum.OTHER;

        try {
            console.log('http://' + config.ip + ':3000/movie/"' + this.props.navigation.state.params.name + '"');
            /* REQUEST DA INFO FILME */
            const request = async () => {
                const response = await fetch('http://' + config.ip + ':3000/movie/"' + this.props.navigation.state.params.name + '"', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                       }});
                const json = await response.json();
                this.setState({info: json});
                console.log(json);

                if(this.state.info.ratings !== [])
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
            return (<ScrollView keyboardShouldPersistTaps="always"
                                keyboardDismissMode='on-drag'>
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
                                <Image style={{width: 30, height: 32}} source={require('./assets/img/rt.png')}/>
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
                <View style={{flexDirection: 'column', justifyContent: 'space-between'}}>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableNativeFeedback onPress={() => {
                            WebBrowser.openBrowserAsync('https:' + this.state.info.trailer);
                        }}>
                            <View style={styles.movieTrailerBtn}>
                                <Text style={styles.movieTrailerBtnText}> Ver Trailer</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
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

/* Homepage Screens ------------------------------------------------------------------------------------------------- */

/* Localização do mapa */
async function getLocationAsync() {
    const { Location } = Expo;
    return Location.getCurrentPositionAsync({enableHighAccuracy: true});
}

class SearchBar extends React.Component {
    state = {
        text: "",
        search_bar: null,
    };

    onSubmit(text){
        console.log(text);
    };

    render() {
        console.log('importante: ' + this.props.search);
        return (
            <View>
                <View style={{flexDirection:'row', padding:2, alignItems:'center', justifyContent:'center',backgroundColor:'#fff'}}>
                    <View style={{paddingLeft:15, flex:1}}>
                        <TouchableNativeFeedback onPress={() => this.search_bar.clear() }>
                            <Image source={ require('./assets/img/cancel3.png') } style={ {width: 20, height: 20 } } />
                        </TouchableNativeFeedback>
                    </View>
                    <View style={{flex:6,padding:2,  paddingRight: 5, justifyContent:'center', height:50}}>
                        <TextInput
                            onChangeText={(text) => this.setState({text})}
                            value={this.state.text}
                            style={{backgroundColor:'transparent', fontFamily:'quicksand', fontSize:18, paddingLeft:20, paddingRight:20}}
                            onSubmitEditing = {()=>{this.onSubmit(this.state.text)}}
                            placeholder="Search"
                            ref={element => {
                                this.search_bar = element
                            }}
                            autoCorrect={false}
                            underlineColorAndroid='transparent'
                        />
                    </View>
                    <View style={{paddingLeft:10,flex:1}}>
                        <TouchableNativeFeedback onPress={() => this.onSubmit(this.state.text) }>
                            <Image source={ require('./assets/img/search2.png') } style={ { width: 25, height: 25 } } />
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </View>
        );
    }
}

class Search extends React.Component {
    state = {
        search: SearchEnum.CINEMA,
        showing: false,
        text: "",
    };

    show(){
        this.setState({showing: true});
    }

    hide(){
        this.setState({showing: false});
    }

    isShowing(){
        return this.state.showing;
    }

    render(){
        console.log('este é o search: ' + this.state.search);
        if(this.state.showing) {
            if (this.state.search === SearchEnum.CINEMA || this.state.search === SearchEnum.NONE) {
                return (
                    <View>
                        <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
                            <View style={styles.searchButtonsPressed}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.CINEMA})
                                }}>
                                    <Text style={styles.searchButtonsTxtPressed}>Cinema</Text>
                                </TouchableNativeFeedback>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.MOVIE})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Filme</Text>
                                </TouchableNativeFeedback>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.LOCATION})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Localização</Text>
                                </TouchableNativeFeedback>
                            </View>
                        </View>
                        <SearchBar search={this.state.search}/>
                    </View>
                )
            }
            else if (this.state.search === SearchEnum.MOVIE) {
                return (
                    <View>
                        <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
                            <View style={styles.searchButtons}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.CINEMA})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Cinema</Text>
                                </TouchableNativeFeedback>
                            </View>
                            <View style={styles.searchButtonsPressed}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.MOVIE})
                                }}>
                                    <Text style={styles.searchButtonsTxtPressed}>Filme</Text>
                                </TouchableNativeFeedback>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.LOCATION})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Localização</Text>
                                </TouchableNativeFeedback>
                            </View>
                        </View>
                        <SearchBar search={this.state.search}/>
                    </View>
                )
            }
            else if (this.state.search === SearchEnum.LOCATION) {
                return (
                    <View>
                        <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
                            <View style={styles.searchButtons}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.CINEMA})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Cinema</Text>
                                </TouchableNativeFeedback>
                            </View>
                            <View style={styles.searchButtons}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.MOVIE})
                                }}>
                                    <Text style={styles.searchButtonsTxt}>Filme</Text>
                                </TouchableNativeFeedback>
                            </View>
                            <View style={styles.searchButtonsPressed}>
                                <TouchableNativeFeedback onPress={() => {
                                    this.setState({search: SearchEnum.LOCATION})
                                }}>
                                    <Text style={styles.searchButtonsTxtPressed}>Localização</Text>
                                </TouchableNativeFeedback>
                            </View>
                        </View>
                        <SearchBar search={this.state.search}/>
                    </View>
                )
            }
            else return(null);
        }
        else return(null);
    };

}

class HomeScreen extends React.Component {
    state = {
        isReady: false,
        search: searchType,
        location: {coords: {latitude: 38.730481, longitude: -9.146430}},
        markers: [],
        searchResults: [],
    };

    /* Vai buscar as permissões de localização e os marcadores */
    async componentDidMount() {

        /* Isto é necessário para ele fazer update e conseguir abrir a janela do search */
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.CINEMA)
                    curPage = CurPageEnum.CINEMA;
            }
        );

        try {
            let { status } = await Permissions.askAsync(Permissions.LOCATION);
            if (status !== 'granted') {
                this.setState({ isReady: true });
            }
            else {
                let location = await getLocationAsync();
                this.setState({location: location});
            }
        }
        catch (e) {
            console.log(e.message);
        }
        finally {
            try{
                /* REQUEST DOS MARKERS */
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

    // TODO não sei se este método vai ser necessário - só fazer render dos pontos em que está perto
    onRegionChange(region) {
    }

   render(){
      const { navigate } = this.props.navigation;
      if(this.state.isReady) {
              return (
                  <View style={{backgroundColor: 'black', flex: 1}}>
                      <Search style={{zIndex:5, position: 'absolute', top:0, left:0}} ref={(ref) => searchBarObj = ref} />
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
                          }}
                          onRegionChange={this.onRegionChange}>
                          {this.state.markers.length > 0 && this.state.markers.map((marker) => (
                              <MapView.Marker
                                  key={marker.name}
                                  coordinate={{
                                      latitude: Number(marker.geo[0].latitude),
                                      longitude: Number(marker.geo[0].longitude)
                                  }}
                                  title={marker.name}
                              />
                          ))}
                      </MapView>

                  </View>);
          }
          else {
              return( <ScrollView style={{flex: 1}}>
                  {this.state.searchResults.map((cinema) => (

                      <TouchableNativeFeedback key = {cinema.id}  onPress={() =>
                          navigate('CinemaInfo', { id: cinema.id }) // TODO AINDA NAO EXISTE ESTA PAGINA
                      }>
                          <View style = {styles.inTheatersList}>
                              <View style = {styles.inTheatersListTextView}>
                                  <Text  style = {styles.inTheatersListTextTitle}>{cinema.name}</Text>

                                  <Text style = {styles.inTheatersListText}>  <Image style={{width:30, height:40}} source={require('./assets/img/location.png')}/> <Text>{cinema.location}</Text></Text>
                              </View>
                              <View style = {styles.inTheatersListButtonView}>
                                  <Image
                                      style={styles.inTheatersListButton}
                                      source={require('./assets/img/next.png')}
                                  />
                              </View>
                          </View>
                      </TouchableNativeFeedback>
                  ))
                  }
              </ScrollView>);
          }
      }
}

class InTheatersScreen extends React.Component{
    state = {
        isReady: false,
        movies: [],
    };

    /* Vai buscar a lista dos filmes */
    async componentDidMount() {

        /* Isto é necessário para ele fazer update e conseguir abrir a janela do search */
        willFocus = this.props.navigation.addListener(
            'willFocus',
            payload => {
                this.forceUpdate();
                if(curPage !== CurPageEnum.INTHEATERS)
                    curPage = CurPageEnum.INTHEATERS;
            }
        );

        try {
            /* REQUEST DOS FILMES */
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
            return(
                <ScrollView style = {{backgroundColor: '#f4f4f4'}}
                               keyboardShouldPersistTaps="always"
                               keyboardDismissMode='on-drag'>
                    {this.state.movies.map((movie) => (

                        <TouchableNativeFeedback key = {movie.name}  onPress={() =>
                            navigate('Movie', { name: movie.name })
                        }>
                        <View style = {styles.inTheatersList}>
                            <Image source={{uri: movie.imageurl}} style = {styles.inTheatersListImg}/>
                            <View style = {styles.inTheatersListTextView}>
                                <Text style = {styles.inTheatersListTextTitle}>{movie.name}</Text>
                                <Text style = {styles.inTheatersListText}>{movie.genre}</Text>
                                <Text style = {styles.inTheatersListText}>{movie.minAge}</Text>
                                <Text style = {styles.inTheatersListText}>{movie.duration} minutos</Text>
                            </View>
                            <View style = {styles.inTheatersListButtonView}>
                                    <Image
                                        style={styles.inTheatersListButton}
                                        source={require('./assets/img/next.png')}
                                    />
                            </View>
                        </View>
                        </TouchableNativeFeedback>
                        ))
                    }
                </ScrollView>
            );
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

/* Homepage Tabs ---------------------------------------------------------------------------------------------------- */

const HomePageTabs = TabNavigator({
    'Cinemas': {screen: HomeScreen},
    'Em Cartaz': {screen: InTheatersScreen},
},
{   tabBarComponent: TabBarTop,
    navigationOptions: ({navigation}) => ({
        tabBarOnPress: ({scene, jumpToIndex}) => {
            if (scene.focused === true && scene.route.index === 0) { //if the current tab is selected and the initial route is focused => do nothing
                return;
            }
            if (scene.focused === false) { //if the current tab is not selected => jump to the new tab
                if(scene.index === 0){ // Cinema
                    curPage = CurPageEnum.CINEMA;
                }
                else { // Em Cartaz
                    curPage = CurPageEnum.INTHEATERS;
                }
                jumpToIndex(scene.index);
            }
            if (scene.route.index !== 0) { //if the route is not the initial one => pop all stacked routes from the sstack to reach the initial route
                navigation.popToTop();
            }
        },
    }),
    tabBarOptions: {
        swipeEnabled: false,
        upperCaseLabel: false,
        activeTintColor:'white',
        labelStyle: {
            fontSize: 21,
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

/* Homepage Header -------------------------------------------------------------------------------------------------- */

/* Para pôr o logo aqui */
class HeaderLogo extends React.Component {
    render() {
        return (
            <View style={styles.leftHeader}>
            </View>
        );
    }
}

const Navigator = StackNavigator({
        Home: {screen: HomePageTabs},
        Movie: {screen: MovieScreen},
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
                <View style={{
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor:'#9b3a45',
                    flexDirection:'row',
                    paddingRight: 10,
                    paddingLeft: 20,}}>
                    <TouchableOpacity onPress={() =>{
                        if(curPage !== CurPageEnum.CINEMA) {
                            navigation.navigate('Cinemas');
                            searchBarObj.show();
                        }
                        else {
                            if (searchBarObj.isShowing()) {
                                searchBarObj.hide();
                            }
                            else {
                                searchBarObj.show();
                            }
                        }
                    }}>
                        <Image style={{
                            resizeMode: 'center',
                            height:25,
                            width:25,
                            paddingRight: 40,
                        }} source={require("./assets/img/search.png")}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        if(curPage !== CurPageEnum.CINEMA) {
                            navigation.navigate('Cinemas');
                            searchBarObj.hide();
                        }
                        else {
                            if (searchBarObj.isShowing()) {
                                searchBarObj.hide();
                            }
                        }
                    }}>
                        <Image style={{
                            resizeMode: 'center',
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

// --------------------------------- Inicializador da App ---------------------------------------------

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
