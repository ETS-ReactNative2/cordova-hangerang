import React from "react";
import ReactDOM from 'react-dom';
import rasterizeHTML from 'rasterizehtml';
import firebase, {base} from './firebase.js';
import mmnt from 'moment';
import geolib from 'geolib';
import Moment from 'react-moment';
import { StaticGoogleMap, Marker } from 'react-static-google-map';
import { ShareButtons, generateShareIcon } from 'react-share';
import AddToCalendar from 'react-add-to-calendar';

import HangCrew from './hangcrew.js';
import HangChat from './hangchat.js';
import HangLink from './hanglink.js';

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const EmailIcon = generateShareIcon('email');
const { FacebookShareButton, TwitterShareButton, EmailShareButton } = ShareButtons;

const storage = firebase.storage().ref();

var hangHeader = {
  position: "relative",
  backgroundColor: "#ec008c",
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

class HangItem extends React.Component {
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
    this.inHang = this.inHang.bind(this);
    this.joinHang = this.joinHang.bind(this);
    this.localHangChange = this.localHangChange.bind(this);
    //this.getMutualFriends = this.getMutualFriends.bind(this); /* Deprecated by Facebook :( */
    this.handleShareButton = this.handleShareButton.bind(this);
    this.toggleCalendar = this.toggleCalendar.bind(this);
    this.getPlace = this.getPlace.bind(this);
    this.placeCallback = this.placeCallback.bind(this);
  }

  placeCallback = (results, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      console.log(results);
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
    if(lat && lng){
      let maploc = new window.google.maps.LatLng(lat,lng);
      let mapdom = ReactDOM.findDOMNode(this.refs.map);

      if(mapdom){
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
    }
  }

  joinHang(hang, user, uid) {
    //Add Member to Hang
    const member = {
      uid: this.props.user.uid,
      user: this.props.user.displayName,
      userphoto: this.props.user.photoURL,
    }
    const userRef = firebase.database().ref(`/members/`);
    userRef.orderByChild("uid").equalTo(uid).once('value', (snapshot) => {
      if (snapshot.exists()) {
        var user = snapshot.val();
        let key = Object.keys(user)[0];
        const userHangRef = firebase.database().ref(`/members/${key}/hangs`);
        userHangRef.orderByChild("hang").equalTo(key).once('value', (snapshot) => {
          if (snapshot.exists()) {
            console.log('Already joined this hang');
          }else{
            userHangRef.push({hang});
            console.log('Hang Added To User!');
            const invitedRef = firebase.database().ref(`/members/${key}/invite`);
            invitedRef.orderByChild("hangid").equalTo(hang).once('value',
            (snapshot) => {
              if (snapshot.exists()) {
                let invkey = Object.keys(snapshot.val())[0];
                invitedRef.ref.child(invkey).remove();
              }
            });
            return;
          }
        });
      }
    });
    const crewRef = firebase.database().ref(`/hangs/${hang}/crew/`);
    crewRef.orderByChild("uid").equalTo(uid).once('value', function(snapshot){
      if (snapshot.exists()) {
        console.log('already added to hang');
      }else{
        crewRef.push(member);
      }
    });
    const hangRef = firebase.database().ref(`/hangs/${hang}`);
    //Add Joiner to Host Crew
    hangRef.once('value', function(snapshot){
      if (snapshot.exists()) {
        let hang = snapshot.val();
        const usersRef = firebase.database().ref(`/members/`);
        usersRef.orderByChild("uid").equalTo(hang['uid']).once('value', (snapshot) => {
          var key = Object.keys(snapshot.val())[0];
          const crewRef = firebase.database().ref(`/members/${key}/crew/`);
          crewRef.orderByChild("uid").equalTo(uid).once('value', (snapshot) => {
            if (snapshot.exists()) {
              console.log('already in crew');
            }else{
              crewRef.push(member);
            }
          });
        });
      }
    });
    this.localHangChange(hang.key);
    this.setState({ inhang: true });
  }

  inHang(id) {
    if( this.props.hang.uid === this.props.user.uid ){
      this.setState({ inhang: true });
    }else{
      const crewRef = firebase.database().ref(`/hangs/${id}/crew/`);
      crewRef.orderByChild("uid").equalTo(this.props.user.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          this.setState({ inhang: true });
        }else{
          this.setState({ inhang: false });
        }
      });
    }
  }

  removeHang(id) {
    base.remove(`/hangs/${id}`);
    this.props.onHangChange(id);
  }

  localHangChange() {
    var hangid = this.state.key;
    const hangRef = firebase.database().ref(`/hangs/${hangid}`);
    hangRef.once('value', (snapshot) => {
       let newhang = snapshot.val();
       this.setState({ hang: newhang });
     });
    this.inHang(hangid);
  }

  handleShareButton(url) {
    this.props.openPopupBox(url);
  }

  toggleCalendar() {
    if( this.state.openCalendar ){
      this.setState({ openCalendar: false });
    }else{
      this.setState({ openCalendar: true });
    }
  }

  // getMutualFriends(user, uid, token){
  //   console.log('getting mutual friends');
  //   var getfbid = async () => {
  //     return new Promise((resolve, reject) => {
  //       const usersRef = firebase.database().ref(`/members/`);
  //       usersRef.orderByChild("uid").equalTo(uid).once('value', (snapshot) => {
  //         if (snapshot.exists()) {
  //           var u = snapshot.val();
  //           Object.entries(u).map((member) => {
  //               console.log('got fbid:'+ member[1].fbid);
  //               resolve(member[1].fbid);
  //               return member[1].fbid;
  //           });
  //         }
  //         return;
  //       });
  //     });
  //   };

  // var getGraphRequest = async () => {
  //   var fbid = await getfbid();
  //   return new Promise((resolve, reject) => {
  //     console.log(token);
  //     if(token){
  //       graph.get(fbid+'?fields=context.fields(mutual_friends)&access_token='+token, (err, res) => {
  //           console.log(res.context.mutual_friends);
  //           if(!err){
  //             if(res.context.mutual_friends){
  //               resolve(res.context.mutual_friends.summary.total_count);
  //             }else{
  //               resolve(0);
  //             }
  //           }else{
  //             throw err;
  //           }
  //       });
  //     }
  //   });
  // };
  //
  // var friends = async () => {
  //   var request = await getGraphRequest();
  //   return new Promise((resolve, reject) => {
  //     resolve(request);
  //   });
  // }
  //
  // return friends();

  //}

  componentWillMount = (result) => {

    // var promise = this.getMutualFriends(this.props.user, this.props.hang.uid, this.props.token);
    //
    // promise.then((result) => {
    //   console.log(result);
    //   this.setState({ mutualFriends:result });
    //   if( result > 0 ){
    //     this.setState({ visibility: 'show' })
    //   }
    // }).catch((err) => console.log("rejected:", err));

    if(this.props.hang.key){
      this.setState({ key: this.props.hang.key });
      this.inHang(this.props.hang.key);
    }else{
      this.setState({ key: this.props.id });
      this.inHang(this.props.id);
    }

  }

  renderHangItem = () => {
    var canvas = ReactDOM.findDOMNode(this.refs.canvas);
    var detail = ReactDOM.findDOMNode(this.refs.detail);
    rasterizeHTML.drawHTML(detail.innerHTML,canvas);
  }

  doesFileExist = (urlToFile) => {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();
    if (xhr.status === "404") {
        return false;
    } else {
        return true;
    }
  }

  saveImg = () => {
    var canvas = ReactDOM.findDOMNode(this.refs.canvas);

    // let setMeta = (url) => {
    //   if(url){
    //     console.log(url);
    //     var meta = document.querySelector('meta[property="og:image"]');
    //     meta.content = url;
    //     document.getElementsByTagName('head')[0].appendChild(meta);
    //     document.getElementById("img").src = url;
    //     console.log(meta);
    //   }
    // }

    let onResolve = (url) => {
      console.log("Image found. Saved to " + url);
      return;
    }

    let onReject = (error, func) => {
      console.log(error);
      func.on('state_changed', snapshot => {
        }, snapshot => {
          console.error("Unable to save image.");
        }, () => {
          let url = func.snapshot.downloadURL;
          console.log("Image found. Location here: " + url);
          return;
      });
    }

    canvas.toBlob(blob => {
      var name = this.props.hang.hash + ".png";
      var f = storage.child("images/" + name);
      var task = f.put(blob);
      storage.child("images/" + name).getDownloadURL()
      .then(
        function(url) {
          onResolve(url);
        })
      .catch(
        function(error) {
        onReject(error, task);
      });
    });
  };

  componentDidMount = (result) => {
    const hangRef = firebase.database().ref(`/hangs/${this.state.key}`);

    hangRef.once('value', (snapshot) => {
      let newhang = snapshot.val();
      this.setState({
        hang: newhang
      });
    });

    if( this.props.hang.uid === this.props.user.uid ||
        this.props.hang.visibility === 'public' ||
        this.state.inhang ||
        this.props.detail ||
        this.props.invited
      ){
      this.setState({ visibility: 'show' })
    }

    if(this.props.detail){
      setTimeout(this.renderHangItem, 500);
      //setTimeout(this.saveImg, 1000);
    }

    if(this.props.geoReady
      && this.props.hang.lat
      && this.props.hang.lng){
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
    }
    //var baseUrl = window.location.protocol + "//" + window.location.host;
    var hangLink = '/hang/'+this.props.hang.hash;
    var shareUrl = 'https://invite.hngrng.com/hangs/'+this.props.hang.hash;

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
        <HangLink to={hangLink} text={
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
              {this.props.detail === true &&
               this.props.hang.uid === this.props.user.uid ?
                <button
                  className="btn-hang-action host-checkin"
                  onClick={(e) =>
                    this.props.setCheckLoc({chckloc: true})
                  }>
                  <i className="fa fa-map-marker white"></i> <strong>Host</strong> Check-In
                </button>
              : ''}
            </td>
          </tr>
          </tbody>
        </table>
        } />
        <div className="hang-item-graphic" style={hangImage}>
        {!this.state.placeimg &&
        <div>
          <div id="map" ref={'map'} />
          <a target="_blank" href={'https://www.google.com/maps/search/?api=1&query='+this.props.hang.lat+'%2C'+this.props.hang.lng+'&query_place_id='+this.props.hang.place}>
            <StaticGoogleMap
              size={this.props.mapsize}
              center={this.props.hang.lat+','+this.props.hang.lng}
              zoom="18"
              apiKey="AIzaSyCLpF3Kgl5ILBSREQ2-v_WNxBTuLi1FxXY"
            >
              <Marker location={this.props.hang.lat+','+this.props.hang.lng} color="0xff0000" />
            </StaticGoogleMap>
          </a>
        </div>
        }
        </div>
        </span>
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
          {this.state.openCalendar ? <span className="hang-ui"><AddToCalendar event={event} buttonLabel="Add to calendar" buttonTemplate={icon} /><i className={'fa fa-times'} onClick={() => this.toggleCalendar()}></i></span> :
            <span className="hang-ui">
              {this.state.inhang ?
              <button className="fa fa-link" onClick={() => this.handleShareButton(shareUrl)}></button>
              : null }
              {this.state.inhang ?
              <FacebookShareButton url={shareUrl} quote={'Join Me on Hangerang: '+this.props.hang.title}>
                <FacebookIcon size={20} round />
              </FacebookShareButton>
              : null }
              {this.state.inhang ?
              <TwitterShareButton url={shareUrl} quote={'Join Me on Hangerang: '+this.props.hang.title}>
                <TwitterIcon size={20} round />
              </TwitterShareButton>
              : null }
              {this.state.inhang ?
              <EmailShareButton url={shareUrl} quote={'Join Me on Hangerang: '+this.props.hang.title}>
                <EmailIcon size={20} round />
              </EmailShareButton>
              : null }
              {this.state.inhang ?
              <button className="fa fa-calendar" onClick={() => this.toggleCalendar()}></button>
              : null }
              { this.props.hang.uid === this.props.user.uid ?
              <i className="fa fa-trash" onClick={() => this.removeHang(this.state.key)}><span>Remove Hang</span></i>
              : ''}
              { this.props.hang.uid !== this.props.user.uid && this.state.inhang === false ?
              <button className="hang-join" onClick={() => this.joinHang(this.state.key, this.props.user.displayName, this.props.user.uid)}>Go</button>
              : ''}
            </span>
          }
        </span>
        <HangCrew localHangChange={this.localHangChange} hang={this.state.key} uid={this.props.user.uid} crew={this.props.hang.crew} />
        { this.props.detail && this.state.inhang ?
        <HangChat localHangChange={this.localHangChange} hang={this.state.key} username={this.props.username} userphoto={this.props.userphoto} />
        : ''}
      </span>;

    let HangItem;
    if(this.props.detail === true){
      HangItem = <div><canvas ref="canvas" width="600" height="400" style={{display: 'none'}}></canvas><img alt="Hang" id="img" style={{display: 'none'}} /><div className={'hang-item '+this.state.visibility} key={this.state.key}>{Hang}</div></div>;
    }else{
      HangItem = <div className={'hang-item '+this.state.visibility} key={this.state.key}>{Hang}</div>;
    }

    if(this.props.hang.uid === this.props.user.uid){
      return HangItem;
    }else if( this.props.hang.visibility === 'friends' && this.state.mutualFriends > 0 ){
      return HangItem;
    }else if(this.props.hang.visibility === 'invite' && this.state.inhang ){
      return HangItem;
    }else if(this.props.hang.visibility === 'groups' && this.state.inhang ){
      return HangItem;
    }else if(this.props.hang.visibility === 'public'){
      return HangItem;
    }else if(this.props.detail){
      return HangItem;
    }else if(this.props.invited){
      return HangItem;
    }else{
      return <div className="hang-item hide"></div>;
    }
  }
}

export default HangItem;
