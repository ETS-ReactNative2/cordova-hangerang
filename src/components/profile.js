import React from "react";
import firebase, { base } from './firebase.js';
import Gravatar from 'gravatar';

class Profile extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const memberRef = firebase.database().ref(`/members/${this.props.uid}`);
    const update = {
    }
    memberRef.update(update);
  }

  componentDidMount(){
    console.log(this.props);
    if(this.props.uid){
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var key = Object.keys(snapshot.val())[0];
          base.listenTo(`/members/${key}`, {
            context: this,
            then(member){
              this.setState(prevState => ({
                member: member,
              }));
            }
          });
        }
      });
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render() {
    const {
      member
    } = this.state;

    return (
      <div className="profile page-wrapper">
        {member &&
          <div>
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
          <div><i className='fa fa-envelope'></i> {member.email}</div>
          <div><i className='fa fa-phone'></i> {member.tel}</div>
          </div>
        }
      </div>
    );
  }
}

export default Profile;
