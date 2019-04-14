import React from "react";
import firebase, { base } from './firebase.js';
import { PopupboxManager,PopupboxContainer } from 'react-popupbox';
import Gravatar from 'gravatar';

class Member extends React.Component {

  constructor() {
    super();
    this.state = {
      member: false,
      invited: false,
    }
  }

  componentDidMount = () => {
    if(this.props.id){
      const memberRef = firebase.database().ref(`/members/${this.props.id}`);
      memberRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
          let member = snapshot.val();
          this.setState({member: member});
          const pendingRef = firebase.database().ref(`/members/${this.props.userkey}/pending/`);
          pendingRef.orderByChild("userkey").equalTo(this.props.id).once('value', (snapshot) => {
            if (snapshot.exists()) {
              this.setState({invited: true});
            }
          });
        }
      });
    }
  }

  crewInvite = () => {
    const { member } = this.state;
    const usersRef = firebase.database().ref('members');
    usersRef.orderByChild("uid").equalTo(member.uid).once('value', (snapshot) => {
      if (snapshot.exists()) {
        var user = snapshot.val();
        let userkey = Object.keys(user)[0];
        const memberInviteRef = firebase.database().ref(`/members/${userkey}/invite`);
        memberInviteRef.push({type: 'crew', userid: this.props.userkey});
        base.push(`/members/${this.props.userkey}/pending`, {
          data: { userkey },
          then(err) {
            if (!err) {
              console.log('Crew Invite added!');
            }
          }
        });
        return;
      }
    });
    this.setState({invited: true});
  }

  openPopupbox = () => {
    const { member } = this.state;
    const content = (
      <div className="user-profile-popup">
        <i className={'fa fa-times'}
        onClick={()=>{PopupboxManager.close()}}>
        </i>
        <div className='user-profile'>
          {member.userphoto ?
          <img className='user-profile-img'
               src={member.userphoto}
               alt={"Profile Picture for:"+member.displayName} />
          :
          <img className='user-profile-img'
               src={Gravatar.url(member.email, {s: '100', r: 'x', d: 'retro'}, true)}
               alt={"Profile Picture for:"+member.email} />
          }
        </div>
        <strong>{member.name}</strong>
        <div><i className='fa fa-map-marker'></i> {member.address}</div>
        <div className="capsules">
          {member.interests && member.interests.map((i) => {
            return(<span className={'small capsule capitalize '+i}>{i.replace('-',' & ')}</span>)
          })}
        </div>
        <hr />
        {member.gem && <div className="user-gem small">
          <div><i className='fa fa-diamond'></i></div>
          <div><strong>{member.gem.name}</strong></div>
          <div>"{member.gem.comment}"</div>
        </div>}
        {!this.state.invited ?
        <button className={'btn small'} onClick={()=>{this.crewInvite()}}>
          Invite to Crew
        </button>:
        <button className={'btn small'}>
          Invite Pending
        </button>}
      </div>
    )
    PopupboxManager.open({ content });
  }

  render() {
    const { member } = this.state;

    if(member){
      return (
          <div className='small'>
            <div className='user-profile'>
              {member.userphoto ?
              <img className='user-profile-img'
                   src={member.userphoto}
                   alt={"Profile Picture for:"+member.displayName} />
              :
              <img className='user-profile-img'
                   src={Gravatar.url(member.email, {s: '100', r: 'x', d: 'retro'}, true)}
                   alt={"Profile Picture for:"+member.email} />
              }
            </div>
            <h3>{member.name}</h3>
            <div><i className='fa fa-map-marker'></i> {member.address}</div>
            {!this.state.invited ?
            <button
              className={'btn small'}
              onClick={this.openPopupbox}>
              More Info
            </button>:
            <button className={'btn small'}>
              Invite Pending
            </button>}
          </div>
      );
    }else{
      return null;
    }
  }
}

export default Member;
