import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
//import MailchimpSubscribe from "react-mailchimp-subscribe";
//import PropTypes from 'prop-types';

import logo from './assets/logo.png';
import './assets/App.css';

import firebase, { auth, fbauth, ggauth, twauth, base } from './components/firebase.js';
import GeoFire from 'geofire';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ReactGA from 'react-ga';

import Scroll from 'react-scroll';
import { PopupboxManager,PopupboxContainer } from 'react-popupbox';
import CopyToClipboard from 'react-copy-to-clipboard';
import Gravatar from 'gravatar';
import Hashids from 'hashids';
import Joyride from 'react-joyride';
import { push as Menu } from 'react-burger-menu';
import slugify from 'slugify';
import moment from 'moment';
import axios from 'axios';

import AddName from './components/addname.js';
import AddPhone from './components/addphone.js';
import BottomNav from './components/bottomnav.js';
import CheckIn from './components/checkin.js';
import Crawl from './components/crawl.js';
import Crew from './components/crew.js';
import Geolocation from './components/geolocation.js';
import GhostItem from './components/ghostitem.js';
import Groups from './components/groups.js';
import GroupsAdd from './components/groupsadd.js';
import GroupsEdit from './components/groupsedit.js';
import GroupsView from './components/groupsview.js';
import HangItem from './components/hangitem.js';
import HangDetail from './components/hangdetail.js';
import HangForm from './components/hangform.js';
import HeaderPoints from './components/headerpoints.js';
import Home from './components/home.js';
import Invites from './components/invites.js';
import Logout from './components/logout.js';
import OnBoarding from './components/onboarding.js';
import OurItem from './components/ouritem.js';
import Points from './components/points.js';
import Place from './components/place.js';
import Privacy from './components/privacy.js';
import Profile from './components/profile.js';
//import Scan from './components/scan.js';
import TermsConditions from './components/terms.js';
import ZZomato from './components/zomato.js';

//Actions
import { getPoints } from './helpers/points.js';

if( window.location.host.includes("hangerang") || window.location.host.includes("hngrng") ){
  ReactGA.initialize('UA-114709758-1');
  ReactGA.pageview(window.location.pathname + window.location.search);
}

var hashids = new Hashids('', 5);

var scroll = Scroll.animateScroll;
var scroller = Scroll.scroller;
var Element = Scroll.Element;

class App extends PureComponent {

  constructor() {
    super();
    this.state = {
      //user state
      title: '',
      user: null,
      userhash: '',
      username: '',
      userphoto: '',
      fbid: '',
      uid: '',
      usernew: false, //set to true to test joyride tour
      datetime: '',
      location: '',
      points: 0,
      address: '',
      name: '',
      token: '',
      invites: '',
      onboard: false,
      showOnboard: false,
      //hangs
      hangs: [],
      nearby: [],
      visiblehangs: 1,
      nearevents: false,
      submit: false,
      register: false,
      login: false,
      newitem: '',
      mountID: '',
      makeHang: false,
      newhangkey: '',
      loggingIn: true,
      //component state
      menuOpen: false,
      isLive: true,
      hangsReady: false,
      geoReady: false,
      lat: '',
      lng: '',
      mode: 'nearby',
      selectedIndex: 1,
      value: '',
      copied: false,
      getLocation: false,
      visibility: 'invite',
      //joyride
      currentStep: 0,
      joyrideOverlay: true,
      joyrideType: 'continuous',
      isReady: false,
      isRunning: false,
      stepIndex: 0,
      steps: [],
      selector: '',
    }
    //Create Refs
    this.dashboard = React.createRef();
    //Bind Functions
    this.addSteps = this.addSteps.bind(this);
    this.checkVisibleHangs = this.checkVisibleHangs.bind(this);
    this.clearSubmit = this.clearSubmit.bind(this);
    this.getHangs = this.getHangs.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.hideForm = this.hideForm.bind(this);
    this.fbLogin = this.fbLogin.bind(this);
    this.ggLogin = this.ggLogin.bind(this);
    this.twLogin = this.twLogin.bind(this);
    this.toggleLogin = this.toggleLogin.bind(this);
    this.toggleReg = this.toggleReg.bind(this);
    this.logout = this.logout.bind(this);
    this.openPopupBox = this.openPopupBox.bind(this);
    this.onHangChange = this.onHangChange.bind(this);
    this.sendSMSInvite = this.sendSMSInvite.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.toggleSubmit = this.toggleSubmit.bind(this);
    this.updatePopupBox = this.updatePopupBox.bind(this);
  }

