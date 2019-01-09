import React from "react";
import ReactDOM from 'react-dom';
import firebase, {base} from './firebase.js';
import GeoFire from 'geofire';
import Hashids from 'hashids';
import mmnt from 'moment';
import Moment from 'react-moment';
import revgeo from 'reverse-geocoding';
import geolib from 'geolib';
import { StaticGoogleMap, Marker } from 'react-static-google-map';

import HangLink from './hanglink.js';

var hashids = new Hashids('', 5);

var hangHeader = {
  position: "relative",
  backgroundColor: "#34b6ee",
  margin: "0",
  color: "#fff",
  fontWeight: "300",
  padding: "1rem 5rem 1rem 1rem",
  cursor: "pointer",
  fontFamily: "'Poppins', sans-serif",
  boxSizing: "border-box",
  borderTopLeftRadius: "0.5rem",
  borderTopRightRadius: "0.5rem",
  zIndex: "1",
}

var hangHeaderTitle = {
  fontSize: "1.25rem",
  fontWeight: "600",
  lineHeight: "1",
  marginBottom: "0",
  textTransform: "capitalize",
  fontFamily: "'Poppins', sans-serif",
}

var hangDate = {
  background: "#000",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  top: "0",
  right: "0",
  height: "100%",
  padding: "0 1rem",
  textTransform: "uppercase",
  textAlign: "center",
  borderCollapse: "collapse",
  borderTopRightRadius: "0.5rem",
}


var hangMonth = {
  fontSize: "0.75rem",
  lineHeight: "1",
  paddingBottom: "0.33rem",
  display: "block",
}

var hangYear = {
  fontSize: "0.75rem",
  lineHeight: "0",
}

var hangDay = {
  fontFamily: "Josefin Sans, sans-serif",
  fontWeight: "bold",
  fontSize: "1.6rem",
  lineHeight: "0",
}

class OurItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inhang: false,
      key: '',
      hang: '',
      uid: '',
      shortUrl: '',
      mutualFriends: 0,
      openCalendar: false,
      visibility: 'hide'
    }
  }

  claimHang(title,user,datetime,timestamp,lat,lng,address,place,placename) {
    const hangsRef = firebase.database().ref('hangs');
    var key = Date.now();
    key = key.toString().split("").map(num => parseInt(num, 0));
    key = key.splice(8, 5);
    key = key.sort(function(a, b){ return 0.5 - Math.random() });
    const itemHash = hashids.encode(key);

    const hang = {
      hash: itemHash,
      title: title,
      fbid: user.providerData[0].uid,
      uid: user.uid,
      user: user.displayName,
      userphoto: user.photoURL,
      datetime: datetime,
      timestamp: timestamp,
      lat: lat,
      lng: lng,
      address: address,
      place: place,
      placename: placename,
      visibility: 'invite',
    }
    hangsRef.push(hang).then((snap) => {
     let key = snap.key;
     let geoLocationRef = firebase.database().ref('hangs-gl');
     let geoFire = new GeoFire(geoLocationRef);
     geoFire.set(key, [hang.lat, hang.lng]).then(function() {
       console.log("Hang with key:"+key+" added to database");
       }, function(error) {
       console.log("Error: " + error);
     });
     this.props.setMode('hangs');
   });
   this.setState({
     hangKey: key,
   });
   const newPlace = {
     pid: hang.place,
     name: hang.placename,
   }
   const placeRef = firebase.database().ref('places');
   placeRef.orderByChild("pid").equalTo(place).once('value', (snapshot) => {
       if (snapshot.exists()) {
         var place = snapshot.val();
         let key = Object.keys(place)[0];
         const placeHangsRef = firebase.database().ref(`/places/${key}/hangs/`);
         Object.entries(place).map((p) => {
            placeHangsRef.push(this.state.hangKey);
            return;
         });
         console.log('Place exists. Add new hang');
         return;
       }else{
         placeRef.push(newPlace).then((snap) => {
           const newPlaceHangsRef = firebase.database().ref(`/places/${snap.key}/hangs/`);
           newPlaceHangsRef.push(this.state.hangKey);
         });
         console.log('Place created in database. First Hang added');
         return;
       }
   }).catch(function(error) {
     console.log(error);
   });
  }

  placeCallback = (results, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      if(results[1]){
        if(results[1].photos && results[1].photos.length > 0){
          var placePhotoUrl = results[1].photos[0].getUrl({maxWidth:640});
          this.setState({placeimg: placePhotoUrl});
        }
        this.setState({placeid: results[1]['id']});
        this.setState({placename: results[1]['name']});
      }
    }
  }

  getPlace = (lat,lng) => {
    let maploc = new window.google.maps.LatLng(lat,lng);
    let mapdom = ReactDOM.findDOMNode(this.refs.map);

    let map = new window.google.maps.Map(mapdom, {
        center: maploc,
        zoom: 15
      });

    let request = {
      location: maploc,
      radius: '1'
    };

    let service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch(request, this.placeCallback);
  }

  removeHang(id) {
    base.remove(`/hangs/${id}`);
    this.props.onHangChange(id);
  }

  componentDidMount = (result) => {
    if(this.props.geoReady){
      this.getPlace(this.props.hang.lat,this.props.hang.lng);
      let distance = geolib.getDistance(
        {latitude: this.props.geoReady.lat, longitude: this.props.geoReady.lng},
        {latitude: this.props.hang.lat, longitude: this.props.hang.lng}
      );
      distance = (distance/1000) * 0.621371;
      distance = distance.toFixed(1);
      this.setState({distance});
    }
  }

  render() {
    var hangImage = {
      backgroundImage: "url('"+this.state.placeimg+"')",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      overflow: "hidden",
      height: "175px",
      borderBottomLeftRadius: "0.5rem",
      borderBottomRightRadius: "0.5rem",
    }
    let Hang =
      <span>
        <span ref="detail">
        <table width="100%" style={hangHeader} className={'hang-header'}>
          <tbody>
          <tr>
            <td>
              <h2 style={hangHeaderTitle}>{this.props.hang.title}</h2>
              <span className="hang-placetime">
                <Moment format="hh:mm a" className="hang-time">{this.props.hang.datetime}</Moment> @ {this.props.hang.placename}
              </span>
            </td>
            <td>
              <table style={hangDate}>
                <tbody>
                <tr>
                  <td>
                <Moment format="MMM" className="hang-month" style={hangMonth}>{this.props.hang.datetime}</Moment>
                  </td>
                </tr>
                <tr>
                  <td>
                <Moment format="DD" className="hang-day" style={hangDay}>{this.props.hang.datetime}</Moment>
                  </td>
                </tr>
                <tr>
                  <td>
                <Moment format="YYYY" className="hang-year" style={hangYear}>{this.props.hang.datetime}</Moment>
                  </td>
                </tr>
                </tbody>
              </table>
              <button
                className="btn-hang-action"
                onClick={() =>
                  this.claimHang(
                    this.props.hang.title,
                    this.props.user,
                    this.props.hang.datetime,
                    this.props.hang.timestamp,
                    this.props.hang.lat,
                    this.props.hang.lng,
                    this.props.hang.address,
                    this.props.hang.place,
                    this.props.hang.placename,
                  )
                }>
                <i className="fa fa-plus"></i> Add
              </button>
            </td>
          </tr>
          </tbody>
        </table>
        <div className="hang-item-graphic" style={hangImage}>
        {!this.state.placeimg &&
        <div>
          <div id="map" ref={'map'} />
          <a target="_blank" href={'https://www.google.com/maps/search/?api=1&query='+this.props.hang.lat+'%2C'+this.props.hang.lng+'&query_place_id='+this.props.hang.place}>
            <StaticGoogleMap
              size={this.props.mapsize}
              center={this.props.hang.lat+','+this.props.hang.lng}
              zoom="18"
              apiKey="AIzaSyCkDqWy12LJpqhVuDEbMNvbM_fbG_5GdiA"
            >
              <Marker location={this.props.hang.lat+','+this.props.hang.lng} color="0xff0000" />
            </StaticGoogleMap>
          </a>
        </div>
        }
        </div>
        </span>
      </span>;

    let OurItem = <div className={'hang-item show'} key={this.state.key}>{Hang}</div>;

    return OurItem;

  }
}

export default OurItem;
