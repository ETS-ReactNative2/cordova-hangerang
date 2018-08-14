import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
//import MailchimpSubscribe from "react-mailchimp-subscribe";
//import PropTypes from 'prop-types';

import logo from './assets/logo.png';
import './assets/App.css';

import firebase, { auth, provider, base } from './components/firebase.js';
import GeoFire from 'geofire';
import ReactGA from 'react-ga';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Scroll from 'react-scroll';
import { PopupboxManager,PopupboxContainer } from 'react-popupbox';
import CopyToClipboard from 'react-copy-to-clipboard';
import Hashids from 'hashids';
import Joyride from 'react-joyride';

import BottomNav from './components/bottomnav.js';
import Geolocation from './components/geolocation.js';
import HangItem from './components/hangitem.js';
import HangDetail from './components/hangdetail.js';
import HangForm from './components/hangform.js';
import Home from './components/home.js';
import Privacy from './components/privacy.js';
import TermsConditions from './components/terms.js';

if( window.location.host.includes("hangerang") ){
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
      address: '',
      name: '',
      token: '',
      //hangs
      hangs: [],
      nearby: [],
      submit: false,
      loggingIn: false,
      newitem: '',
      mountID: '',
      makeHang: false,
      //component state
      isLive: true,
      hangsReady: false,
      geoReady: false,
      lat: '',
      lng: '',
      mode: 'global',
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
    this.addSteps = this.addSteps.bind(this);
    this.clearSubmit = this.clearSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.openPopupBox = this.openPopupBox.bind(this);
    this.onHangChange = this.onHangChange.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.toggleSubmit = this.toggleSubmit.bind(this);
    this.updatePopupBox = this.updatePopupBox.bind(this);
  }

  setDate = (datetime) => this.setState({ datetime })
  setAddress = (address) => this.setState({ address })
  setLocation = (suggest) => this.setState({ location: suggest })
  setName = (original) => this.setState({ name: original })
  setSubmit = (submit) => this.setState({ submit: false })
  setMode = (mode) => this.setState({ mode })
  setHangVisibility = (visibility) => this.setState({ visibility });
  setGeoLocation = (geoReady, lat, lng) => this.setState({ geoReady, lat, lng });

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({
      mode: 'global',
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
     let geoLocationRef = firebase.database().ref('hangs-gl');
     let geoFire = new GeoFire(geoLocationRef);
     geoFire.set(key, [hang.lat, hang.lng]).then(function() {
       console.log("Hang with key:"+key+" added to database");
       }, function(error) {
       console.log("Error: " + error);
     });
     this.setState({
       title: '',
       username: '',
       datetime: '',
       location: '',
       submit: true,
       makeHang: false,
       newitem: itemHash
     });
   });
  }

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  login() {
    this.setState({loggingIn: true});
    auth.signInWithRedirect(provider);
  }

  onHangChange(hangid) {
    const hangRef = firebase.database().ref(`/hangs/${hangid}`);
    hangRef.once('value', (snapshot) => {
       let newhang = snapshot.val();
       this.setState({ hang: newhang });
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
      this.setState({ newitem: '' });
      this.setState({ submit: false });
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

  //component cycle

  componentWillMount() {
    auth.onAuthStateChanged((user) => {
      console.log('auth state changed');
      if (user) {
        this.setState({ user, loggingIn: true });
        const usersRef = firebase.database().ref('members');
        usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var user = snapshot.val();
            var key = Object.keys(snapshot.val())[0];
            this.setState({ userkey: key });
            console.log(user);
            Object.entries(user).map((u) => {
              this.setState({
                loggingIn: false,
                name: u[1]['username'],
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
    });
  }

  componentDidMount() {
    auth.getRedirectResult().then(function(result) {
        if(!result.user){
          //do nothing
          console.log('no user yet');
        }else{
          const u = {
            email: result.user.email,
            fbid: result.user.providerData[0].uid,
            name: result.user.displayName,
            token: result.credential.accessToken,
            userphoto: result.user.photoURL,
            uid: result.user.uid
          }
          const usersRef = firebase.database().ref('members');
          usersRef.orderByChild("uid").equalTo(result.user.uid).once('value', (snapshot) => {
            if (snapshot.exists()) {
              console.log('user already exists');
              return;
            }else{
              usersRef.push(u);
              this.setState({usernew: true});
              console.log('user created in database');
              setTimeout(() => {
                this.setState({
                  isReady: true,
                  isRunning: true,
                });
                this.toggleForm();
              }, 3000);
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
      var timelimit = later.setHours(now.getHours()-2)

      let id = setInterval(() => {
        this.setState({ mountID: id });
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
                      radius: 32
                    });

                    geoQuery.on("key_entered", function(key){
                      nearby.push(key);
                    });
                  }
              });
            }
            this.setState({ nearby, hangsReady: true, loggingIn: false });
          }
        })
      }, 3000);
  }

  componentDidUpdate() {
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

        if(hang.hash === this.state.newitem){
          return (
            <Element name={'newItem'} className={'hang-item-new'} key={hang.key} ref={section => this.newItem = section} tabIndex="-1">
              <HangItem new={true} key={hang.key} mapsize={'600x300'} onHangChange={this.onHangChange} openPopupBox={this.openPopupBox} hang={hang} user={this.state.user} token={this.state.token} />
            </Element>
          )
        }else{
          return (
            <HangItem key={hang.key} mapsize={'600x300'} onHangChange={this.onHangChange} openPopupBox={this.openPopupBox} hang={hang} user={this.state.user} token={this.state.token} />
          )
        }

    });

    let NearHangs = this.state.hangs.map((hang) => {
      if( this.state.nearby.includes(hang.key) ){
        return (
          <HangItem key={hang.key} mapsize={'600x300'} onHangChange={this.onHangChange} openPopupBox={this.openPopupBox} hang={hang} user={this.state.user} token={this.state.token} />
        )
      }else{
        return (
          ''
        )
      }
    });

    let TodayHangs = this.state.hangs.map((hang) => {
        var date = new Date();
        var end = date.setHours(23,59,59,999);
        var timezoneOffset = (-1) * date.getTimezoneOffset() * 6000;
        var timestamp = (hang.timestamp + timezoneOffset);
        var utcOffset = date.getTimezoneOffset() * 6000;
        end = (end + utcOffset);
        if( timestamp < end ){
            return (
              <HangItem key={hang.key} mapsize={'600x300'} onHangChange={this.onHangChange} openPopupBox={this.openPopupBox} hang={hang} user={this.state.user} token={this.state.token}  />
            )
        }else{
          return (
            ''
          )
        }
    });

    return (
      <div className='dashboard'>
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
          <header className={headerClass}>
            <div className="wrapper">
              <div className="brand">
              <img src={logo} alt="Hangerang" />
              <h1>Hangerang</h1>
              </div>
                {this.state.user ?
                <div className='user-profile'>
                  <div className='user-profile-wrapper'>
                  <img src={this.state.user.photoURL} alt={"Profile Picture for:"+this.state.user.displayName} />
                  <h4>{this.state.user.displayName}</h4>
                  </div>
                  <button className="btn" onClick={this.logout}><i className="fa fa-sign-out"></i><span>Log Out</span></button>
                </div> : null
                }
            </div>
        </header>
        {this.state.isLive && this.state.user ?
          <Router>
              <div className="main">
                <Route exact path="/" render={() =>
                  <div className={'container joyride-step-'+this.state.currentStep }>
                        <HangForm
                          clearSubmit={this.clearSubmit}
                          handleChange={this.handleChange}
                          handleSubmit={this.handleSubmit}
                          makeHang={this.state.makeHang}
                          setHangVisibility={this.setHangVisibility}
                          setDate={this.setDate}
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
                        <span>
                        { this.state.mode === 'nearby' && this.state.isLive ?
                        <Geolocation
                          getlocale={this.getLocale}
                          user={this.state.user}
                          setGeoLocation={this.setGeoLocation}
                          setAddress={this.setAddress}
                          address={this.state.address}
                        />
                        : ''}
                        </span>
                        <section className='display-hang'>
                          {this.state.hangs && this.state.hangsReady ?
                            <div className="wrapper hangs">
                              {this.state.mode === 'global' ? Hangs : ''}
                              {this.state.mode === 'nearby' && this.state.geoReady  ? NearHangs : ''}
                              {this.state.mode === 'today' ? TodayHangs : ''}
                              { clearInterval(this.state.mountID) }
                            </div>
                            : <i className="fa fa-circle-o-notch fa-spin"></i>
                          }
                        </section>
                        <MuiThemeProvider>
                        <BottomNav setMode={this.setMode} />
                        </MuiThemeProvider>
                      </div> } />
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
                <Route path="/:hash" render={(props) =>
                  <section className='display-hang'>
                  <div className='container'>
                    <Link className={'btn-back fa fa-angle-left'} to="/"></Link>
                    <HangDetail user={this.state.user} username={this.state.user.displayName} userphoto={this.state.user.photoURL} token={this.state.token} hash={props.match.params.hash} openPopupBox={this.openPopupBox} />
                  </div>
                  </section>
                } />
              </div>
          </Router>
        : <Home login={this.login} isLive={this.state.isLive} loggingIn={this.state.loggingIn} /> }
        </div>
    );
  }
}

export default App;
