import React from "react";
import { BrowserRouter as Router, Link } from 'react-router-dom';
import firebase, {base} from './firebase.js';
import MutualFriends from './mutualfriends.js';
import Moment from 'react-moment';
//import GooglePlaceName from './placename.js';
import { StaticGoogleMap, Marker } from 'react-static-google-map';
import { ShareButtons, generateShareIcon } from 'react-share';
import graph from 'fb-react-sdk';

import HangCrew from './hangcrew.js';
import HangChat from './hangchat.js';
import HangLink from './hanglink.js';

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const EmailIcon = generateShareIcon('email');
const { FacebookShareButton, TwitterShareButton, EmailShareButton } = ShareButtons;

class HangItem extends React.Component {
  constructor() {
    super();
    this.state = {
      inhang: false,
      key: '',
      hang: '',
      uid: ''
    }
    this.inHang = this.inHang.bind(this);
    this.joinHang = this.joinHang.bind(this);
    this.localHangChange = this.localHangChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  getMutualFriends(user, uid, token){
    var getfbid = async () => {
      return new Promise((resolve, reject) => {
        const usersRef = firebase.database().ref(`/users/`);
        usersRef.orderByChild("uid").equalTo(uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var u = snapshot.val();
            Object.entries(u).map((member) => {
                resolve(member[1].fbid);
                return member[1].fbid;
            });
          }
          return;
        });
      });
    };

    var getGraphRequest = async () => {
      var fbid = await getfbid();
      return new Promise((resolve, reject) => {
        if(token){
          graph.get(fbid+'?fields=context.fields(mutual_friends)&access_token='+token, (err, res) => {
              if(!err){
                var friends = res.context.mutual_friends.summary.total_count;
                resolve(friends);
              }
          });
        }
      });
    };

    var friends = async () => {
      var result = await getGraphRequest();
      return new Promise((resolve, reject) => {
        resolve(result);
      });
    }

    return friends();

  }

  joinHang(hang, user, uid) {
    const crewRef = firebase.database().ref(`/hangs/${hang}/crew/`);
    const member = {
      uid: this.props.user.uid,
      user: this.props.user.displayName,
      userphoto: this.props.user.photoURL,
    }
    crewRef.orderByChild("uid").equalTo(uid).once('value', function(snapshot){
      if (snapshot.exists()) {
        console.log('already added to hang');
      }else{
        crewRef.push(member);
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

  componentDidMount() {
    if(this.props.hang.key){
      this.setState({ key: this.props.hang.key });
      this.inHang(this.props.hang.key);
    }else{
      this.setState({ key: this.props.id });
      this.inHang(this.props.id);
    }
    const hangRef = firebase.database().ref(`/hangs/${this.state.key}`);
    hangRef.once('value', (snapshot) => {
        let newhang = snapshot.val();
        this.setState({
          hang: newhang
        });
      });
  }

  handleButtonClick(id) {
    this.props.history.push('/hangs/'+id);
  }

  render() {
    var baseUrl = window.location.protocol + "//" + window.location.host;
    var hangLink = '/hangs/'+this.state.key;
    var shareUrl = baseUrl+hangLink;

    return (
      <div key={this.state.key}>
        <HangLink to={hangLink} text={
        <div className="hang-header">
          <h2>{this.props.hang.title}</h2>
          <span className="hang-placetime">
            <Moment format="hh:mm a" className="hang-time">{this.props.hang.datetime}</Moment> @ {this.props.hang.placename}
          </span>
          <div className="hang-date">
            <Moment format="MMM" className="hang-month">{this.props.hang.datetime}</Moment>
            <Moment format="DD" className="hang-day">{this.props.hang.datetime}</Moment>
            <Moment format="YYYY" className="hang-year">{this.props.hang.datetime}</Moment>
          </div>
        </div>
        } />
        <a target="_blank" href={'https://www.google.com/maps/search/?api=1&query='+this.props.hang.lat+'%2C'+this.props.hang.lng+'&query_place_id='+this.props.hang.place}>
          <StaticGoogleMap
            size={this.props.mapsize}
            center={this.props.hang.lat+','+this.props.hang.lng}
            zoom="17"
            apiKey="AIzaSyCkDqWy12LJpqhVuDEbMNvbM_fbG_5GdiA"
          >
            <Marker location={this.props.hang.lat+','+this.props.hang.lng} color="0xff0000" />
          </StaticGoogleMap>
        </a>
        <span className="hang-info">
          <span className="hang-member">
            <img src={this.props.hang.userphoto} alt={this.props.hang.user} className="hang-host" />
            <span>
            <b>Host</b><br />
            <Router>
            <Link to={'/users/'+this.props.hang.uid}>{ this.props.hang.user }</Link>
            </Router>
            </span>
            { this.props.hang.uid !== this.props.user.uid ?
            <MutualFriends user={this.props.user} hang={this.props.hang} token={this.props.token} />
            : ''}
          </span>
          <span className="hang-ui">
            <FacebookShareButton url={shareUrl} quote={'Join Me on Hangerang: '+this.props.hang.title}>
              <FacebookIcon size={20} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} quote={'Join Me on Hangerang: '+this.props.hang.title}>
              <TwitterIcon size={20} round />
            </TwitterShareButton>
            <EmailShareButton url={shareUrl} quote={'Join Me on Hangerang: '+this.props.hang.title}>
              <EmailIcon size={20} round />
            </EmailShareButton>
            { this.props.hang.uid === this.props.user.uid ?
            <i className="fa fa-trash" onClick={() => this.removeHang(this.state.key)}><span>Remove Hang</span></i>
            : ''}
            { this.props.hang.uid !== this.props.user.uid && this.state.inhang === false ?
            <i className="fa fa-plus-circle" onClick={() => this.joinHang(this.state.key, this.props.user.displayName, this.props.user.uid)}><span>Join Hang</span></i>
            : ''}
          </span>
        </span>
        <HangCrew localHangChange={this.localHangChange} hang={this.state.key} uid={this.props.user.uid} crew={this.props.hang.crew} />
        { this.props.detail ?
        <HangChat localHangChange={this.localHangChange} hang={this.props.hang} id={this.state.key} username={this.props.username} userphoto={this.props.userphoto} />
        : ''}
      </div>
    )
  }
}

export default HangItem;
