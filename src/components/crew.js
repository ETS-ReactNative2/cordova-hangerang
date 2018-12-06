import React from "react";
import firebase from './firebase.js';

class Crew extends React.Component {
    constructor() {
      super();
      this.state = {
        crew: {},
      }
    }

    componentDidMount(){
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
              <h3>Crew</h3>
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