  setDate = (datetime) => this.setState({ datetime });
  setInvitedCrew = (invitedCrew) => this.setState({ invitedCrew });
  setInvitedGroup = (group) => this.setState({ group });
  setAddress = (address) => this.setState({ address });
  setLocation = (suggest) => this.setState({ location: suggest });
  setName = (original) => this.setState({ name: original });
  setOnboard = (status) => this.setState({ onboard: status });
  setSubmit = (submit) => this.setState({ submit: false });
  setMode = (mode) => this.setState({ mode });
  setTitle = (title) => this.setState({ title });
  setSelectedIndex = (index) => this.setState({ selectedIndex: index });
  setHangVisibility = (visibility) => this.setState({ visibility });
  setGeoLocation = (geoReady, lat, lng) => this.setState({ geoReady, lat, lng });
  setNearEvents = (nearevents) => this.setState({ nearevents });
  setUserName = (name) => this.setState({ username: name });

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.setState({
      mode: 'hangs',
      selectedIndex: 1
    });

    const hangsRef = firebase.database().ref('hangs');
    var key = Date.now();
    key = key.toString().split("").map(num => parseInt(num, 0));
    key = key.splice(8, 5);
    key = key.sort(function(a, b){ return 0.5 - Math.random() });
    const itemHash = hashids.encode(key);

    const hang = {
      hash: itemHash,
      title: this.state.title,
      fbid: this.state.user.providerData[0].uid,
      uid: this.state.user.uid,
      user: this.state.user.displayName,
      userphoto: this.state.user.photoURL,
      datetime: this.state.datetime.toISOString(),
      timestamp: Date.parse(this.state.datetime),
      lat: this.state.location.geometry.location.lat(),
      lng: this.state.location.geometry.location.lng(),
      address: this.state.location.formatted_address,
      place: this.state.location.place_id,
      placename: this.state.name,
      visibility: this.state.visibility
    }

     hangsRef.push(hang).then((snap) => {
      let key = snap.key;
      this.setState({newhangkey: key});
      let geoLocationRef = firebase.database().ref('hangs-gl');
      let geoFire = new GeoFire(geoLocationRef);
      geoFire.set(key, [hang.lat, hang.lng]).then(function() {
        console.log("Hang with key:"+key+" added to database");
        }, function(error) {
        console.log("Error: " + error);
      });

     const newPlace = {
       pid: this.state.location.place_id,
       name: this.state.name,
     }

     if(this.state.group){
       const groupRef = firebase.database().ref(`/groups/${this.state.group}`);
       groupRef.once('value', (snapshot) => {
         if (snapshot.exists()) {
           var group = snapshot.val();
           Object.entries(group.members).map((user) => {
             //console.log(user);
             if(user[1].status === 'joined'){
               const usersRef = firebase.database().ref('members');
               usersRef.orderByChild("uid").equalTo(user[1].uid).once('value', (snapshot) => {
                 if (snapshot.exists()) {
                   var member = snapshot.val();
                   let userkey = Object.keys(user)[0];
                   member = member[userkey];
                   const memberInviteRef = firebase.database().ref(`/members/${userkey}/invite`);
                   memberInviteRef.push({type: 'hang', hangid: key});
                   if(member.optin && member.tel){
                     this.sendSMSInvite(member.tel, key, itemHash);
                   }
                   console.log('Hang Invite added!');
                   return;
                 }
               });
             }
             return;
           });
         }
       });
     }

     const placeRef = firebase.database().ref('places');
     placeRef.orderByChild("pid").equalTo(this.state.location.place_id).once('value', (snapshot) => {
         if (snapshot.exists()) {
           var place = snapshot.val();
           let key = Object.keys(place)[0];
           const placeHangsRef = firebase.database().ref(`/places/${key}/hangs/`);
           Object.entries(place).map((p) => {
              placeHangsRef.push(key);
              return console.log("place");
           });
           console.log('Place exists. Add new hang');
           return;
         }else{
           placeRef.push(newPlace).then((snap) => {
             const newPlaceHangsRef = firebase.database().ref(`/places/${snap.key}/hangs/`);
             newPlaceHangsRef.push(key);
           });
           console.log('Place created in database. First Hang added');
           return;
         }
     }).catch(function(error) {
       console.log(error);
     });

     if(this.state.invitedCrew){
       this.state.invitedCrew.map((user, i) => {
         const usersRef = firebase.database().ref('members');
         usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
           if (snapshot.exists()) {
             let userkey = Object.keys(snapshot.val())[0];
             let member = snapshot.val();
             member = member[userkey];
             console.log(member);
             const memberInviteRef = firebase.database().ref(`/members/${userkey}/invite`);
             memberInviteRef.push({type: 'hang', hangid: key});
             if(member.optin && member.tel){
               this.sendSMSInvite(member.tel, key, itemHash);
             }
             console.log('Hang Invite added!');
             return;
           }
         });
       });
     }

