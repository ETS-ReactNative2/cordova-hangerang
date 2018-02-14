import React, {Component} from 'react';
import {geolocated} from 'react-geolocated';
import revgeo from 'reverse-geocoding';
import Async from 'react-promise';

class Geolocated extends Component {

  getLocale(lat,lng){
    var geocode = {
        'latitude': lat,
        'longitude': lng
    };

    var location = async () => {
      return new Promise((resolve, reject) => {
        revgeo.location(geocode, (err, result) => {
            if(err){
              console.log(err);
            }else{
              resolve(result.results[2].formatted_address);
              return result.results[2].formatted_address;
            }
            return;
          });
        });
      };

      return location();

  }

  render() {
    return !this.props.isGeolocationAvailable
      ? <div>Your browser does not support Geolocation</div>
      : !this.props.isGeolocationEnabled
        ? <div>Geolocation is not enabled</div>
        : this.props.coords
          ?
            <div className="user-geolocation">
            <span>{this.props.getUserLocation(this.props.coords.latitude,this.props.coords.longitude)}</span>
            <Async promise={this.getLocale(this.props.coords.latitude,this.props.coords.longitude)} then={(val) => <div className="hangs-nearby"><h3><i className={'fa fa-map-marker'}></i> <span>{val}</span></h3></div>}/>
            </div>
          : <div className="hangs-nearby"><h3>Getting location <i className="fa fa-circle-o-notch fa-spin"></i></h3></div>;
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 8000,
})(Geolocated);
