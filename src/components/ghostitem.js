import React from "react";
import ReactDOM from 'react-dom';
import firebase from './firebase.js';
import GeoFire from 'geofire';
import Hashids from 'hashids';
import Moment from 'react-moment';
import revgeo from 'reverse-geocoding';
import { StaticGoogleMap, Marker } from 'react-static-google-map';

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

class GhostItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      placename: '',
      placeid: '',
      hangKey: '',
    }
    this.getPlace = this.getPlace.bind(this);
    this.placeCallback = this.placeCallback.bind(this);
  }

  placeCallback = (results, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      if(results[1]){
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

  claimHang(title,user,datetime,lat,lng,address,e) {
    e.preventDefault();
    this.setState({
      mode: 'global',
    });
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
      timestamp: Date.parse(datetime),
      lat: lat,
      lng: lng,
      address: address,
      place: this.state.placeid,
      placename: this.state.placename,
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
     this.props.setMode('global');
   });
   this.setState({
     hangKey: key,
   });
   const newPlace = {
     pid: hang.place,
     name: hang.placename,
   }
   const placeRef = firebase.database().ref('places');
   placeRef.orderByChild("pid").equalTo(this.state.placeid).once('value', (snapshot) => {
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

  getLocale(lat,lng){
    var geocode = {
      'latitude': lat,
      'longitude': lng,
    };

    var location = async () => {
    return new Promise((resolve, reject) => {
      revgeo.location(geocode, (err, result) => {
          if(err){
            console.log(err);
            reject(err);
          }else{
            let address = result.results[0].formatted_address;
            if(this.state.address !== address){
              this.setState({address});
              resolve(address);
            }
            resolve();
            return;
          }
          return;
        });
      });
    };

    return location();
  }

  componentDidMount(){
    this.getPlace(this.props.event.location[1],this.props.event.location[0]);
  }

  render() {
    let Event =
      <span>
        <span ref="detail">
        <table width="100%" style={hangHeader} className={'hang-header'}>
          <tbody>
          <tr>
            <td>
              <h2 style={hangHeaderTitle}>{this.props.event.title}</h2>
              <span className="hang-placetime">
                <Moment
                  format="hh:mm a"
                  className="hang-time">
                  {this.props.event.start}
                </Moment> @ {this.state.placename}
              </span>
            </td>
            <td>
              <table style={hangDate}>
                <tbody>
                <tr>
                  <td>
                <Moment format="MMM" className="hang-month" style={hangMonth}>{this.props.event.start}</Moment>
                  </td>
                </tr>
                <tr>
                  <td>
                <Moment format="DD" className="hang-day" style={hangDay}>{this.props.event.start}</Moment>
                  </td>
                </tr>
                <tr>
                  <td>
                <Moment format="YYYY" className="hang-year" style={hangYear}>{this.props.event.start}</Moment>
                  </td>
                </tr>
                </tbody>
              </table>
              <button
                className="claim-hang"
                onClick={(e) =>
                  this.claimHang(
                    this.props.event.title,
                    this.props.user,
                    this.props.event.start,
                    this.props.event.location[1],
                    this.props.event.location[0],
                    this.state.placename,
                    e
                  )
                }>
                <i className="fa fa-plus"></i> Add
              </button>
            </td>
          </tr>
          </tbody>
        </table>
        <div className="hang-item-graphic">
        <div id="map" ref={'map'} />
        <a target="_blank" href={'https://www.google.com/maps/search/?api=1&query='+this.props.event.location[1]+'%2C'+this.props.event.location[0]+'&query_place_id='+this.props.event.place}>
          <StaticGoogleMap
            size={this.props.mapsize}
            center={this.props.event.location[1]+','+this.props.event.location[0]}
            zoom="18"
            apiKey="AIzaSyCkDqWy12LJpqhVuDEbMNvbM_fbG_5GdiA"
          >
            <Marker location={this.props.event.location[1]+','+this.props.event.location[0]} color="0xff0000" />
          </StaticGoogleMap>
        </a>
        </div>
        </span>
      </span>;

      return <div className={'hang-item show'} key={this.state.key}>{Event}</div>;
  }
}

export default GhostItem;
