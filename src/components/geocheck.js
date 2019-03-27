import React from "react";
import Async from 'react-promise';
import firebase from './firebase.js';
import GeoFire from 'geofire';
import geolib from 'geolib';
import { geolocated } from 'react-geolocated';

import { getPoints } from '../helpers/points.js';

class GeoCheck extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedIn: false,
      setPoints: false,
      distance: '',
    }
  }

  getLocale = (lat,lng,user,hangkey) => {

      let usersRef = firebase.database().ref('members');
      let usersGeoRef = firebase.database().ref('members-gl');
      let geoUser = new GeoFire(usersGeoRef);

      usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var key = Object.keys(snapshot.val())[0];
          geoUser.set(key, [lat, lng]).then(() => {
              let distance = geolib.getDistance(
                {latitude: lat, longitude: lng},
                {latitude: this.props.hang.lat, longitude: this.props.hang.lng}
              );
              if(distance < 100){
                const hangRef = firebase.database().ref(`/hangs/${hangkey}`);
                if(this.props.user.uid === this.props.hang.uid){
                  hangRef.once('value', (snapshot) => {
                    if(snapshot.val()){
                      hangRef.update({validhost: true});
                      this.setState({checkedIn: true, setPoints: true});
                      this.props.setCheckLoc({chckloc: false});
                    }
                  });
                }
              }
            });
        }
      });
  }

  componentDidUpdate() {
    if(this.state.checkedIn && this.state.setPoints){
      let userPointsRef = firebase.database().ref(`/members/${this.props.userkey}/points/`);
      let points = getPoints("host-checkin");
      userPointsRef.push(points);
      this.setState({setPoints: false});
      return;
    }
  }

  render() {
    return (
    <div className="center">
        { !this.props.isGeolocationAvailable
          ? <p>Your browser does not support Geolocation</p>
          : !this.props.isGeolocationEnabled
            ? <p>Geolocation is not enabled</p>
            : !this.props.coords
              ?
              <p>Checking location <i className="fa fa-circle-o-notch fa-spin"></i></p>
              : !this.state.checkedIn ?
                 <Async
                 promise={this.getLocale(this.props.coords.latitude,this.props.coords.longitude,this.props.user,this.props.hangKey)}
                />
                : ''
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
})(GeoCheck);
