import React from 'react';
import { Font, AppLoading, MapView, Permissions } from 'expo';
import { ActivityIndicator, AppRegistry, Dimensions, StyleSheet, Text, View, StatusBar, Button, TouchableOpacity, TouchableNativeFeedback, TouchableHighlight, Image, TextInput, ScrollView } from 'react-native';
import { StackNavigator, TabBarTop, TabNavigator } from 'react-navigation';
import SearchBar from 'react-native-searchbar';
const config = require('./config/config');

var SearchEnum = {
    NONE: 0,
    CINEMA: 1,
    LOCATION: 2,
};

var CurPageEnum = {
    CINEMA: 0,
    INTHEATERS: 1,
    OTHER: 2,
};

var searchType = SearchEnum.NONE;
var searchBarCinemas = null;
var searchBarInTheaters = null;
var curPage = CurPageEnum.CINEMA;

/* API Calls -------------------------------------------------------------------------------------------------- */

async function getMapMarkers() {
    // TODO ir buscar info do scraping e meter neste array
    return  [{id: 0, title:'Marker 1', description: "d1", coords: {latitude:41.183409, longitude: -8.599136 }},
        {id: 1, title:'Marker 2', description: "d2", coords: {latitude:41.185261, longitude: -8.593759 }},
        {id: 2, title:'Marker 3', description: "d3", coords: {latitude:41.187303, longitude: -8.599426 }},
        {id: 3, title:'Marker 4', description: "d4", coords: {latitude:41.153489, longitude: -8.614887 }}
    ];
}

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
        movie:[],
    };

    static navigationOptions = ({ navigation }) => ({
        headerTitle: (
            <View style={styles.leftHeader}>
                <Text style={styles.titleHeader}>{navigation.state.params.movie.name}</Text>
            </View>),
    headerRight: (null),
    });

    async componentDidMount() {
        curPage = CurPageEnum.OTHER;

        this.setState({movie: this.props.navigation.state.params.movie});
        if(this.state.movie !== [])
        {
            this.setState({isReady: true});
        }
    }

    render(){
        if(this.state.isReady) {
            return (<ScrollView keyboardShouldPersistTaps="always"
                                keyboardDismissMode='on-drag'>
                <View style={{flexDirection: 'row', margin: 4}}>
                    <View style={styles.movieScreenTopLeft}>
                        <Image source={{uri: this.state.movie.imageurl}} style={styles.movieScreenImage}/>
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
                                    <Text>{this.state.movie.ratings[0]['Value']}</Text>
                                </Text>
                            </View>
                            <View style={[styles.movieScreenTextWrapper, {flexDirection: 'row'}]}>
                                <Image style={{width: 30, height: 32}} source={require('./assets/img/rt.png')}/>
                                <Text style={[styles.movieScreenTextClass, {justifyContent: 'center'}]}>
                                    <Text style={{fontWeight: 'bold'}}> Rotten Tomatoes: </Text>
                                    <Text>{this.state.movie.ratings[1]['Value']}</Text>
                                </Text>
                            </View>
                            <View style={[styles.movieScreenTextWrapper, {flexDirection: 'row'}]}>
                                <Image style={{width: 30, height: 30}} source={require('./assets/img/mc.png')}/>
                                <Text style={[styles.movieScreenTextClass, {justifyContent: 'center'}]}>
                                    <Text style={{fontWeight: 'bold'}}> Meta Critic: </Text>
                                    <Text>{this.state.movie.ratings[2]['Value']}</Text>
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
                        <Text>{this.state.movie.name} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Titulo Original: </Text>
                        <Text>{this.state.movie.imdbtitle}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Género: </Text>
                        <Text>{this.state.movie.genre}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Estreia em Portugal: </Text>
                        <Text>{this.state.movie.publishedDate}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Classificação Etária: </Text>
                        <Text>{this.state.movie.minAge}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Duração: </Text>
                        <Text>{this.state.movie.duration}</Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Sinopse: </Text>
                        <Text>{this.state.movie.description} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Com: </Text>
                        <Text>{this.state.movie.actors} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText, {borderBottomWidth: 1, borderBottomColor: "#f1f1f1"}]}>
                        <Text style={{fontFamily: 'quicksand'}}> Realização: </Text>
                        <Text>{this.state.movie.realizacao} </Text>
                    </Text>
                    <Text style={[styles.movieScreenText]}>
                        <Text style={{fontFamily: 'quicksand'}}> Produção: </Text>
                        <Text>{this.state.movie.director} </Text>
                    </Text>
                </View>
                <View style={{flexDirection: 'column', justifyContent: 'space-between'}}>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableNativeFeedback onPress={() => {
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

class HomeScreen extends React.Component {
    state = {
        isReady: false,
        search: searchType,
        location: {coords: {latitude: 38.730481, longitude: -9.146430}},
        markers: [],
        searchResults: [],
    };

    handleSearch() {
        searchBarCinemas.hide();
        let results = getSearchResults();
        this.setState({searchResults: results, search: searchType});
    }


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
                    console.log(json);
                    this.setState({markers: json});
                };

                request();
            }
            finally {
                this.setState({ isReady: true });
            }
        }
    }

    // TODO não sei se este método vai ser necessário
    onRegionChange(region) {
    }


   render(){
      const { navigate } = this.props.navigation;
      if(this.state.isReady) {
          if(this.state.search !== SearchEnum.CINEMA) {
              return (
                  <View style={{backgroundColor: 'black', flex: 1}}>
                      <SearchBar ref={(ref) => searchBarCinemas = ref} onSubmitEditing={() => this.handleSearch() }
                                 placeholder={'Pesquisa'} fontFamily={'quicksand'} fontSize={18} clearOnShow/>
                      <MapView
                          style={{
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
                      <SearchBar ref={(ref) => searchBarCinemas = ref} onSubmitEditing={() => this.handleSearch()}
                                 placeholder={'Pesquisa'} fontFamily={'quicksand'} fontSize={18} clearOnShow/>
                  {this.state.searchResults.map((cinema) => (

                      <TouchableNativeFeedback key = {cinema.id}  onPress={() =>
                          navigate('Cinema', { id: cinema.id }) // TODO AINDA NAO EXISTE ESTA PAGINA
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
      else {
          return(<View/>);
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

    /* Navega para a página do filme */
    _onPressMovie(id) {
        alert('You tapped the button with id=' + id + '!');
    }

    handleSearch() {
        searchBarInTheaters.hide();
        this.setState({ search: searchType });
        this.props.navigation.navigate('Cinemas');
    }

    render(){
        const { navigate } = this.props.navigation;
        if(this.state.isReady) {
            return(<ScrollView style = {{backgroundColor: '#f4f4f4'}}
                               keyboardShouldPersistTaps="always"
                               keyboardDismissMode='on-drag'>
                    <SearchBar ref={(ref) => searchBarInTheaters = ref} onSubmitEditing={() => this.handleSearch()}
                               placeholder={'Pesquisa'} fontFamily={'quicksand'} fontSize={18} clearOnShow/>
                    {this.state.movies.map((movie) => (

                        <TouchableNativeFeedback key = {movie.name}  onPress={() =>
                            navigate('Movie', { movie: movie })
                        }>
                        <View style = {styles.inTheatersList}>
                            <Image source={{uri: movie.imageurl}} style = {styles.inTheatersListImg}/>
                            <View style = {styles.inTheatersListTextView}>
                                <Text style = {styles.inTheatersListTextTitle}>{movie.name}</Text>
                                <Text style = {styles.inTheatersListText}>{movie.genre}</Text>
                                <Text style = {styles.inTheatersListText}>{movie.minAge}</Text>
                                <Text style = {styles.inTheatersListText}>{movie.duration}</Text>
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
                console.log("Index Scene: "+  scene.index);
                if(scene.index === 0){ // Cinema
                    curPage = CurPageEnum.CINEMA;
                }
                else { // Em Cartaz
                    curPage = CurPageEnum.INTHEATERS;
                }
                console.log("CurPage " + curPage);
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

class RightHeaderButtons extends React.Component {

    _onCinemaSearchPress(){

        searchType = SearchEnum.CINEMA;
        console.log(searchType + " " + curPage);
        if(curPage == CurPageEnum.CINEMA)
        {
            if(searchBarCinemas != null) {
                searchBarCinemas.show();
            }
        }
        if(curPage == CurPageEnum.INTHEATERS)
        {
            if(searchBarInTheaters != null) {
                searchBarInTheaters.show();
            }
        }
    };

    _onLocationSearchPress(){
        searchType = SearchEnum.LOCATION;
        console.log(searchType + " " + curPage);
        if(curPage == CurPageEnum.CINEMA)
        {
            if(searchBarCinemas != null) {
                searchBarCinemas.show();
            }
        }
        if(curPage == CurPageEnum.INTHEATERS)
        {
            if(searchBarInTheaters != null) {
                searchBarInTheaters.show();
            }
        }
    };

    render() {
        return (
            <View style={styles.rightHeaderButtons}>
                <TouchableOpacity onPress={this._onCinemaSearchPress}>
                    <Image style={styles.headerButtonImage} source={require("./assets/img/search.png")}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._onLocationSearchPress}>
                    <Image style={styles.headerButtonImage} source={require("./assets/img/map.png")}/>
                </TouchableOpacity>
            </View>
        );
    }
}

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
        navigationOptions: {
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
                <RightHeaderButtons/>
            ),
        }
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
