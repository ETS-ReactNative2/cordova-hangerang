import React from "react";
import firebase from './firebase.js';
import {Redirect, Route} from 'react-router-dom';
import Moment from 'react-moment';

class Invites extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        groups: [],
        hangs: [],
      }
    }

    componentDidMount() {
      let invites = this.props.invites;
        Object.entries(invites).map((item,c) => {
          if(item[1].type === 'group'){
            const groupsRef = firebase.database().ref(`/groups/${item[1].groupid}`);
            groupsRef.once('value',
              (snapshot) => {
                if (snapshot.exists()) {
                  let index = this.state.groups.findIndex(el => el.key === item[1].groupid);
                  if(index === -1){
                    this.setState({ groups: [...this.state.groups, {key: item[1].groupid, value: snapshot.val()} ] });
                  }
                }
            });
          }
          if(item[1].type === 'hang'){
            const hangsRef = firebase.database().ref(`/hangs/${item[1].hangid}`);
            hangsRef.once('value',
              (snapshot) => {
                if (snapshot.exists()) {
                  let index = this.state.hangs.findIndex(el => el.key === item[1].hangid);
                  if(index === -1){
                    this.setState({ hangs: [...this.state.hangs, {key: item[1].hangid, value: snapshot.val()} ] });
                  }
                }
            });
          }
          return console.log("item");
        });
    }

    render() {

        if (!this.props.invites) {
           return <Redirect to='/' />
        }

        let groups = this.state.groups;
        let Groups = groups.map((c,i) => {
          let key = c['key'];
          let group = c['value'];
          return (
          <tr className="groups-row" key={`group-${key}`}>
            <td className="group-name">
              <strong>{group.name}</strong>
              {group.members &&
              <span className="group-number">{Object.entries(group.members).length + 1}</span>
              }
            </td>
            <td className="group-options">
              <Route render={({history}) => (
                <i className="fa fa-eye"
                   onClick={() => {history.push('/group/invite/'+group.smsname+'/'+group.hash+'/true')}}
                ></i>
              )}/>
            </td>
          </tr>
          )
        });

        let hangs = this.state.hangs;
        let Hangs = hangs.map((hang, key) => {
          hang = hang.value;
          return (
            <tr className="groups-row" key={`hang-${key}`}>
              <td className="group-name">
                <span className={'small'}>
                  {hang.title} @ <b>{hang.placename}</b><br />
                  <Moment calendar="true">{hang.datetime}</Moment><br />
                  <b>Invited By:</b> {hang.user}
                </span>
              </td>
              <td className="group-options">
                <Route render={({history}) => (
                  <i className="fa fa-eye"
                     onClick={() => {history.push('/hang/'+hang.hash)}}
                  ></i>
                )}/>
              </td>
            </tr>
          )
        });

        return (
            <div className="page-wrapper">
              <h3>Invites</h3>
              {this.state.groups && this.state.groups.length > 0 &&
                <div>
                  <hr />
                  <h4>Groups</h4>
                  <table className="groups-table">
                    <tbody>{Groups}</tbody>
                  </table>
                  <hr />
                </div>
              }
              {hangs && hangs.length > 0 &&
                <div>
                  <hr />
                  <h4>Hangs</h4>
                  <div>
                    {Hangs}
                  </div>
                  <hr />
                </div>
              }
          </div>
        );
    }
}

export default Invites;
