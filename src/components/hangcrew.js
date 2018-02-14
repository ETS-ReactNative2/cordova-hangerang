import React from "react";
import { Link } from 'react-router-dom';
import { base } from  './firebase.js';

class HangCrew extends React.Component {

  leaveHang(hang, uid) {
    base.remove(`/hangs/${hang}/crew/${uid}`);
    this.props.localHangChange(hang);
  }

  render(){
      return (
        <div className="hang-crew-wrapper">
        {this.props.crew ?
              <ul className="hang-crew">
              <span className="hang-crew-label">Crew</span>
              {Object.entries(this.props.crew).map((member) => {
                return (
                <li className="hang-crew-item" key={member[0]}>
                  <span className="hang-member">
                    <img src={member[1].userphoto} alt={member[1].user} className="hang-user-photo" />
                    <Link to={'/users/'+member[1].uid}>{member[1].user}</Link>
                  </span>
                  {this.props.uid === member[1].uid ?
                  <span className="hang-ui">
                    <i onClick={() => this.leaveHang(this.props.hang, member[0])} className="hang-leave fa fa-minus-circle"></i>
                  </span>
                  :
                  ''/*<span className="hang-ui">
                    <i className="hang-crew-detail fa fa-user-plus"></i>
                  </span>*/
                  }
                </li>
                );
              })}
              </ul> : ''
        }
        </div>
      );
    }

}

export default HangCrew;
