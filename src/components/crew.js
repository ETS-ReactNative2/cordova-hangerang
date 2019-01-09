import React from "react";
import firebase from './firebase.js';
import GeoFire from 'geofire';

class Crew extends React.Component {
    constructor() {
      super();
      this.state = {
        crew: {},
        nearby: 0,
      }
    }

    componentDidMount(){
      console.log(this.props.userkey);
      if(this.props.uid){
        const usersRef = firebase.database().ref('members');
        usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var user = snapshot.val();
            var key = Object.keys(snapshot.val())[0];
            var crew = user[key]['crew'];
            if(crew){
              this.setState({crew});
            }
          }
        });
      }
      let usersGeoRef = firebase.database().ref('members-gl');
      let geoUser = new GeoFire(usersGeoRef);
      let nearby = [];
      if(this.props.userkey){
        geoUser.get(this.props.userkey).then(function(location) {
            console.log(location);
            if (location === null) {
                console.log("Provided key is not in GeoFire");
            } else {
              let geoQuery = geoUser.query({
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

    render() {
        let crew = this.state.crew;
        let Crew = Object.entries(crew).map((c,i) => {
          let member = c[1];
          return (
          <div className="crew-member" key={`crew-member-${i}`}>
            <img src={member.userphoto} alt={member.user} className="crew-member-image" />
            <p className="small crew-member-name">{member.user}</p>
          </div> )
        });

        return (
            <div className="page-wrapper ">
              <h3>Your Crew</h3>
              <div className="small">
                There are
                <strong> {this.state.nearby.length} </strong>
                potential crew members nearby
              </div>
              <hr />
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
