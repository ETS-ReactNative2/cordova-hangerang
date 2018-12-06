import React from "react";
import firebase, {base} from './firebase.js';
import GeoFire from 'geofire';
import Hashids from 'hashids';
import mmnt from 'moment';
import Moment from 'react-moment';
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

  removeHang(id) {
    base.remove(`/hangs/${id}`);
    this.props.onHangChange(id);
  }

  render() {
    let event = {
        title: this.props.hang.title,
        description: this.props.hang.title+" with "+this.props.hang.user+" (powered by Hangerang)",
        location: this.props.hang.address,
        startTime: this.props.hang.datetime,
        endTime: mmnt(this.props.hang.datetime).add(2, 'hours')
    }

    let icon = { textOnly: 'none' };

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
        <div className="hang-item-graphic">
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
        {this.props.hang.uid === this.props.user.uid ?
          <span className="hang-info">
            <span className="hang-member">
              <img src={this.props.hang.userphoto} alt={this.props.hang.user} className="hang-host" />
              <span>
              <b>Host</b><br />
              { this.props.hang.fbid ? <a href={'https://www.facebook.com/'+this.props.hang.fbid} target="_blank">{this.props.hang.user}</a>
              : <span>{this.props.hang.user}</span> }
              </span>
              { this.props.hang.uid !== this.props.user.uid && this.state.mutualFriends !== 0  ?
              <span className="hang-number">{this.state.mutualFriends}</span>
              : '' }
            </span>
            <span className="hang-ui">
              <i className="fa fa-trash" onClick={() => this.removeHang(this.state.key)}><span>Remove Hang</span></i>
            </span>
          </span>
         : ''}
        </span>
      </span>;

    let OurItem = <div className={'hang-item show'} key={this.state.key}>{Hang}</div>;

    return OurItem;

  }
}

export default OurItem;
