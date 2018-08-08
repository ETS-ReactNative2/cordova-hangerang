import React from "react";
import Async from 'react-promise';
import firebase from './firebase.js';
import GeoFire from 'geofire';
import revgeo from 'reverse-geocoding';
import {geolocated} from 'react-geolocated';

class Geolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: this.props.address,
    }
  }

  getLocale(lat,lng,user){

      let usersRef = firebase.database().ref('members');
      let usersGeoRef = firebase.database().ref('members-gl');
      let geoUser = new GeoFire(usersGeoRef);

      console.log(user.uid);

      usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var key = Object.keys(snapshot.val())[0];
          geoUser.set(key, [lat, lng]).then(() => {
              this.props.setGeoLocation({ geoReady: true, lat, lng });
              return;
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
              let address = result.results[3].formatted_address;
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
