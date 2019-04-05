import React from "react";
import Async from 'react-promise';
import firebase from './firebase.js';
import GeoFire from 'geofire';
import mmnt from 'moment';
import geocoding from 'reverse-geocoding-google';
import {geolocated} from 'react-geolocated';
import ip from 'ip';
import iplocation from "iplocation";
import Client from 'predicthq';

class Geolocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      getGeo: false,
      address: this.props.address,
      movies: []
    }
  }

  // getEventful = (lat, lng) => {
  //   let latlng = lat+','+lng;
  //   window.EVDB.API.call("/events/search/", {
  //     app_key: 'NGCsrxtcNTCCgjfW',
  //     keywords: 'music',
  //     location: latlng,
  //     within: "5km",
  //     date: "This Week",
  //     sort: "date",
  //     change_multi_day_start: false,
  //   }, function(results) {
  //     console.log(results);
  //   });
  // }

  componentWillMount = () => {
    this.getLocByIp();
  }

  getLocByIp(){
    //let ipaddr = '73.42.126.133';
    let ipaddr = ip.address();
    iplocation(ipaddr)
    .then((res) => {
      if(res.latitude && res.longitude){
        this.setState({
          address: res.city+', '+res.regionCode+', '+res.countryCode,
          lat: res.latitude,
          lng: res.longitude,
        });
        this.getLocale(res.latitude,res.longitude,this.props.user);
      }else{
        this.setState({getGeo: true});
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

  uniq(array, prop) {
   var newArray = [];
   var lookupObject  = {};
   for(var i in array) {
     lookupObject[array[i][prop]] = array[i];
   }
   for(i in lookupObject) {
     newArray.push(lookupObject[i]);
   }
   return newArray;
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
            //kMliRxAqc49wNf6jmtxJLRBYAqW2Tr
            //GHL45LeU1QhCh7bzT8BiC0hwZ3z8xT
            var client = new Client({access_token: "kMliRxAqc49wNf6jmtxJLRBYAqW2Tr"});
            let m = mmnt();
            client.events.search({
              'limit': 25,
              'within': '10km@'+lat+','+lng,
              'start.gte': m.add(1, 'day').format('YYYY-MM-DD'),
              'start.lt': m.add(3, 'day').format('YYYY-MM-DD'),
              'relevance':'rank',
              'category':'concerts,festivals,performing-arts,sports','sort':'start'})
            .then((r) => {
                let results = r.result.results;
                results = this.uniq(results, "title");
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
    'longitude': lng,
    'key': 'AIzaSyCLpF3Kgl5ILBSREQ2-v_WNxBTuLi1FxXY'
    };

    if(lat && lng && geocode && this.state.getGeo){
      var location = async () => {
      return new Promise((resolve, reject) => {
        geocoding.location(geocode, (err, result) => {
            if(err){
              console.log(err);
              reject(err);
              return;
            }else{
              let address = result.results[4].formatted_address;
              if(this.props.address !== address){
                this.props.setAddress(address);
                resolve(address);
              }
              resolve();
              return;
            }
          });
        });
      };

      return location();
    }
  }

  render() {
    return (
    <div>
      {this.state.getGeo ? <div className="user-geolocation">
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
                   <i className={'fa fa-map-marker'} onClick={()=>{this.setState({getGeo: false});this.getLocByIp();}}></i>
                   &nbsp; <span>{this.props.address}</span>
                 </h3>
               </div>
             }
      </div> :
      <div className="user-geolocation">
        <div className="hangs-nearby">
           <h3>
             <span>{this.state.address}</span>&nbsp;
             <i className={'fa fa-map-marker blue'} onClick={()=>{this.setState({getGeo: true});}}></i>
           </h3>
         </div>
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
