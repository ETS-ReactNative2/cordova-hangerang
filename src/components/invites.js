import React from "react";
import firebase, {base} from './firebase.js';
import {Redirect, Route} from 'react-router-dom';
import Moment from 'react-moment';
import { PopupboxManager,PopupboxContainer } from 'react-popupbox';
import Gravatar from 'gravatar';

class Invites extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        groups: [],
        hangs: [],
        crew: [],
        userkey: '',
      }
    }

    removeInvite = ((id) => {
      base.remove(`/members/${this.props.userkey}/invite/${id}`);
    });

    joinCrew = (key,id) => {
      console.log(key);
      const member = {
        uid: this.props.user.uid,
        user: this.props.user.displayName,
        userphoto: this.props.user.photoURL,
      }
      const crewRef = firebase.database().ref(`/members/${key}/crew/`);
      crewRef.orderByChild("uid").equalTo(this.props.user.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          console.log('already in crew');
        }else{
          crewRef.push(member);
        }
      });
      base.remove(`/members/${this.props.userkey}/invite/${id}`);
    }

    setInvites = (invites) => {
      if(invites){
        Object.entries(invites).map((item,c) => {
          if(item[1].type === 'crew'){
            const groupsRef = firebase.database().ref(`/members/${item[1].userid}`);
            groupsRef.once('value',
              (snapshot) => {
                if (snapshot.exists()) {
                  this.setState({ crew: [...this.state.crew, {index: item[0], key: item[1].userid, value: snapshot.val()} ] });
                }
            });
          }
          if(item[1].type === 'group'){
            const groupsRef = firebase.database().ref(`/groups/${item[1].groupid}`);
            groupsRef.once('value',
              (snapshot) => {
                if (snapshot.exists()) {
                  let index = this.state.groups.findIndex(el => el.key === item[1].groupid);
                  if(index === -1){
                    this.setState({ groups: [...this.state.groups, {index: item[0], key: item[1].groupid, value: snapshot.val()} ] });
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
                    this.setState({ hangs: [...this.state.hangs, {index: item[0], key: item[1].hangid, value: snapshot.val()} ] });
                  }
                }
            });
          }
        });
      }
    }

    componentWillMount(){
      base.listenTo(`/members/${this.props.userkey}/invite`, {
        context: this,
        then(invites){
          console.log('invites changed');
          this.setState({
            groups: [],
            hangs: [],
          });
          this.setInvites(invites);
        }
      });
    }

    render() {
        if (!this.props.uid) {
           return <Redirect to='/' />
        }

        let crew = this.state.crew;
        console.log(crew);
        let CrewInvites = crew.map((c,i) => {
          let index = c['index'];
          let key = c['key'];
          let member = c['value'];
          return (
          <tr className="crews-row" key={`crew-${key}-${i}`}>
            <td className="crew-name left crew-invite">
              <span className='crew-member-row no-margin'>
                {member.userphoto ?
                <img className='crew-member-image'
                     src={member.userphoto}
                     alt={"Profile Picture for:"+member.displayName} />
                :
                <img className='crew-member-image'
                     src={Gravatar.url(member.email, {s: '100', r: 'x', d: 'retro'}, true)}
                     alt={"Profile Picture for:"+member.email} />
                }
              </span>
              <strong className="small">{member.name}</strong>&nbsp;
              <span className="small"><i className='fa fa-map-marker'></i> {member.address}</span>
            </td>
            <td className="crew-options">
              <button className="crew-join"
                 onClick={() => {
                   this.joinCrew(key,index),
                   PopupboxManager.close();
                 }}
              >Join Crew</button>
              <i className="fa fa-times"
                 onClick={() => {this.removeInvite(index)}}
              ></i>
            </td>
          </tr>
          )
        });

        let groups = this.state.groups;
        let GroupInvites = groups.map((c,i) => {
          let index = c['index'];
          let key = c['key'];
          let group = c['value'];
          return (
          <tr className="groups-row" key={`group-${key}-${i}`}>
            <td className="group-name">
              <strong>{group.name}</strong>
              {group.members &&
              <span className="group-number">{Object.entries(group.members).length + 1}</span>
              }
            </td>
            <td className="group-options">
              <Route render={({history}) => (
                <i className="fa fa-eye"
                   onClick={() => {
                     history.push('/group/invite/'+group.smsname+'/'+group.hash+'/true'),
                     PopupboxManager.close()
                   }}
                ></i>
              )}/>
              <i className="fa fa-times"
                 onClick={() => {this.removeInvite(index)}}
              ></i>
            </td>
          </tr>
          )
        });

        let hangs = this.state.hangs;
        let HangInvites = hangs.map((hang, i) => {
          let index = hang.index;
          let key = hang.key;
          hang = hang.value;
          return (
            <tr className="groups-row" key={`hang-${key}-${i}`}>
              <td className="group-name">
                <span className={'small'}>
                  {hang.title}<br />
                  <b>{hang.placename}</b><br />
                  <Moment calendar>{hang.datetime}</Moment><br />
                  <b>Invited By:</b> {hang.user}
                </span>
              </td>
              <td className="group-options">
                <Route render={({history}) => (
                  <i className="fa fa-eye"
                     onClick={() => {
                       history.push('/hang/'+hang.hash),
                       PopupboxManager.close()
                     }}
                  ></i>
                )}/>
                <i className="fa fa-times"
                   onClick={() => {this.removeInvite(index)}}
                ></i>
              </td>
            </tr>
          )
        });

        return (
            <div className="page-wrapper">
              <h3>Invites</h3>
              {this.state.crew && this.state.crew.length > 0 &&
                <div>
                  <hr />
                  <h4>Crew</h4>
                  <table className="groups-table">
                    <tbody>{CrewInvites}</tbody>
                  </table>
                  <hr />
                </div>
              }
              {this.state.groups && this.state.groups.length > 0 &&
                <div>
                  <hr />
                  <h4>Groups</h4>
                  <table className="groups-table">
                    <tbody>{GroupInvites}</tbody>
                  </table>
                  <hr />
                </div>
              }
              {hangs && hangs.length > 0 &&
                <div>
                  <hr />
                  <h4>Hangs</h4>
                  <table className="groups-table">
                    <tbody>{HangInvites}</tbody>
                  </table>
                  <hr />
                </div>
              }
          </div>
        );
    }
}

export default Invites;
