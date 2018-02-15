import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';

import logo from './assets/logo.png';
//import orange from './assets/orange.png';
import './assets/App.css';

import firebase, { auth, provider, base } from './components/firebase.js';
import GeoFire from 'geofire';

import Scroll from 'react-scroll';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import DateTimePicker from 'material-ui-datetimepicker';
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog';

import Geolocated from './components/geolocated.js';
import GoogleSuggest from './components/places.js';
import HangItem from './components/hangitem.js';
import HangDetail from './components/hangdetail.js';
import BottomNav from './components/bottomnav.js';

var scroll = Scroll.animateScroll;
var scroller = Scroll.scroller;
var Element = Scroll.Element;

class App extends PureComponent {
  constructor() {
    super();
    this.state = {
      title: '',
      user: null,
      username: '',
      userphoto: '',
      datetime: '',
      location: '',
      name: '',
      token: '',
      hangs: [],
      nearby: [],
      submit: false,
      newitem: '',
      mountID: '',
      makeHang: false,
      hangsReady: false,
      geoReady: false,
    }
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onHangChange = this.onHangChange.bind(this);
    this.clearSubmit = this.clearSubmit.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.toggleSubmit = this.toggleSubmit.bind(this);
    this.setUserLocation = this.setUserLocation.bind(this);
    this.filterByProperty = this.filterByProperty.bind(this);
  }

  setDate = (datetime) => this.setState({ datetime })
  setLocation = (suggest) => this.setState({ location: suggest })
  setName = (original) => this.setState({ name: original })
  setSubmit = (submit) => this.setState({ submit: false })

  filterByProperty(array, prop, value){
    var filtered = [];
    for(var i = 0; i < array.length; i++){

        var obj = array[i];

        for(var key in obj){
            if(typeof(obj[key] === "object")){
                var item = obj[key];
                if(item[prop] === value){
                    filtered.push(item);
                }
            }
        }

    }
    return filtered;
  }

