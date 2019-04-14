import React from "react";
import firebase, {base} from './firebase.js';
import GeoFire from 'geofire';
import {Redirect, Route} from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Member from './member.js';
import _, { differenceWith, isEqual } from 'lodash';

class Crew extends React.Component {
    constructor() {
      super();
      this.state = {
        crew: {},
        crewarr: [],
        diffnear: [],
        nearby: [],
      }
    }

    removeCrewMember = ((id) => {
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var key = Object.keys(snapshot.val())[0];
          base.remove(`/members/${key}/crew/${id}`);
        }
      });
    });

    componentDidMount(){
      if(this.props.uid){
        const usersRef = firebase.database().ref('members');
        usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var key = Object.keys(snapshot.val())[0];
            base.listenTo(`/members/${key}/crew/`, {
              context: this,
              then(crew){
                this.setState(prevState => ({
                  crew: crew,
                }));
                let crewarr = [];
                Object.entries(crew).map((c,i) => {
                  let member = c[1];
                  const usersRef = firebase.database().ref('members');
                  usersRef.orderByChild("uid").equalTo(member.uid).once('value', (snapshot) => {
                    var key = Object.keys(snapshot.val())[0];
                    crewarr.push(key);
                  });
                });
                this.setState(prevState => ({
                  crewarr: crewarr,
                }));
              }
            });
            // find nearby users
            let usersGeoRef = firebase.database().ref('members-gl');
            let geoUser = new GeoFire(usersGeoRef);
            let nearby = [];
            if(key){
              geoUser.get(key).then((location) => {
                  if (location === null) {
                      console.log("Provided key is not in GeoFire");
                  } else {
                    let geoQuery = geoUser.query({
                      center: location,
                      radius: 500
                    });
                    geoQuery.on("key_entered", (k, location, distance) => {
                      //console.log(key + ' entered query at ' + location + ' (' + distance + ' km from center)');
                      if(this.state.crewarr.indexOf(k) === -1 && k !== this.props.userkey){
                        this.setState({ nearby: [...this.state.nearby, k] });
                      }
                    });
                  }
              });
            }
          }
        });
      }
    }

    render() {
        if (!this.props.uid || this.props.uid === '' || this.props.uid === null) {
           return <Redirect to='/' />
        }

        let crew = this.state.crew;
        let Crew = Object.entries(crew).map((c,i) => {
          let member = c[1];
          let key = c[0];
          return (
          <div className="crew-member-row" key={`crew-member-${i}`}>
            <img src={member.userphoto} alt={member.user} className="crew-member-image" />
            <Route render={({history}) => (
            <div
              onClick={() => {history.push('/profile/'+member.uid)}}
              className="small crew-member-name">
              {member.user}
            </div>
            )} />
            <div
              onClick={() => {this.removeCrewMember(key)}}
              className="fa fa-times crew-member-remove"></div>
          </div> )
        });

        var settings = {
          infinite: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        };

        return (
            <div className="page-wrapper ">
              <div className="small">
                <strong> {this.state.nearby.length} </strong>
                potential <strong>
                Crew {this.state.nearby.length === 1 ? 'Member' : 'Members'}
                </strong> nearby
              </div>
              <Slider {...settings} className="members-slider">
              {this.state.nearby && this.state.nearby.map((item, key) =>
                <Member id={item} key={key} userkey={this.props.userkey} />
              )}
              </Slider>
              <hr />
              <h3>Your Crew</h3>
              {this.state.crew ?
                <div className="crew">
                {Crew}
                </div>
              : <div className="center page-spinner">
              <i className="fa fa-circle-o-notch fa-spin"></i>
              </div>}
            </div>
        );
    }
}

export default Crew;
