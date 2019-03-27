import React from "react";
import firebase from './firebase.js';
import HangMini from './hangmini.js';

class Place extends React.Component {

  constructor() {
    super();
    this.state = {
      place: null,
      verified: 0,
      crew: {},
      hang: {}
    }
    this.getVerifiedHangs = this.getVerifiedHangs.bind(this);
  }

  getVerifiedHangs = (hangs) => {
    if(hangs){
      let count = 0;
      Object.keys(hangs).map((key) => {
        const hangRef = firebase.database().ref(`/hangs/${hangs[key]}`);
        hangRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            let hang = snapshot.val();
            if(hang.validcrew && hang.validhost){
              count++;
              this.setState({verified: count});
              let crew = Object.assign(this.state.crew, hang.crew);
              this.setState({crew});
            }
          }
        });
        return console.log("key");
      });
    }
  }

  componentDidMount = () => {
    if(this.props.id){
      const placeRef = firebase.database().ref(`/places/${this.props.id}`);
      placeRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let place = snapshot.val();
          if(place && typeof place === 'object'){
            this.setState({ place });
            let verified = this.getVerifiedHangs(place.hangs);
            this.setState({verified});
          }
        }
      });
    }
  }

  render() {
    let Hangs = {};
    if(this.state.place){
      let hangs = this.state.place.hangs;
      Hangs = Object.keys(hangs).map((key) => {
          return (
            <HangMini hang={hangs[key]}  />
          )
      });
    }
    return (
      this.state.place ?
      <div className="place">
          <h1>{this.state.place.name}</h1>
          <hr />
          <div className="cards">
            <div className="card blue">
              <h2>Hangs Created</h2>
              <span className="data">
              {Object.keys(this.state.place.hangs).length}
              </span>
            </div>
            <div className="card pink">
              <h2>Hangs Verified</h2>
              <span className="data">
              {this.state.verified ? this.state.verified : '0'}
              </span>
            </div>
            <div className="card black">
              <h2>Total Guests</h2>
              <span className="data">
              {Object.keys(this.state.crew).length}
              </span>
            </div>
          </div>
          <div className="wrapper hangs">
          {this.state.place ? Hangs : '' }
          </div>
      </div>
      : ''
    )
  }

}

export default Place;
