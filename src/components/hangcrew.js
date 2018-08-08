import React from "react";
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
                    {member[1].fbid ? <a href={'https://www.facebook.com/'+member[1].fbid} target="_blank">{member[1].user}</a>
                    : <span>{member[1].user}</span> }
                  </span>
                  {this.props.uid === member[1].uid ?
                  <span className="hang-ui">
                    <button onClick={() => this.leaveHang(this.props.hang, member[0])} className="hang-leave">Leave</button>
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
