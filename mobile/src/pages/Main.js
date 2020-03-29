import React,{useEffect,useState} from 'react';
import { View, Image,Text,TextInput,TouchableOpacity } from 'react-native';
import MapView,{Marker, Callout} from 'react-native-maps';
import { StyleSheet } from 'react-native';
import {getCurrentPositionAsync,requestPermissionsAsync} from 'expo-location'
import {MaterialIcons} from '@expo/vector-icons'
import api from '../services/api';
import {connect,disconnect,subscribeToNewDevs} from '../socket';
function Main({navigation}) {

  const [currentRegion,setcurrentRegion] = useState(null);
  const [devs,setDevs] = useState([]);
  const [techs,setTechs] = useState('');
  
  

  useEffect(() =>{
    async function loadInitialPosition(){
    const {granted} = await requestPermissionsAsync();
    if(granted){
      const {coords} = await getCurrentPositionAsync({
        enableHighAccuracy:true
      });
      const {latitude,longitude} = coords;
      setcurrentRegion({
        latitude,
        longitude,
        latitudeDelta:0.02,
        longitudeDelta:0.02,
      })
    }
    }
    loadInitialPosition();
  },[]);

  useEffect(() => {
    subscribeToNewDevs(dev => setDevs([...devs, dev]));
  }, [devs]);
  

  function handleRegionChange(region){
    setcurrentRegion(region)
  }

  function setupWebSocket(){
    disconnect()
    const {latitude,longitude} = currentRegion;
    connect(
      latitude,
      longitude,
      techs,
    );
  }

  async function loadDevs(){
    const {latitude,longitude} = currentRegion;
    
    const response = await api.get('/search',
    {
      params:{
        latitude,
        longitude,
        techs,
      }
    })

    setDevs(response.data)
    setupWebSocket(response.data)
  }

  if(!currentRegion)
    return <View/>;

  return (
    <>
    <MapView 
      onRegionChangeComplete={handleRegionChange}
      initialRegion={currentRegion}
      style={styles.map}
    >
      {devs.map( dev => (
        <Marker
          key={dev._id} 
          coordinate= {{
            longitude:dev.location.coordinates[0],
            latitude:dev.location.coordinates[1],
        }}>
        <Image 
          source={{uri: dev.avatar_url}} 
          style={styles.avatar} 
        />
        <Callout onPress={() => {
          // navegação
          navigation.navigate('Profile',{github_username:dev.github_username})
        }}>
          <View style={styles.callout}>
            <Text style={styles.devname} >{dev.name}</Text>
            <Text style={styles.devbio} > {dev.bio} </Text>
            <Text style={styles.devtechs} >{dev.techs.join(', ') }</Text>
          </View>
        </Callout>
      </Marker>
      ))}
    </MapView>
    <View style={styles.searchForm} behavior={"padding"}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar devs por tecnologias..."
        placeholderTextColor='#999'
        autoCapitalize='words'
        autoCorrect={false}
        value={techs}
        onChangeText={setTechs}
      />
      <TouchableOpacity style = {styles.loadButton} onPress={loadDevs}>
        <MaterialIcons name='my-location'size={20} color="#fff"/>
      </TouchableOpacity>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  map:{
    flex:1
  },
  avatar:{
    width:54,
    height:54,
    borderRadius:4,
    borderWidth:4,
    borderColor:'#fff'
  },
  callout:{
    width:250
  },
  devname:{
    fontWeight:'bold',
    fontSize:16,
  },
  devbio:{
    color:'#666',
    marginTop:5
  },
  devtechs:{
    marginTop:5
  },
  searchForm:{
    position:'absolute',
    bottom:20,
    left:20,
    right:20,
    zIndex:5,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  searchInput:{
    flex:1,
    height:50,
    backgroundColor:'#fff',
    borderRadius:25,
    paddingHorizontal:20,
    fontSize:16,
    elevation:2
  },
  loadButton:{
    width:50,
    height:50,
    borderRadius:25,
    backgroundColor:'#8e4dff',
    alignItems:'center',
    justifyContent:'center',
    marginLeft:15,
  }
})

export default Main


