import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import firebase, { auth, provider } from './firebase.js';
import Moment from 'react-moment';
import { StaticGoogleMap, Marker } from 'react-static-google-map';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Material from 'material-ui';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import DateTimePicker from 'material-ui-datetimepicker';
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog';
import GoogleSuggest from './places.js';
import HangMembers from './hangcrew.js';

  const mapstyle = "feature:all|element:labels|visibility:on&style=feature:landscape|element:all|weight:0.5|visibility:on&style=feature:poi|element:geometry.fill|visibility:on|color:0x83cead&style=feature:poi.park|element:geometry.fill|visibility:on|color:0x83cead&style=feature:road|element:all|visibility:on|color:0xffffff&style=feature:road|element:labels|visibility:on&style=feature:road.highway|element:all|visibility:on|color:0xfee379&style=feature:road.arterial|element:all|visibility:on|color:0xfee379&style=feature:water|element:all|visibility:on|color:0x7fc8ed";

class App extends Component {

  constructor() {
    super();
    this.state = {
      title: '',
      user: null,
      username: '',
      userphoto: '',
      datetime: '',
      location: '',
      hangs: []
    }
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setDate = (datetime) => this.setState({ datetime })
  setLocation = (suggest) => this.setState({ location: suggest })

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const hangsRef = firebase.database().ref('hangs');
    const hang = {
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
    }
    hangsRef.push(hang);
    this.setState({
      title: '',
      username: '',
      datetime: '',
      location: '',
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
        this.setState({user});
        const usersRef = firebase.database().ref('users');
        const u = {
          email: user.email,
          fbid: user.providerData[0].uid,
          name: user.displayName,
          userphoto: user.photoURL,
          uid: user.uid,
        }
        usersRef.orderByChild("uid").equalTo(this.state.user.uid).once('value', function(snapshot){
          if (snapshot.exists()) {
            console.log('user already exists');
          }else{
            usersRef.push(u);
          }
        });
      });
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });

    const hangsRef = firebase.database().ref('hangs');

    hangsRef.on('value', (snapshot) => {
      let hangs = snapshot.val();
      let newState = [];
      for (let hang in hangs) {
        newState.push({
          id: hang,
          title: hangs[hang].title,
          uid: hangs[hang].uid,
          user: hangs[hang].user,
          userphoto: hangs[hang].userphoto,
          datetime: hangs[hang].datetime,
          lat: hangs[hang].lat,
          lng: hangs[hang].lng,
          crew: hangs[hang].crew,
        });
      }
      this.setState({
        hangs: newState
      });
    });
  }

  joinHang(hang, user, uid) {
    const crewRef = firebase.database().ref(`/hangs/${hang}/crew/`);
    const member = {
      uid: this.state.user.uid,
      user: this.state.user.displayName,
      userphoto: this.state.user.photoURL,
    }
    crewRef.orderByChild("uid").equalTo(uid).once('value', function(snapshot){
      if (snapshot.exists()) {
        console.log('already added to hang');
      }else{
        crewRef.push(member);
      }
    });
  }

  removeHang(hangId) {
    const hangRef = firebase.database().ref(`/hangs/${hangId}`);
    hangRef.remove();
  }

  render() {
    return (
      <div className='app'>
        <header>
            <div className="wrapper">
              <div className="brand">
              <img src={logo} alt="Hangerang" />
              <h1>Hangerang</h1>
              </div>
              {this.state.user ?
                <button className="btn" onClick={this.logout}>Log Out</button>
                :
                <button className="btn" onClick={this.login}>Log In</button>
              }
            </div>
        </header>
        {this.state.user ?
        <div className='container'>
          <section className='add-hang'>
                  <div className='user-profile'>
                    <img src={this.state.user.photoURL} />
                    <h3>{this.state.user.displayName}</h3>
                  </div>
                <MuiThemeProvider>
                <form onSubmit={this.handleSubmit}>
                  <input type="hidden" name="username" onChange={this.handleChange} value={this.state.username} />
                  <TextField type="text" name="title" placeholder="What to do?" onChange={this.handleChange} value={this.state.title} />
                  <DateTimePicker className="input-datetime" name="datetime" placeholder="When?" onChange={this.setDate} value={this.state.datetime} DatePicker={DatePickerDialog} TimePicker={TimePickerDialog} minutesStep={15} />
                  <GoogleSuggest name="location" getSuggest={this.setLocation} setValue={this.state.location} />
                  <button className="btn">{"Let's Do This!"}</button>
                </form>
                </MuiThemeProvider>
          </section>
          <section className='display-hang'>
              <div className="wrapper">
                <ul className="hangs">
                  {this.state.hangs.map((hang) => {
                    return (
                      <li className="hang-item" key={hang.id}>
                        <div className="hang-header">
                          <h2>{hang.title}</h2>
                          @ <Moment format="hh:mm a">{hang.datetime}</Moment>
                          <div className="hang-time">
                            <Moment format="MMM" className="hang-month">{hang.datetime}</Moment>
                            <Moment format="DD" className="hang-day">{hang.datetime}</Moment>
                            <Moment format="YYYY" className="hang-year">{hang.datetime}</Moment>
                          </div>
                        </div>
                        <StaticGoogleMap size="300x150" style={mapstyle}>
                          <Marker location={hang.lat+","+hang.lng} color="0xec008c" />
                        </StaticGoogleMap>
                        <span className="hang-info">
                          <span className="hang-member"><img src={hang.userphoto} alt={hang.user} /> {hang.user}</span>
                          <span className="hang-ui">
                            {hang.uid === this.state.user.uid ?
                            <i className="fa fa-trash" onClick={() => this.removeHang(hang.id)}><span>Remove Hang</span></i>
                            :
                            <i className="fa fa-plus" onClick={() => this.joinHang(hang.id, this.state.user.displayName, this.state.user.uid)}><span>Join Hang</span></i>
                            }
                          </span>
                        </span>
                        <HangMembers hang={hang} />
                      </li>
                    )
                  })}
                </ul>
              </div>
          </section>
        </div>
        : '' }
      </div>
    );
  }
}

export default App;