  hashCode = function(s){
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const hangsRef = firebase.database().ref('hangs');
    const itemHash = 'h'+this.hashCode(this.state.title+''+this.state.datetime);
    const hang = {
      hash: itemHash,
      title: this.state.title,
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
    })
    this.setState({
      title: '',
      username: '',
      datetime: '',
      location: '',
      submit: true,
      newitem: itemHash
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
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        const usersRef = firebase.database().ref('users');
        const u = {
          email: user.email,
          fbid: user.providerData[0].uid,
          name: user.displayName,
          userphoto: user.photoURL,
          uid: user.uid,
          token: result.credential.accessToken
        }
        this.setState({
          user : user,
          username: user.displayName,
          userphoto: user.photoURL,
          token: result.credential.accessToken
        });
        usersRef.orderByChild("uid").equalTo(this.state.user.uid).once('value', function(snapshot){
          if (snapshot.exists()) {
            console.log('user already exists');
          }else{
            usersRef.push(u);
          }
        });
      });
  }

  setUserLocation(lat,lng) {
    let usersRef = firebase.database().ref('users');
    let usersGeoRef = firebase.database().ref('users-gl');
    let geoUser = new GeoFire(usersGeoRef);
    usersRef.orderByChild("uid").equalTo(this.state.user.uid).once('value', (snapshot) => {
      if (snapshot.exists()) {
        var key = Object.keys(snapshot.val())[0];
        geoUser.set(key, [lat, lng]).then(() => {
            console.log("User with key:"+key+" and location ["+lat+","+lng+"] been added/updated in Database");
            this.setState({ geoReady: true });
          }, function(error) {
          console.log("Error: " + error);
        });
      }
    });
  }

  onHangChange(hangid) {
    const hangRef = firebase.database().ref(`/hangs/${hangid}`);
    hangRef.once('value', (snapshot) => {
       let newhang = snapshot.val();
       this.setState({ hang: newhang });
     });
  }

  componentWillMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
        const usersRef = firebase.database().ref('users');
        usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var user = snapshot.val();
            var key = Object.keys(snapshot.val())[0];
            this.setState({ userkey: key });
            Object.entries(user).map((u) => {
              var token = u[1]['token'];
              this.setState({ token: token });
              return token;
            });
          }
        });
      }
    });
  }

  componentDidMount() {

    let usersGeoRef = firebase.database().ref('users-gl');
    let geoUser = new GeoFire(usersGeoRef);

    let hangsRef = firebase.database().ref('hangs-gl');
    let geoHang = new GeoFire(hangsRef);

    let id = setInterval(() => {
      this.setState({ mountID: id });
      base.syncState(`hangs`, {
        context: this,
        state: 'hangs',
        asArray: true,
        keepKeys: true,
        queries: {
          orderByChild: 'timestamp',
          startAt: Date.now()
        },
        then() {
          let nearby = [];
          if(this.state.userkey){
            geoUser.get(this.state.userkey).then(function(location) {
                if (location === null) {
                    console.log("Provided key is not in GeoFire");
                } else {
                  let geoQuery = geoHang.query({
                    center: location,
                    radius: 16
                  });

                  geoQuery.on("key_entered", function(key){
                    nearby.push(key);
                  });

                  geoQuery.on("key_exited", function(key){
                    console.log("not in area:"+key);
                  });
                }
            });
          }
          this.setState({ nearby: nearby });
          this.setState({ hangsReady: true });
        }
      })
    }, 3000);
  }

  componentDidUpdate() {
    if(this.newItem){
      var header = document.getElementsByTagName('header')[0];
      //var elem = document.getElementsByClassName('add-hang-fixed')[0];
      var offset = header.offsetHeight;
      scroller.scrollTo('newItem', {
        duration: 1500,
        delay: 100,
        offset: (offset * -1) - 20,
        smooth: "easeInOutQuint",
      })
    }
  }

  toggleSubmit() {
    if( this.state.submit === false || this.state.submit === '' ){
      this.setState({ submit: true });
    }else{
      this.setState({ newitem: '' });
      this.setState({ makeHang: false });
      this.setState({ submit: false });
      scroll.scrollTo(0);
    }
  }

  clearSubmit() {
    if( this.state.submit ){
      this.setState({ submit: false });
    }
  }

  toggleForm() {
    if( this.state.makeHang ){
      this.setState({ makeHang: false });
    }else{
      this.setState({ makeHang: true });
    }
  }

  render() {
    const Hangs = this.state.hangs.map((hang) => {

        if( this.state.nearby.includes(hang.key) ){

            if(hang.hash === this.state.newitem){
              return (
                <Element name="newItem" className="hang-item" key={hang.key} tabIndex="-1"  ref={section => this.newItem = section}>
                  <HangItem mapsize={'400x200'} onHangChange={this.onHangChange} hang={hang} user={this.state.user} token={this.state.token} />
                </Element>
              )
            }else{
              return (
                <section className="hang-item" key={hang.key}>
                  <HangItem mapsize={'400x200'} onHangChange={this.onHangChange} hang={hang} user={this.state.user} token={this.state.token} />
                </section>
              )
            }

        }

    });

    return (
      <div className='dashboard'>
        <header>
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
                </div> : <div className='user-profile user-logged-out'><button className="btn" onClick={this.login}><i className="fa fa-sign-in"></i><span>Log In</span></button></div>
                }
            </div>
        </header>
        {this.state.user ?
          <Router>
              <div className="main">
                <Route exact path="/" render={() =>
                  <div className='container'>
                        {this.state.submit ?
                        <section className='add-hang-fixed'>
                              <i className={'fa fa-times clear-submit'} onClick={this.clearSubmit}></i>
                              <h3>{"You Made A Hang! How Fantastic!"}</h3>
                              <button className="center" onClick={this.toggleSubmit}>{"Make Another?"}</button>
                              </section>
                              : <section className='add-hang'>
                                    <h3>{this.state.makeHang ? "Let's Make A Hang!" : "Wanna Make A Hang?"}</h3>
                                    { this.state.makeHang ?
                                    <MuiThemeProvider>
                                    <form onSubmit={this.handleSubmit}>
                                      <input type="hidden" name="username" onChange={this.handleChange} value={this.state.username} />
                                      <div className="add-hang-wrapper">
                                        <TextField type="text" name="title" placeholder="What to do?" onChange={this.handleChange} value={this.state.title} />
                                        <DateTimePicker className="input-datetime" name="datetime" placeholder="When?" onChange={this.setDate} value={this.state.datetime} DatePicker={DatePickerDialog} TimePicker={TimePickerDialog} minutesStep={15} />
                                        <GoogleSuggest name="location" onLocChange={this.setLocation} onNameChange={this.setName} getLocation={this.state.location.formatted_address} onSubmit={this.state.submit} />
                                      </div>
                                      { this.state.user && this.state.title && this.state.datetime && this.state.location ?
                                      <div className="add-hang-footer">
                                        <button className="btn">{"Let's Do This!"}</button>
                                      </div> : ''
                                      }
                                    </form>
                                    <i className={'fa fa-chevron-up'} onClick={this.toggleForm}></i>
                                    </MuiThemeProvider>
                                    : <i className={'fa fa-chevron-down'} onClick={this.toggleForm}></i> }
                              </section>
                        }
                        <Geolocated getUserLocation={this.setUserLocation} />
                        <section className='display-hang'>
                            {this.state.hangsReady && this.state.geoReady ?
                            <div className="wrapper">
                              <CSSTransitionGroup
                              className="hangs"
                              transitionName="hangs"
                              transitionEnterTimeout={500}
                              transitionLeaveTimeout={500}>
                              {Hangs}
                              { clearInterval(this.state.mountID) }
                              </CSSTransitionGroup>
                            </div>
                            : <i className="fa fa-circle-o-notch fa-spin"></i>
                            /*<div className="orange">
                              <span className="bubble">Orange you glad to see me? <br /><strong>Let me find some hangs...</strong></span>
                              <img src={orange} alt="Orange friend" />
                            </div>*/
                            }
                        </section>
                        <MuiThemeProvider>
                        <BottomNav />
                        </MuiThemeProvider>
                      </div> } />
                <Route path="/hangs/:id" render={(props) =>
                  <section className='display-hang'>
                  <div className='container'>
                    <Link className={'btn-back fa fa-angle-left'} to="/"></Link>
                    <HangDetail user={this.state.user} username={this.state.user.displayName} userphoto={this.state.user.photoURL} token={this.state.token} id={props.match.params.id} />
                  </div>
                  </section>
                } />
              </div>
          </Router>
        : ''}
        </div>
    );
  }
}

export default App;
