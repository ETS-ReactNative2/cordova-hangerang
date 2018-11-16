import React from "react";
import Async from 'react-promise';
import firebase from './firebase.js';
import GeoFire from 'geofire';
import mmnt from 'moment';
import revgeo from 'reverse-geocoding';
import {geolocated} from 'react-geolocated';
import Client from 'predicthq';

class Geolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: this.props.address,
      movies: []
    }
  }

  getEventful = (lat, lng) => {
    let latlng = lat+','+lng;
    window.EVDB.API.call("/events/search/", {
      app_key: 'NGCsrxtcNTCCgjfW',
      keywords: 'music',
      location: latlng,
      within: "5km",
      date: "This Week",
      sort: "date",
      change_multi_day_start: false,
    }, function(results) {
      console.log(results);
    });
  }

  uniq(a, param){
    return a.filter(function(item, pos, array){
        return array.map(function(mapItem){ return mapItem[param]; }).indexOf(item[param]) === pos;
    })
  }

  getLocale(lat,lng,user){

      let usersRef = firebase.database().ref('members');
      let usersGeoRef = firebase.database().ref('members-gl');
      let geoUser = new GeoFire(usersGeoRef);

      usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var key = Object.keys(snapshot.val())[0];
          geoUser.set(key, [lat, lng]).then(() => {
              this.props.setGeoLocation({ geoReady: true, lat, lng });
              //this.getEventful(lat, lng);
              var client = new Client({access_token: "kMliRxAqc49wNf6jmtxJLRBYAqW2Tr"});
              let m = mmnt();
              client.events.search({
                'limit': 25,
                'within': '8km@'+lat+','+lng,
                'start.gte': m.add(1, 'day').format('YYYY-MM-DD'),
                'start.lt': m.add(5, 'day').format('YYYY-MM-DD'),
                'relevance':'rank',
                'category':'concerts,festivals,performing-arts,sports','sort':'start'})
              .then((r) => {
                  let results = r.result.results;
                  this.props.setNearEvents({ results });
                  return;
              }).catch(function(error){
               console.info(error);
               return;
              });
            }, function(error) {
            console.log("Error: " + error);
          });
        }
      });

      var geocode = {
          'latitude': lat,
          'longitude': lng
      };

      var location = async () => {
      return new Promise((resolve, reject) => {
        revgeo.location(geocode, (err, result) => {
            if(err){
              console.log(err);
              reject(err);
            }else{
              let address = result.results[4].formatted_address;
              if(this.props.address !== address){
                this.props.setAddress(address);
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

  render() {
    return (
    <div className="user-geolocation">
        { !this.props.address ?
          !this.props.isGeolocationAvailable
          ? <div>Your browser does not support Geolocation</div>
          : !this.props.isGeolocationEnabled
            ? <div>Geolocation is not enabled</div>
            : this.props.coords
              ?
                 <div className="hangs-nearby">
                   <Async
                     promise={this.getLocale(this.props.coords.latitude,this.props.coords.longitude,this.props.user)}
                    />
                   <h3>
                     <i className={'fa fa-map-marker'}></i> <span>{this.props.address}</span>
                   </h3>
                 </div>
              : <div className="hangs-nearby"><h3>Getting location <i className="fa fa-circle-o-notch fa-spin"></i></h3></div>
            : <div className="hangs-nearby">
               <h3>
                 <i className={'fa fa-map-marker'}></i> <span>{this.props.address}</span>
               </h3>
             </div>
        }
    </div>
    )
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
    maximumAge: 0,
    timeout: 10000,
  },
  watchPosition: true,
  userDecisionTimeout: 8000,
})(Geolocation);
