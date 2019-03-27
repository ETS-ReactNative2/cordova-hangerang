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
import OurItem from './components/ouritem.js';
import Points from './components/points.js';
import Place from './components/place.js';
import Privacy from './components/privacy.js';
import Profile from './components/profile.js';
//import Scan from './components/scan.js';
import TermsConditions from './components/terms.js';

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
      hangKey: '',
      loggingIn: true,
      //component state
      menuOpen: false,
      isLive: true,
      hangsReady: false,
      geoReady: false,
      lat: '',
      lng: '',
      mode: 'nearby',
      selectedIndex: 0,
      value: '',
      copied: false,
      getLocation: false,
      visibility: 'groups',
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
    this.toggleForm = this.toggleForm.bind(this);
    this.toggleSubmit = this.toggleSubmit.bind(this);
    this.updatePopupBox = this.updatePopupBox.bind(this);
  }

  setDate = (datetime) => this.setState({ datetime });
  setInvitedGroup = (group) => this.setState({ group });
  setAddress = (address) => this.setState({ address });
  setLocation = (suggest) => this.setState({ location: suggest });
  setName = (original) => this.setState({ name: original });
  setSubmit = (submit) => this.setState({ submit: false });
  setMode = (mode) => this.setState({ mode });
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
      selectedIndex: 0
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

     this.setState({
       title: '',
       datetime: '',
       location: '',
       submit: true,
       makeHang: false,
       newitem: itemHash,
       hangKey: key,
       visiblehangs: 1,
     });
   });

   const newPlace = {
     pid: this.state.location.place_id,
     name: this.state.name,
   }

   const groupRef = firebase.database().ref(`/groups/${this.state.group}`);
   groupRef.once('value', (snapshot) => {
     if (snapshot.exists()) {
       var group = snapshot.val();
       Object.entries(group.members).map((user) => {
         console.log(user);
         if(user[1].status === 'joined'){
           const usersRef = firebase.database().ref('members');
           usersRef.orderByChild("uid").equalTo(user[1].uid).once('value', (snapshot) => {
             if (snapshot.exists()) {
               var user = snapshot.val();
               let userkey = Object.keys(user)[0];
               const memberInviteRef = firebase.database().ref(`/members/${userkey}/invite`);
               memberInviteRef.push({type: 'hang', hangid: this.state.newhangkey});
               console.log('Hang Invite added!');
               return;
             }
           });
         }
         return console.log("user");
       });
     }
   });

   const placeRef = firebase.database().ref('places');
   placeRef.orderByChild("pid").equalTo(this.state.location.place_id).once('value', (snapshot) => {
       if (snapshot.exists()) {
         var place = snapshot.val();
         let key = Object.keys(place)[0];
         const placeHangsRef = firebase.database().ref(`/places/${key}/hangs/`);
         Object.entries(place).map((p) => {
            placeHangsRef.push(this.state.hangKey);
            return console.log("p");
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
        this.setState({ loggingIn: false });
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
      <div>
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

  setUserState(user){
    this.setState({ user, loggingIn: true });
    const usersRef = firebase.database().ref('members');
    usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
      if (snapshot.exists()) {
        var user = snapshot.val();
        var key = Object.keys(snapshot.val())[0];
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
            uid: u[1]['uid']
          });
          return u[1]['token'];
        });
      }
    });
  }

  //component cycle

  componentWillMount() {
    auth.onAuthStateChanged((user) => {
      console.log('auth state changed');
      this.setUserState(user);
    });
  }

  componentDidMount = () => {
    let path = window.location.pathname;
    if(path.includes('/group/invite/')){
      let banana = path.split('/');
      let id = banana[4];
      localStorage.setItem('hngrng-grp-vite', id);
    }
    auth.getRedirectResult().then((result) => {
        if(!result.user){
          //do nothing
          console.log('no user yet');
        }else{
          const usersRef = firebase.database().ref('members');
          usersRef.orderByChild("uid").equalTo(result.user.uid).once('value', (snapshot) => {
            if (snapshot.exists()) {
              console.log('user already exists');
              return;
            }else{
              this.setState({usernew: true});
              let points = getPoints("newuser");
              usersRef.push({
                email: result.user.email,
                name: result.user.displayName,
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
                 this.setUserState(result.user);
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

      let usersGeoRef = firebase.database().ref('members-gl');
      let geoUser = new GeoFire(usersGeoRef);

      let hangsRef = firebase.database().ref('hangs-gl');
      let geoHang = new GeoFire(hangsRef);

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
          this.setState({ nearby, hangsReady: true, loggingIn: false });
        }
      });
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
      //if(hang.user !== 'Harvey Hang' || this.state.user && hang.user === this.state.user.displayName){
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
      //}
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
      return console.log("hang");
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
                <a className="brand" onClick={() => {history.push('/')}}>
                  <img src={logo} alt="Hangerang" />
                  <h1>Hangerang</h1>
                </a>
              )}/>
                {this.state.user ?
                <div className='user-profile'>
                  <div className='user-profile-wrapper'>
                    <div className='user-profile-image'>
                    <HeaderPoints uid={this.state.uid} />
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
        {this.state.isLive && this.state.user ?
              <div>
                {this.state.invites && Object.entries(this.state.invites).length > 0 &&
                  <Route render={({history}) => (
                    <div
                      className='user-invites'
                      onClick={() => { history.push('/invites') }}
                    >
                      {Object.entries(this.state.invites).length}
                    </div>
                  )}/>
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
                <Route exact path="/" render={() =>
                  <div className={'container joyride-step-'+this.state.currentStep }>
                        {this.state.hangsReady && this.state.username ?
                        <HangForm
                          clearSubmit={this.clearSubmit}
                          handleChange={this.handleChange}
                          handleSubmit={this.handleSubmit}
                          makeHang={this.state.makeHang}
                          setHangVisibility={this.setHangVisibility}
                          setDate={this.setDate}
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
                          user={this.state.user}
                          username={this.state.username}
                          joyrideType={joyrideType}
                          joyrideOverlay={joyrideOverlay}
                          onClickSwitch={this.onClickSwitch}
                          addSteps={this.addSteps}
                          addTooltip={this.addTooltip}
                         />
                        : ''}
                        {this.state.hangsReady && !this.state.username && !this.state.user.displayName ?
                          <AddName
                            user={this.state.user}
                            setUserName={this.setUserName}
                          />
                        : ''}
                        <span>
                        {this.state.mode === 'nearby' && this.state.isLive ?
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
                          {this.state.hangs &&
                            this.state.hangsReady &&
                            this.state.geoReady ?
                            <div className='wrapper hangs'>
                              {this.state.mode === 'hangs' && Hangs }
                              {this.state.mode === 'nearby' && NearHangs }
                              {this.state.mode === 'nearby' && GhostHangs }
                              {this.state.mode === 'today' && TodayHangs }
                              { clearInterval(this.state.mountID) }
                            </div>
                            : <div className="center page-spinner">
                            <i className="fa fa-circle-o-notch fa-spin"></i>
                            </div> }
                          {this.state.visiblehangs === 0 &&
                            this.state.mode === 'hangs' &&
                            //this.state.usernew &&
                            this.state.hangsReady &&
                            !this.state.makeHang &&
                            !this.state.hangKey ?
                            <div className="center">
                              <div className="bubble">Looks like you might be new around these parts.</div>
                              <div><img className="checkin-icon" alt="Cowgirl Avatar" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSItMTUgMCA1MTIgNTEyLjAwMDgyIiB3aWR0aD0iNTEycHgiPjxwYXRoIGQ9Im04Mi42NTIzNDQgNTEyaDMxNi4zODY3MThjMzAuOTYwOTM4IDAgNDUuNjI1LTM4LjA1MDc4MSAyMi43NjE3MTktNTguOTI5Njg4LTM2LjMwNDY4Ny0zMy4xNTYyNS05NC45MTAxNTYtNjcuOTY0ODQzLTE4MC45NTcwMzEtNjcuOTY0ODQzLTg2LjA0Mjk2OSAwLTE0NC42NDg0MzggMzQuODA4NTkzLTE4MC45NTMxMjUgNjcuOTY0ODQzLTIyLjg2MzI4MSAyMC44Nzg5MDctOC4xOTkyMTkgNTguOTI5Njg4IDIyLjc2MTcxOSA1OC45Mjk2ODh6bTAgMCIgZmlsbD0iI2MzZGZlZCIvPjxwYXRoIGQ9Im0zMjMuNjAxNTYyIDM5Ny4wMTk1MzFjLTI0LjE2Nzk2OC03LjM3MTA5My01MS42NjQwNjItMTEuOTEwMTU2LTgyLjc1NzgxMi0xMS45MTAxNTYtODYuMDQyOTY5IDAtMTQ0LjY0ODQzOCAzNC44MDQ2ODctMTgwLjk1MzEyNSA2Ny45NjA5MzctMjIuODYzMjgxIDIwLjg3ODkwNy04LjIwMzEyNSA1OC45Mjk2ODggMjIuNzYxNzE5IDU4LjkyOTY4OGgxNTguMTkxNDA2YzY2LjE4MzU5NC0yNC43NjE3MTkgODAuMTMyODEyLTgzLjg3ODkwNiA4Mi43NTc4MTItMTE0Ljk4MDQ2OXptMCAwIiBmaWxsPSIjYWZkMGRkIi8+PHBhdGggZD0ibTEyMS44MjQyMTkgMzkxLjc0MjE4OGMtMTguOTAyMzQ0IDE4LjkwMjM0My05OC42Njc5NjkgNjguMDIzNDM3LTExNy41NzAzMTMgNDkuMTE3MTg3LTE4LjkwMjM0NC0xOC45MDIzNDQgMzAuMjE0ODQ0LTk4LjY2Nzk2OSA0OS4xMTcxODgtMTE3LjU3MDMxMyAxOC45MDIzNDQtMTguOTAyMzQzIDQ5LjU1MDc4MS0xOC45MDIzNDMgNjguNDUzMTI1IDAgMTguOTAyMzQzIDE4LjkwMjM0NCAxOC45MDIzNDMgNDkuNTUwNzgyIDAgNjguNDUzMTI2em0wIDAiIGZpbGw9IiNmZjc5NTYiLz48cGF0aCBkPSJtMzU5Ljg2NzE4OCAzOTEuNzQyMTg4YzE4LjkwMjM0MyAxOC45MDIzNDMgOTguNjY3OTY4IDY4LjAyMzQzNyAxMTcuNTcwMzEyIDQ5LjExNzE4NyAxOC45MDIzNDQtMTguOTAyMzQ0LTMwLjIxNDg0NC05OC42Njc5NjktNDkuMTE3MTg4LTExNy41NzAzMTMtMTguOTAyMzQzLTE4LjkwMjM0My00OS41NTA3ODEtMTguOTAyMzQzLTY4LjQ1MzEyNCAwLTE4LjkwMjM0NCAxOC45MDIzNDQtMTguOTAyMzQ0IDQ5LjU1MDc4MiAwIDY4LjQ1MzEyNnptMCAwIiBmaWxsPSIjZmY3OTU2Ii8+PHBhdGggZD0ibTM3MC4zNzEwOTQgMzc3LjExMzI4MWgtMjU5LjA1NDY4OHMtMTI1LjEzNjcxOCA5MC4zMDg1OTQgMTI5LjUyNzM0NCAxMzQuODg2NzE5YzI1NC42Njc5NjktNDQuNTc4MTI1IDEyOS41MjczNDQtMTM0Ljg4NjcxOSAxMjkuNTI3MzQ0LTEzNC44ODY3MTl6bTAgMCIgZmlsbD0iI2Y0NjI2MiIvPjxwYXRoIGQ9Im0zMjMuOTM3NSAzNzcuMTEzMjgxaC0yMTIuNjIxMDk0cy0xMjUuMTM2NzE4IDkwLjMwODU5NCAxMjkuNTI3MzQ0IDEzNC44ODY3MTljOTEuODU5Mzc1LTM0LjM3MTA5NCA4My4wOTM3NS0xMzQuODg2NzE5IDgzLjA5Mzc1LTEzNC44ODY3MTl6bTAgMCIgZmlsbD0iI2Q2NWI1YiIvPjxwYXRoIGQ9Im0xMjYuMjIyNjU2IDI5OS4xMjg5MDZjMCAyOS42NDQ1MzItMjQuMDMxMjUgNTMuNjc1NzgyLTUzLjY3NTc4MSA1My42NzU3ODJzLTUzLjY3NTc4MS0yNC4wMzEyNS01My42NzU3ODEtNTMuNjc1NzgyYzAtMjkuNjQwNjI1IDI0LjAzMTI1LTUzLjY3MTg3NSA1My42NzU3ODEtNTMuNjcxODc1czUzLjY3NTc4MSAyNC4wMzEyNSA1My42NzU3ODEgNTMuNjcxODc1em0wIDAiIGZpbGw9IiNmZmFlYTEiLz48cGF0aCBkPSJtNDYyLjgyMDMxMiAyOTkuMTI4OTA2YzAgMjkuNjQ0NTMyLTI0LjAzMTI1IDUzLjY3NTc4Mi01My42NzU3ODEgNTMuNjc1Nzgycy01My42NzU3ODEtMjQuMDMxMjUtNTMuNjc1NzgxLTUzLjY3NTc4MmMwLTI5LjY0MDYyNSAyNC4wMzEyNS01My42NzE4NzUgNTMuNjc1NzgxLTUzLjY3MTg3NXM1My42NzU3ODEgMjQuMDMxMjUgNTMuNjc1NzgxIDUzLjY3MTg3NXptMCAwIiBmaWxsPSIjZmZjZmMyIi8+PHBhdGggZD0ibTI0MC44NDc2NTYgNDU4LjAyNzM0NGMtOTIuNTY2NDA2IDAtMTY4LjMwMDc4MS03NS43MzQzNzUtMTY4LjMwMDc4MS0xNjguMjk2ODc1di04Ny4zNDM3NWMwLTkyLjU2MjUgNzUuNzM0Mzc1LTE2OC4yOTY4NzUgMTY4LjMwMDc4MS0xNjguMjk2ODc1IDkyLjU2MjUgMCAxNjguMjk2ODc1IDc1LjczNDM3NSAxNjguMjk2ODc1IDE2OC4yOTY4NzV2ODcuMzQzNzVjMCA5Mi41NjI1LTc1LjczNDM3NSAxNjguMjk2ODc1LTE2OC4yOTY4NzUgMTY4LjI5Njg3NXptMCAwIiBmaWxsPSIjZmZlMmQ5Ii8+PHBhdGggZD0ibTI0MC44NDc2NTYgMzQuMDg5ODQ0Yy05Mi41NjY0MDYgMC0xNjguMzAwNzgxIDc1LjczNDM3NS0xNjguMzAwNzgxIDE2OC4yOTY4NzV2ODcuMzQzNzVjMCA2MS41NzgxMjUgMzMuNTM1MTU2IDExNS43MjI2NTYgODMuMjMwNDY5IDE0NS4wNjI1LTguNDE0MDYzLTM4LjcxNDg0NC03LjgyMDMxMy03Ny41MzEyNS00LjM4NjcxOS0xMDkuMDU0Njg4IDMuODE2NDA2LTM1LjAwNzgxMiAyMS4wODk4NDQtNjcuMjMwNDY5IDQ4LjA5Mzc1LTg5Ljg0Mzc1IDU0LjM5MDYyNS00NS41NDI5NjkgNzAuMTkxNDA2LTEzNy40Njg3NSA3NC40ODA0NjktMTk4LjUxMTcxOS0xMC43MTQ4NDQtMi4xNjAxNTYtMjEuNzg5MDYzLTMuMjkyOTY4LTMzLjExNzE4OC0zLjI5Mjk2OHptMCAwIiBmaWxsPSIjZmZjZmMyIi8+PHBhdGggZD0ibTI5MS4yOTI5NjkgMTY0Ljc2NTYyNXMtNzMuODI0MjE5IDk1Ljg5ODQzNy0yMDQuNzAzMTI1IDEyMC42OTkyMTljLTE1LjY2MDE1NiAyLjk2NDg0NC0zMC4zODI4MTMtOC41NDY4NzUtMzEuMDkzNzUtMjQuNDY4NzUtMS4xOTE0MDYtMjYuNTQyOTY5LS4wNzQyMTktNjYuMzUxNTYzIDEyLjI1NzgxMi05Ni4yMzA0NjkuNzg5MDYzLjc4OTA2MyAyMjMuNTM5MDYzIDAgMjIzLjUzOTA2MyAwem0wIDAiIGZpbGw9IiNmZjk0NzgiLz48cGF0aCBkPSJtMzI4LjQxNzk2OSAxNzEuMDg1OTM4czIuODg2NzE5IDc1LjEwNTQ2OCA1OS41NTg1OTMgMTA2LjczNDM3NGMxNi43MTQ4NDQgOS4zMjgxMjYgMzcuNDYwOTM4LTIuMjA3MDMxIDM4LjY1NjI1LTIxLjMxMjUgMS41NTA3ODItMjQuNzY5NTMxLS41NTQ2ODctNTguODI4MTI0LTE3LjQ4ODI4MS04NS40MjE4NzR6bTAgMCIgZmlsbD0iI2ZmOTQ3OCIvPjxwYXRoIGQ9Im0yNzQuNzA3MDMxIDEuNjQ4NDM4Yy0xNC4xMTMyODEgNC40NDkyMTgtMzMuODU5Mzc1IDEwLjc2NTYyNC0zMy44NTkzNzUgMTAuNzY1NjI0cy0xOS43NS02LjMxNjQwNi0zMy44NjMyODEtMTAuNzY1NjI0Yy05LjI5Mjk2OS0yLjkyOTY4OC0xOS40MTAxNTYtMS45Mzc1LTI3Ljg5MDYyNSAyLjg2MzI4MS01My4zMzk4NDQgMzAuMTk5MjE5LTc5LjI1IDc5LjIxMDkzNy05MS4xMDU0NjkgMTExLjIzMDQ2OS02LjQ2ODc1IDE3LjQ3NjU2MiAzLjQ2MDkzOCAzNi43MjY1NjIgMjEuMzk4NDM4IDQxLjc4OTA2MiAyOC4wNTg1OTMgNy45MjE4NzUgNzQuMDExNzE5IDE3LjU1ODU5NCAxMzEuNDYwOTM3IDE3LjU1ODU5NCA1Ny40NDkyMTkgMCAxMDMuMzk4NDM4LTkuNjM2NzE5IDEzMS40NTcwMzItMTcuNTU4NTk0IDE3LjkzNzUtNS4wNjI1IDI3Ljg2NzE4Ny0yNC4zMTI1IDIxLjM5ODQzNy00MS43ODkwNjItMTEuODUxNTYzLTMyLjAxOTUzMi0zNy43NjU2MjUtODEuMDMxMjUtOTEuMTAxNTYzLTExMS4yMzA0NjktOC40ODA0NjgtNC44MDQ2ODgtMTguNjAxNTYyLTUuNzkyOTY5LTI3Ljg5NDUzMS0yLjg2MzI4MXptMCAwIiBmaWxsPSIjYzY4ZDZkIi8+PHBhdGggZD0ibTE2My4xOTE0MDYgMTQuNTk3NjU2Yy00Mi43MTg3NSAzMC4yMTA5MzgtNjQuNTkzNzUgNzIuNDg0Mzc1LTc1LjIwMzEyNSAxMDEuMTQ0NTMyLTYuNDY4NzUgMTcuNDc2NTYyIDMuNDYwOTM4IDM2LjcyNjU2MiAyMS4zOTg0MzggNDEuNzg5MDYyIDI4LjA1ODU5MyA3LjkxNzk2OSA3NC4wMDc4MTIgMTcuNTU4NTk0IDEzMS40NjA5MzcgMTcuNTU4NTk0IDQxLjg5MDYyNSAwIDc3LjY1NjI1LTUuMTI1IDEwNC44NDM3NS0xMC45NzI2NTZ2LTczLjAyNzM0NHMtNjcuNDUzMTI1LTQxLjEzNjcxOS0xMTkuMDUwNzgxLTQ1LjgyODEyNWMtMzUuNjcxODc1LTMuMjQyMTg4LTU0Ljk0OTIxOS0yMC4zOTA2MjUtNjMuNDQ5MjE5LTMwLjY2NDA2M3ptMCAwIiBmaWxsPSIjYjI3ODViIi8+PHBhdGggZD0ibTI0MC44NDc2NTYgNzEuNTExNzE5Yy0xMjMuMTc1NzgxIDAtMTk1LjM5MDYyNSA3MS42NjAxNTYtMjI5LjM1OTM3NSAxMTguMzI0MjE5LTEwLjYxMzI4MSAxNC41NzQyMTggMS42Nzk2ODggMzQuNjc5Njg3IDE5LjQ4NDM3NSAzMS44NDc2NTYgNTEuOTQ1MzEzLTguMjU3ODEzIDE0MC42MjEwOTQtMjAuNTAzOTA2IDIwOS44NzUtMjAuNTAzOTA2IDY5LjI1IDAgMTU3LjkyNTc4MiAxMi4yNDYwOTMgMjA5Ljg3MTA5NCAyMC41MDM5MDYgMTcuODA0Njg4IDIuODMyMDMxIDMwLjA5NzY1Ni0xNy4yNzM0MzggMTkuNDg0Mzc1LTMxLjg0NzY1Ni0zMy45Njg3NS00Ni42NjQwNjMtMTA2LjE4MzU5NC0xMTguMzI0MjE5LTIyOS4zNTU0NjktMTE4LjMyNDIxOXptMCAwIiBmaWxsPSIjZGQ5ZjgwIi8+PHBhdGggZD0ibTI0MC44NDc2NTYgNzEuNTExNzE5Yy0xMjMuMTc1NzgxIDAtMTk1LjM5MDYyNSA3MS42NjAxNTYtMjI5LjM1OTM3NSAxMTguMzI0MjE5LTEwLjYxMzI4MSAxNC41NzQyMTggMS42Nzk2ODggMzQuNjc5Njg3IDE5LjQ4NDM3NSAzMS44NDc2NTYgMzcuNjQwNjI1LTUuOTg0Mzc1IDk0LjU1ODU5NC0xNC4wNTg1OTQgMTQ5LjQwNjI1LTE4LjA1NDY4OC03LjY5OTIxOC0xMS40NDE0MDYtMTMuODc4OTA2LTI3LjE3OTY4Ny0xNC44OTg0MzctNDguNjAxNTYyLTIuOTkyMTg4LTYyLjg1NTQ2OSA3NS4zNjcxODctODMuNTE1NjI1IDc1LjM2NzE4Ny04My41MTU2MjV6bTAgMCIgZmlsbD0iI2M2OGQ2ZCIvPjxwYXRoIGQ9Im0yNDAuODQzNzUgMzUyLjY2Nzk2OWMtMTUuOTg4MjgxIDAtMjguOTQ1MzEyLTEyLjk2MDkzOC0yOC45NDUzMTItMjguOTQ5MjE5di0yMS4wNDY4NzVjMC00LjM2MzI4MSAzLjUzNTE1Ni03LjkwMjM0NCA3LjkwMjM0My03LjkwMjM0NGg0Mi4wODk4NDRjNC4zNjcxODcgMCA3LjkwMjM0NCAzLjUzOTA2MyA3LjkwMjM0NCA3LjkwMjM0NHYyMS4wNDY4NzVjMCAxNS45ODgyODEtMTIuOTYwOTM4IDI4Ljk0OTIxOS0yOC45NDkyMTkgMjguOTQ5MjE5em0wIDAiIGZpbGw9IiM1NzU2NWMiLz48cGF0aCBkPSJtMTc0Ljg5MDYyNSAzMjMuNzE4NzVjMC0xMy41NzgxMjUtMTMuODI0MjE5LTI0LjU4OTg0NC0zMC44Nzg5MDYtMjQuNTg5ODQ0LTE3LjA1MDc4MSAwLTMwLjg3NSAxMS4wMTE3MTktMzAuODc1IDI0LjU4OTg0NCAwIDEzLjU4MjAzMSAxMy44MjQyMTkgMjQuNTg5ODQ0IDMwLjg3NSAyNC41ODk4NDQgMTcuMDU0Njg3IDAgMzAuODc4OTA2LTExLjAwNzgxMyAzMC44Nzg5MDYtMjQuNTg5ODQ0em0wIDAiIGZpbGw9IiNmZmE2YmIiLz48cGF0aCBkPSJtMzY4LjU1NDY4OCAzMjMuNzE4NzVjMC0xMy41NzgxMjUtMTMuODI0MjE5LTI0LjU4OTg0NC0zMC44Nzg5MDctMjQuNTg5ODQ0LTE3LjA1MDc4MSAwLTMwLjg3NSAxMS4wMTE3MTktMzAuODc1IDI0LjU4OTg0NCAwIDEzLjU4MjAzMSAxMy44MjQyMTkgMjQuNTg5ODQ0IDMwLjg3NSAyNC41ODk4NDQgMTcuMDU0Njg4IDAgMzAuODc4OTA3LTExLjAwNzgxMyAzMC44Nzg5MDctMjQuNTg5ODQ0em0wIDAiIGZpbGw9IiNmZmE2YmIiLz48ZyBmaWxsPSIjNTc1NjVjIj48cGF0aCBkPSJtMzIzLjkzNzUgMzEwLjIyMjY1NmMtNC4yNjk1MzEgMC03LjcyNjU2Mi0zLjQ2MDkzNy03LjcyNjU2Mi03LjcyNjU2MnYtMTIuODI4MTI1YzAtNC4yNjU2MjUgMy40NTcwMzEtNy43MjY1NjMgNy43MjY1NjItNy43MjY1NjMgNC4yNjU2MjUgMCA3LjcyMjY1NiAzLjQ2MDkzOCA3LjcyMjY1NiA3LjcyNjU2M3YxMi44MjgxMjVjMCA0LjI2NTYyNS0zLjQ1NzAzMSA3LjcyNjU2Mi03LjcyMjY1NiA3LjcyNjU2MnptMCAwIi8+PHBhdGggZD0ibTE1Ny43NTM5MDYgMzEwLjIyMjY1NmMtNC4yNjU2MjUgMC03LjcyNjU2Mi0zLjQ2MDkzNy03LjcyNjU2Mi03LjcyNjU2MnYtMTIuODI4MTI1YzAtNC4yNjU2MjUgMy40NjA5MzctNy43MjY1NjMgNy43MjY1NjItNy43MjY1NjMgNC4yNjk1MzIgMCA3LjcyNjU2MyAzLjQ2MDkzOCA3LjcyNjU2MyA3LjcyNjU2M3YxMi44MjgxMjVjMCA0LjI2NTYyNS0zLjQ1NzAzMSA3LjcyNjU2Mi03LjcyNjU2MyA3LjcyNjU2MnptMCAwIi8+PC9nPjwvc3ZnPgo=" />
                              </div>
                              <div className='welcome-buttons'>
                                <a className="btn nearby" onClick={() => this.setMode('nearby')}>
                                  <span><i className="fa fa-map-marker white"></i> <b>See</b>{" what's happening "}<b>Nearby</b></span>
                                </a>
                                <a className="btn make" onClick={() => this.toggleForm()}>
                                  <span><i className="fa fa-plus white"></i> <b>Make</b> a quick <b>Hang</b></span>
                                </a>
                              </div>
                            </div>
                          : ''}
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
                      </div> } />
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
              <Route path="/invites" render={(props) =>
                    <div className='container invites'>
                      <Invites invites={this.state.invites} user={this.state.user} />
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
