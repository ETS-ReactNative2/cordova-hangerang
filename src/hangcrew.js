import React from "react";
import firebase, { auth, provider } from './firebase.js';

class HangMembers extends React.Component {

  leaveHang(hang, user) {
    const hangRef = firebase.database().ref(`/hangs/${hang}/crew/${user}`);
    hangRef.remove();
  }

  render(){
      return (
        <div className="hang-crew-wrapper">
        {this.props.hang.crew ?
              <ul className="hang-crew">
              <span className="hang-crew-label">Crew</span>
              {Object.entries(this.props.hang.crew).map((member) => {
                return (
                <li className="hang-crew-item" key={member[0]}>
                  <span className="hang-member">
                    <img src={member[1].userphoto} alt={member[1].user} className="hang-user-photo" /> {member[1].user}
                  </span>
                  <span className="hang-ui">
                    <i onClick={() => this.leaveHang(this.props.hang.id, member[0])} className="hang-leave fa fa-minus"></i>
                  </span>
                </li>
                );
              })}
              </ul> : ''
        }
        </div>
      );
    }

}

export default HangMembers;