      this.setState({
        title: '',
        datetime: '',
        location: '',
        submit: true,
        makeHang: false,
        newitem: itemHash,
        visiblehangs: 1,
        group: '',
        invitedCrew: '',
      });

    });

  }

  sendSMSInvite = (tel, hangid, hanghash) => {
    //Add to Simpletexting via API
    console.log('sending sms invite to:'+tel,hangid,hanghash);

    const hangsRef = firebase.database().ref(`hangs/${hangid}`);
    hangsRef.once('value', (snapshot) => {
      if (snapshot.exists()) {

        let hang = snapshot.val();

        let msg = `Hang Invite at ${hang.placename} ${moment(hang.datetime).calendar()} by ${hang.user} Info: https://invite.hngrng.com/hangs/${hanghash}`;

        console.log(msg);

        let data = {
          token: "ee15e353b2c02d97dc8b91680010b5e3",
          phone: tel,
          message: msg,
        };

        let axiosConfig = {
          headers: { 'X-Requested-With':'XMLHttpRequest' }
        };

        axios.get(
          'https://cors-anywhere.herokuapp.com/https://app2.simpletexting.com/v1/send/',
          { params: data },
          axiosConfig)
          .then((res) => {
            console.log("RESPONSE RECEIVED: ", res);
          })
          .catch((err) => {
            console.log("AXIOS ERROR: ", err);
        });
      }
    });
  }

  handleStateChange (state) {
    this.setState({menuOpen: state.isOpen})
  }

  closeMenu () {
    this.setState({menuOpen: false})
  }

  toggleMenu () {
    this.setState({menuOpen: !this.state.menuOpen})
  }

  logout() {
    clearInterval(this.state.mountID);
    this.setState({ loggingIn: false });
    auth.signOut()
      .then(() => {
        this.setState({ user: null });
        localStorage.removeItem('hideLogin');
        window.location.replace('/');
      });
  }

  fbLogin() {
    localStorage.setItem('hideLogin', true);
    this.setState({ loggingIn: true });
    auth.signInWithRedirect(fbauth);
  }

  ggLogin() {
    localStorage.setItem('hideLogin', true);
    this.setState({ loggingIn: true });
    auth.signInWithRedirect(ggauth);
  }

  twLogin() {
    localStorage.setItem('hideLogin', true);
    this.setState({ loggingIn: true });
    auth.signInWithRedirect(twauth);
  }

  toggleReg() {
    this.setState({ register : !this.state.register });
  }

  toggleLogin() {
    this.setState({ login : !this.state.login });
  }

  checkVisibleHangs() {
    const Dashboard = this.dashboard.current;
    if(Dashboard){
      let VisibleHangs = ReactDOM.findDOMNode(Dashboard).getElementsByClassName('show');
      this.setState({visiblehangs: VisibleHangs.length});
    }
  }

  onHangChange(hangid) {
    const hangRef = firebase.database().ref(`/hangs/${hangid}`);
    hangRef.once('value', (snapshot) => {
       let newhang = snapshot.val();
       this.setState({ hang: newhang, visiblehangs: 1 });
     });
  }

  openPopupBox(url) {
    const content =
      <div className="popupbox-pad">
        <input value={url} disabled />
        <CopyToClipboard text={url}
          onCopy={() =>
            this.setState({copied: true})
          }>
          <button onClick={() => this.updatePopupBox("This is going to be awesome!") }>Copy</button>
        </CopyToClipboard>
      </div>;
    PopupboxManager.open({
      content,
      config: {
        titleBar: {
          enable: true,
          text: 'Copy Link to Share'
        },
        fadeIn: true,
        fadeInSpeed: 500
      }
    });
  }

  updatePopupBox(msg) {
    const content = (
      <div>
        <span>{msg}</span>
      </div>
    )

    PopupboxManager.update({
      content,
      config: {
        titleBar: {
          enable: true,
          text: 'Copied!'
        }
      }
    })
  }

  openInvites = () => {
    const content =
    <Invites
     uid={this.state.uid}
     userkey={this.state.userkey}
     user={this.state.user}
    />;
    PopupboxManager.open({
      content,
      config: {
        fadeIn: true,
        fadeInSpeed: 500
      }
    });
    PopupboxManager.update({
      content
    });
  }

  //form submit

  toggleSubmit() {
    if( this.state.submit === false || this.state.submit === '' ){
      this.setState({ submit: true });
    }else{
      this.setState({ newitem: '', submit: false });
      scroll.scrollTo(0);
    }
  }

  clearSubmit() {
    if( this.state.submit ){
      this.setState({
        submit: false,
        newitem: ''
      });
    }
  }

  hideForm() {
    if( this.state.makeHang ){
      this.setState({ makeHang: false });
    }
  }

  toggleForm() {
    if( this.state.makeHang ){
      this.setState({ makeHang: false });
    }else{
      this.setState({ makeHang: true });
      if(this.state.isRunning){
        this.joyride.next();
      }
    }
  }

  setUserState = (user) => {
    if(user){
      console.log('setting user state');
      this.setState({
        user,
        loggingIn: true,
        hangs: [],
        nearby: [],
      });
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
        console.log('Setting up user Nitty Gritty');
        if (snapshot.exists()) {
          var user = snapshot.val();
          var key = Object.keys(snapshot.val())[0];
          this.getHangs(key);
          this.setState({ userkey: key });
          base.listenTo(`/members/${key}/invite`, {
            context: this,
            then(invites){
              this.setState(prevState => ({
                invites: invites,
              }));
            }
          });
          Object.entries(user).map((u) => {
            this.setState({
              loggingIn: false,
              username: u[1]['name'],
              userphoto: u[1]['userphoto'],
              fbid: u[1]['fbid'],
              token: u[1]['token'],
              uid: u[1]['uid'],
              onboard: u[1]['onboard'],
              userlocation: u[1]['address'],
              crew:  u[1]['crew'],
            });
            return u[1]['token'];
          });
        }
        //this.onBoardTimeout();
      });
    }
  }

  onBoardTimeout = () => {
    setTimeout(() => {
      this.setState({showOnboard: true});
    },3000);
  }

  // Get things
  getHangs = (userkey) => {
    console.log('get hangs');
    //this.onBoardTimeout();
    var now = new Date();
    var later = new Date();
    var timelimit = later.setHours(now.getHours()-2);

    base.bindToState(`hangs`, {
      context: this,
      state: 'hangs',
      asArray: true,
      keepKeys: true,
      queries: {
        orderByChild: 'timestamp',
        startAt: timelimit
      },
      then() {
        this.setState({ hangsReady: true, loggingIn: false });

        let usersGeoRef = firebase.database().ref('members-gl');
        let geoUser = new GeoFire(usersGeoRef);

        let hangsRef = firebase.database().ref('hangs-gl');
        let geoHang = new GeoFire(hangsRef);

        console.log('getting near hangs...');

        if(this.state.userkey){

          console.log('right?');

          const nearby = [];

          if(this.state.userkey && this.state.hangs){

            geoUser.get(this.state.userkey).then(function(location) {

                if (location === null) {
                    console.log("Provided key is not in GeoFire");
                } else {
                  let geoQuery = geoHang.query({
                    center: location,
                    radius: 64
                  });
                  geoQuery.on("key_entered", function(key){
                    nearby.push(key);
                  });
                }

            });

          }

          this.setState({ nearby });
        }
      }
    });
  }

  //component cycle

  componentWillMount() {
    auth.onAuthStateChanged((user) => {
      console.log('auth state changed');
      if(user){
        this.setUserState(user);
      }
    });
  }

  componentDidMount = () => {
    let path = window.location.pathname;
    if(path.includes('/group/invite/')){
      let banana = path.split('/');
      let id = banana[4];
      localStorage.setItem('hngrng-grp-vite', id);
    }
    if(path.includes('/user/invite/')){
      let banana = path.split('/');
      let id = banana[4];
      localStorage.setItem('hngrng-user-vite', id);
    }

    auth.getRedirectResult().then((result) => {
        if(!result.user){
          //do nothing
          console.log('no user yet');
        }else{
          this.setUserState(result.user);
          const usersRef = firebase.database().ref('members');
          usersRef.orderByChild("uid").equalTo(result.user.uid).once('value', (snapshot) => {
            if (snapshot.exists()) {
              var key = Object.keys(snapshot.val())[0];
              this.setState({ userkey: key });
              console.log('user already exists');
              return;
            }else{
              this.setState({usernew: true});
              let points = getPoints("newuser");
              usersRef.push({
                email: result.user.email,
                name: result.user.displayName,
                onboard: false,
                token: result.credential.accessToken,
                userphoto: result.user.photoURL,
                uid: result.user.uid,
                points:[ points ]
              }).then((snap) => {
                 const key = snap.key;
                 console.log('user created in database');
                 let grphash = localStorage.getItem('hngrng-grp-vite');
                 if(grphash){
                   const groupRef = firebase.database().ref(`/groups/`);
                   groupRef.orderByChild("hash").equalTo(grphash).once('value',
                     (snapshot) => {
                     if (snapshot.exists()) {
                       let id = Object.keys(snapshot.val())[0];
                       const groupMembersRef = firebase.database().ref(`/groups/${id}/members`);
                       groupMembersRef.ref.push({
                         label: result.user.displayName,
                         status: 'invited',
                         user: result.user.displayName,
                         uid: result.user.uid,
                         userphoto: result.user.photoURL,
                         value: slugify(result.user.displayName),
                       });
                       const memberInviteRef = firebase.database().ref(`/members/${key}/invite`);
                       memberInviteRef.push({type: 'group', groupid: id});
                     }
                   });
                 }
              });
              return;
            }
          });
        }
      }).catch(function(error) {
        console.log(error);
      });

      if(this.state.user === ''){
        this.setState({loggingIn: true});
      }else{
        this.setState({loggingIn: false});
      }

  }

  componentDidUpdate() {
    this.checkVisibleHangs();
    if(this.newItem){
      var header = document.getElementsByTagName('header')[0];
      var offset = header.offsetHeight;
      scroller.scrollTo('newItem', {
        duration: 1500,
        delay: 100,
        offset: (offset * -1) - 20,
        smooth: "easeInOutQuint",
      })
    }
  }

  //joyride
  addSteps(steps) {
    let newSteps = steps;

    if (!Array.isArray(newSteps)) {
      newSteps = [newSteps];
    }

    if (!newSteps.length) {
      return;
    }

    // Force setState to be synchronous to keep step order.
    this.setState(currentState => {
      currentState.steps = currentState.steps.concat(newSteps);
      return currentState;
    });
  }

  addTooltip(data) {
    this.joyride.addTooltip(data);
  }

  next() {
    this.joyride.next();
  }

  callback = (data) => {
    this.setState({
      selector: data.type === 'tooltip:before' ? data.step.selector : '',
    });
    this.setState({ currentStep: data.index });
    if( data.index === 6 ){
      this.setState({ usernew: false });
    }
  }

  onClickSwitch(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const state = {};

    if (el.dataset.key === 'joyrideType') {
      this.joyride.reset();

      this.setState({
        isRunning: false,
      });

      setTimeout(() => {
        this.setState({
          isRunning: true,
        });
      }, 300);

      state.joyrideType = e.currentTarget.dataset.type;
    }

    if (el.dataset.key === 'joyrideOverlay') {
      state.joyrideOverlay = el.dataset.type === 'active';
    }

    this.setState(state);
  }


  render() {
    const {
      isReady,
      isRunning,
      joyrideOverlay,
      joyrideType,
      stepIndex,
      steps,
    } = this.state;

    let headerClass = this.state.user ? null : 'hide';

    let Hangs = this.state.hangs.map((hang) => {
      if(hang.user !== 'Harvey Hang' || this.state.user && hang.user === this.state.user.displayName){
        if(hang.hash === this.state.newitem){
          return (
            <Element name={'newItem'} className={'hang-item-new'} key={hang.key} ref={section => this.newItem = section} tabIndex="-1">
              <HangItem
               new={true}
               key={hang.key}
               mapsize={'600x300'}
               onHangChange={this.onHangChange}
               openPopupBox={this.openPopupBox}
               hang={hang}
               user={this.state.user}
               token={this.state.token}
               geoReady={this.state.geoReady}
              />
            </Element>
          )
        }else{
          return (
            <HangItem
             key={hang.key}
             mapsize={'600x300'}
             onHangChange={this.onHangChange}
             openPopupBox={this.openPopupBox}
             hang={hang}
             user={this.state.user}
             token={this.state.token}
             geoReady={this.state.geoReady}
            />
          )
        }
      }
    });

    let GhostHangs = '';
    if (!this.state.nearevents) {
      GhostHangs = (() => {
        return ( <i className="fa fa-circle-o-notch fa-spin"></i> )
      });
    }else{
      GhostHangs = this.state.nearevents.results.map((result, i) => {
        return (
          <GhostItem
            key={i}
            mapsize={'600x300'}
            event={result}
            user={this.state.user}
            setMode={this.setMode}
            geoReady={this.state.geoReady}
          />
        )
      });
    }

    let NearHangs = [];
    NearHangs = this.state.hangs.map((hang) => {
      if( this.state.nearby.includes(hang.key) && hang.user !== 'Harvey Hang'){
        return (
          <HangItem
           key={hang.key}
           mapsize={'600x300'}
           onHangChange={this.onHangChange}
           openPopupBox={this.openPopupBox}
           hang={hang}
           user={this.state.user}
           token={this.state.token}
           geoReady={this.state.geoReady}
          />
        )
      }
      if( this.state.nearby.includes(hang.key) ){
        return (
          <OurItem
            key={hang.key}
            mapsize={'600x300'}
            onHangChange={this.onHangChange}
            openPopupBox={this.openPopupBox}
            hang={hang}
            user={this.state.user}
            token={this.state.token}
            setMode={this.setMode}
            geoReady={this.state.geoReady}
          />
        )
      }
    });
    NearHangs = NearHangs.filter(Boolean); //Don't send empty array of NearHangs

    let TodayHangs = this.state.hangs.map((hang) => {
        var date = new Date();
        var end = date.setHours(23,59,59,999);
        var timezoneOffset = (-1) * date.getTimezoneOffset() * 6000;
        var timestamp = (hang.timestamp + timezoneOffset);
        var utcOffset = date.getTimezoneOffset() * 6000;
        end = (end + utcOffset);
        if( timestamp < end  && hang.user !== 'Harvey Hang'){
            return (
              <HangItem
               key={hang.key}
               mapsize={'600x300'}
               onHangChange={this.onHangChange}
               openPopupBox={this.openPopupBox}
               hang={hang}
               user={this.state.user}
               token={this.state.token}
               geoReady={this.state.geoReady}
              />
            )
        }else{
          return (
            ''
          )
        }
    });

    return (
      <Router>
      <div ref={this.dashboard} className='dashboard'>
        { isReady ?
          <Joyride
            autoStart={true}
            allowClicksThruHole={true}
            ref={c => (this.joyride = c)}
            callback={this.callback}
            debug={false}
            scrollToSteps={false}
            keyboardNavigation={false}
            locale={{
              back: (<span>Back</span>),
              close: (<span>Close</span>),
              last: (<span>Last</span>),
              next: (<span>Next</span>),
              skip: (<span>Skip</span>),
            }}
            run={isRunning}
            showOverlay={joyrideOverlay}
            showSkipButton={false}
            showStepsProgress={true}
            stepIndex={stepIndex}
            steps={steps}
            type={joyrideType}
          />
        : null }
        <PopupboxContainer />
          <div>
          <header className={headerClass}>
            <div className="wrapper">
              <Route render={({history}) => (
                <a className="brand">
                  <img src={logo} alt="Hangerang" onClick={() => {history.push('/')}} />
                  <h1 onClick={() => {history.push('/')}}>Hangerang</h1>
                </a>
              )}/>
                {this.state.user ?
                <div className='user-profile'>
                  <div className='user-profile-wrapper'>
                    <div className='user-profile-image'>
                    {this.state.onboard && <HeaderPoints uid={this.state.uid} />}
                    <Link id="crew" className="menu-item" to={`/profile/${this.state.uid}`}>
                    {this.state.user.photoURL ?
                    <img src={this.state.user.photoURL} alt={"Profile Picture for:"+this.state.user.displayName} />
                    : <img src={Gravatar.url(this.state.user.email, {s: '100', r: 'x', d: 'retro'}, true)} alt={"Profile Picture for:"+this.state.user.email} />}
                    </Link>
                    </div>
                    <h4>{this.state.username ? this.state.username : this.state.user.email}</h4>
                  </div>
                </div> : null
                }
            </div>
          </header>
        </div>
        {this.state.isLive && this.state.user  ?
              <div>
                {this.state.invites && Object.entries(this.state.invites).length > 0 &&
                    <div
                      className='user-invites'
                      onClick={() => { this.openInvites() }}
                    >
                      {Object.entries(this.state.invites).length}
                    </div>
                }
                <Menu right pageWrapId={ "page-wrap" } outerContainerId={ "root" } isOpen={this.state.menuOpen}
          onStateChange={(state) => this.handleStateChange(state)}>
                  <Link id="hangs" className="menu-item" to="/" onClick={() => this.closeMenu()}>Home</Link>
                  <Link id="checkin" className="menu-item" to="/checkin/scan" onClick={() => this.closeMenu()}>Check In</Link>
                  <Link id="points" className="menu-item" to={`/points/total`} onClick={() => this.closeMenu()}>Points</Link>
                  <Link id="crew" className="menu-item" to={`/crew/all`} onClick={() => this.closeMenu()}>Crew</Link>
                  <Link id="groups" className="menu-item" to={`/groups`} onClick={() => this.closeMenu()}>Groups</Link>
                  {/*<Link id="crawl" className="menu-item" to={`/crawl/${this.state.uid}`} onClick={() => this.closeMenu()}>Coffee Crawl</Link>*/}
                  <a id="logout" className="menu-item" onClick={this.logout}>Log Out</a>
                </Menu>
                <div id="page-wrap" className="main">
                <Route exact path="/" render={(props) =>
                  <div>
                  {this.state.onboard ?
                    <div className={'container joyride-step-'+this.state.currentStep }>
                          {this.state.hangsReady && this.state.username ?
                          <HangForm
                            clearSubmit={this.clearSubmit}
                            handleChange={this.handleChange}
                            handleSubmit={this.handleSubmit}
                            makeHang={this.state.makeHang}
                            setHangVisibility={this.setHangVisibility}
                            setDate={this.setDate}
                            setInvitedCrew={this.setInvitedCrew}
                            setInvitedGroup={this.setInvitedGroup}
                            setLocation={this.setLocation}
                            setName={this.setName}
                            setSubmit={this.setSubmit}
                            toggleForm={this.toggleForm}
                            toggleSubmit={this.toggleSubmit}
                            visibility={this.state.visibility}
                            datetime={this.state.datetime}
                            location={this.state.location}
                            submit={this.state.submit}
                            title={this.state.title}
                            name={this.state.name}
                            user={this.state.user}
                            username={this.state.username}
                            joyrideType={joyrideType}
                            joyrideOverlay={joyrideOverlay}
                            onClickSwitch={this.onClickSwitch}
                            addSteps={this.addSteps}
                            addTooltip={this.addTooltip}
                            crew={this.state.crew}
                           />
                          : ''}
                          {this.state.hangsReady && !this.state.username && !this.state.user.displayName ?
                            <AddName
                              user={this.state.user}
                              setUserName={this.setUserName}
                            />
                          : ''}
                          <span>
                          {this.state.user && this.state.mode === 'nearby' && this.state.isLive ?
                          <Geolocation
                            getlocale={this.getLocale}
                            user={this.state.user}
                            setGeoLocation={this.setGeoLocation}
                            setNearEvents={this.setNearEvents}
                            setAddress={this.setAddress}
                            address={this.state.address}
                          />
                          : ''}
                          </span>
                          <section className='display-hang'>
                            {this.state.geoReady &&
                             this.state.mode === 'nearby' &&
                              <div>
                              <ZZomato
                                lat={this.state.geoReady.lat}
                                lng={this.state.geoReady.lng}
                                toggleForm={this.toggleForm}
                                setLocation={this.setLocation}
                                setName={this.setName}
                                setTitle={this.setTitle}
                                user={this.state.user}
                              />
                              </div>
                            }
                            {this.state.hangs &&
                              this.state.hangsReady &&
                              this.state.geoReady &&
                              this.state.mode === 'nearby' &&
                             <h4 className="center home-header">Things Happening Soon</h4>
                            }
                            {this.state.hangs &&
                              this.state.hangsReady &&
                              this.state.geoReady ?
                              <div className='wrapper hangs'>
                                {this.state.mode === 'hangs' && Hangs }
                                { this.state.mode === 'nearby' && NearHangs }
                                { this.state.mode === 'nearby' && GhostHangs }
                                {/*this.state.mode === 'today' && TodayHangs*/}
                                { clearInterval(this.state.mountID) }
                              </div>
                              : <div className="center page-spinner">
                              <i className="fa fa-circle-o-notch fa-spin"></i>
                              </div> }
                          </section>
                          <MuiThemeProvider>
                            <BottomNav
                             hideForm={this.hideForm}
                             setMode={this.setMode}
                             setSelectedIndex={this.setSelectedIndex}
                             selectedIndex={this.state.selectedIndex}
                             toggleForm={this.toggleForm}
                            />
                          </MuiThemeProvider>
                  </div> :
                  <div className="container">
                    {!this.state.showOnboard ?
                    <div className="center page-spinner">
                      <i className="fa fa-circle-o-notch fa-spin"></i>
                    </div> :
                   <OnBoarding
                     uid={this.state.user.uid}
                     setLocation={this.setLocation}
                     setName={this.setName}
                     setOnboard={this.setOnboard}
                     location={this.state.location}
                     displayName={this.state.user.displayName}
                     name={this.state.name}
                     openPopupBox={this.openPopupBox}
                     userLocation={this.state.userlocation}
                    />}
                  </div> }
                  </div>} />
              <Route path="/addphone/:uid" render={(props) =>
                <div className='container'>
                  <AddPhone uid={props.match.params.uid} />
                </div>
              } />
              <Route path="/checkin/:id" render={(props) =>
                <div className='container'>
                  <CheckIn id={props.match.params.id} user={this.state.user} uid={this.state.uid} />
                </div>
              } />
              <Route path="/crawl/:uid" render={(props) =>
                <div className='container'>
                  <Crawl uid={props.match.params.uid} />
                </div>
              } />
              <Route path="/crew/:hash" render={(props) =>
                <div className='container'>
                  <Crew hash={props.match.params.hash} uid={this.state.uid} userkey={this.state.userkey} />
                </div>
              } />
              <Route path="/groups" render={(props) =>
                  <div className='container groups'>
                    <Groups hash={props.match.params.hash} uid={this.state.uid} userkey={this.state.userkey} />
                  </div>
              } />
              <Route exact path="/group/invite/:name/:hash/:invite?" render={(props) =>
                  <div className='container group-view-invite'>
                    <GroupsView
                      name={props.match.params.name}
                      hash={props.match.params.hash}
                      invite={props.match.params.invite}
                      user={this.state.user}
                      openPopupBox={this.openPopupBox}
                    />
                  </div>
              } />
              <Route exact path="/group/view/:id" render={(props) =>
                <div className='container group-view-id'>
                  <GroupsView id={props.match.params.id} />
                </div>
              } />
              <Route exact path="/group/edit/:id" render={(props) =>
                  <div className='container group-edit'>
                    <GroupsEdit id={props.match.params.id} uid={this.state.uid} />
                  </div>
              } />
              <Route path="/group/add" render={(props) =>
                <div className='container group-add'>
                  <GroupsAdd
                   hash={props.match.params.hash}
                   uid={this.state.uid}
                   userkey={this.state.userkey}
                   username={this.state.username}
                   userphoto={this.state.userphoto}
                  />
                </div>
              } />
              <Route path="/logout/" render={(props) =>
                  <div className='container'>
                    <Logout logout={this.logout} />
                  </div>
              } />
              <Route path="/points/:hash" render={(props) =>
                <div className='container'>
                  <Points hash={props.match.params.hash} uid={this.state.uid} />
                </div>
              } />
              <Route path="/hang/:hash" render={(props) =>
                <section className='display-hang'>
                <div className='container'>
                  <Link className={'btn-back fa fa-angle-left'} to="/"></Link>
                  <HangDetail
                   user={this.state.user}
                   userkey={this.state.userkey}
                   username={this.state.user.displayName}
                   userphoto={this.state.user.photoURL}
                   token={this.state.token}
                   hash={props.match.params.hash}
                   openPopupBox={this.openPopupBox}
                   geoReady={this.state.geoReady}
                  />
                </div>
                </section>
              } />
              <Route path="/place/:id" render={(props) =>
                <div className='container'>
                  <Place id={props.match.params.id} />
                </div>
              } />
              <Route path="/profile/:uid" render={(props) =>
                <div className='container'>
                  <Profile uid={props.match.params.uid} />
                </div>
              } />
              <Route exact path="/pages/privacy-policy" render={(props) =>
                <div className='container'>
                  <Privacy />
                </div>
              } />
              <Route exact path="/pages/terms-conditions" render={(props) =>
                <div className='container'>
                  <TermsConditions />
                </div>
              } />
              </div>
            </div>
        :
            <div>
              <Route path="/group/invite/:name/:hash/:invite?" render={(props) =>
                <div className='container'>
                  <GroupsView
                    name={props.match.params.name}
                    hash={props.match.params.hash}
                    invite={props.match.params.invite}
                  />
                </div>
              } />
              <Route exact path="/pages/privacy-policy" render={(props) =>
                <div className='container'>
                  <Privacy />
                </div>
              } />
              <Route exact path="/pages/terms-conditions" render={(props) =>
                <div className='container'>
                  <TermsConditions />
                </div>
              } />
              <Route path="/logout/" render={(props) =>
                  <div className='container'>
                    <Logout logout={this.logout} />
                  </div>
              } />
              <Route path="/hang/:hash" render={(props) =>
                <Home
                  fbLogin={this.fbLogin}
                  ggLogin={this.ggLogin}
                  twLogin={this.twLogin}
                  toggleLogin={this.toggleLogin}
                  toggleReg={this.toggleReg}
                  login={this.state.login}
                  register={this.state.register}
                  isLive={this.state.isLive}
                  hideLogin={localStorage.getItem('hideLogin')}
                  loggingIn={this.state.loggingIn}
                  setUserName={this.setUserName}
                  logout={this.logout}
                />
              } />
              <Route exact path="/" render={(props) =>
                <Home
                  fbLogin={this.fbLogin}
                  ggLogin={this.ggLogin}
                  twLogin={this.twLogin}
                  toggleLogin={this.toggleLogin}
                  toggleReg={this.toggleReg}
                  login={this.state.login}
                  register={this.state.register}
                  isLive={this.state.isLive}
                  hideLogin={localStorage.getItem('hideLogin')}
                  loggingIn={this.state.loggingIn}
                  setUserName={this.setUserName}
                  logout={this.logout}
                />
              } />
            </div>
        }
        </div>
        </Router>
    );
  }
}

export default App;
