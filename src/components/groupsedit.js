import React from "react";
import firebase, { base } from './firebase.js';
import {Route} from 'react-router-dom';
import Select from 'react-select';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from '@material-ui/core/TextField';
import slugify from 'slugify';
import _, { uniqBy } from 'lodash';

class GroupsEdit extends React.Component {
  constructor() {
    super();
    this.state = {
      bkgdColor: 'none',
      group: {},
      options: [],
      selectedOption: null,
      smsname: '',
      users: [],
    }
  }

  removeMember = (uid) => {
    const memberRef = firebase.database().ref(`/groups/${this.props.id}/members/`);
    memberRef.orderByChild("uid").equalTo(uid).once('value',
      (snapshot) => {
      if (snapshot.exists()) {
        let key = Object.keys(snapshot.val())[0];
        base.remove(`/groups/${this.props.id}/members/${key}`);
        const usersRef = firebase.database().ref('members');
        usersRef.orderByChild("uid").equalTo(uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            let k = Object.keys(snapshot.val())[0];
            const inviteRef = firebase.database().ref(`/members/${k}/invite/`);
            inviteRef.orderByChild("groupid").equalTo(this.props.id).once('value', (snapshot) => {
              if (snapshot.exists()) {
                let invitekey = Object.keys(snapshot.val())[0];
                base.remove(`/members/${k}/invite/${invitekey}`);
              }
            });
            const groupsRef = firebase.database().ref(`/members/${k}/groups/`);
            groupsRef.orderByChild("id").equalTo(this.props.id).once('value', (snapshot) => {
              if (snapshot.exists()) {
                let groupskey = Object.keys(snapshot.val())[0];
                base.remove(`/members/${k}/groups/${groupskey}`);
              }
            });
          }
        });
      }
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({bkgdColor: '#D7F4FF'});
    setTimeout(() => {
      this.setState({bkgdColor: 'none'})
    },1000);
    const { description, group, name, selectedOption } = this.state;
    const { id, uid } = this.props;
    const groupsRef = firebase.database().ref(`/groups/${id}`);
    let members = selectedOption;
    Object.entries(members).map((user) => {
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(user[1].uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var user = snapshot.val();
          let key = Object.keys(user)[0];
          const memberInviteRef = firebase.database().ref(`/members/${key}/invite`);
          memberInviteRef.push({type: 'group', groupid: id});
          console.log('Invite added!');
        }
      });
      return console.log("user");
    });
    if(group.members && Object.entries(group.members).length > 0){
      members = Object.entries(group.members);
      members = members.concat(selectedOption);
    }

    let groupname = group.name;
    if(group.name !== name){
     groupname = name;
    }

    const updatedgroup = {
      description: description,
      name: groupname,
      owner: uid,
      members: {}
    }

    groupsRef.update(updatedgroup);

    const groupMembersRef = firebase.database().ref(`/groups/${id}/members`);
    Object.entries(members).map((user) => {
      user = Object.entries(user);
      if(user[1][1] && user[1][1].length === 2){
        groupMembersRef.push(user[1][1][1]); //I really hate this...
      }else{
        groupMembersRef.push(user[1][1]); //And this shit...
      }
      return console.log("user added");
    });

    this.setState({
      selectedOption: null,
    });
  }

  componentWillMount(){
    base.listenTo(`/groups/${this.props.id}`, {
      context: this,
      then(group){
        this.setState(prevState => ({
          group: group,
          description: group.description,
          name: group.name,
        }));
        if(group.owner){
        const ownerRef = firebase.database().ref(`/members/`);
          ownerRef.orderByChild("uid").equalTo(group.owner).once('value',
            (snapshot) => {
            if (snapshot.exists()) {
              var owner = snapshot.val();
              var key = Object.keys(snapshot.val())[0];
              owner = owner[key];
              this.setState({owner});
            }
          });
        }
        if (group.members && Object.entries(group.members).length > 0) {
          const optionsRef = firebase.database().ref('members');
          optionsRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
            if (snapshot.exists()) {
              var user = snapshot.val();
              var key = Object.keys(snapshot.val())[0];
              var crew = user[key]['crew'];
              var options = [];
              if(crew){
                Object.entries(crew).map((c,i) => {
                  let member = c[1];
                  let arr = group.members;
                  arr = Object.keys(arr).filter(Boolean);
                  if( arr.findIndex(o => o.user === member.user) === -1 ){
                    options.push(
                      {
                        label: member.user,
                        status: 'invited',
                        user: member.user,
                        uid: member.uid,
                        userphoto: member.userphoto,
                        value: slugify(member.user),
                      }
                    );
                  }
                  return console.log("c");
                });
                this.setState({ options: options });
              }
            }
            // this.setState(prevState => ({
            //   options: _.uniqBy(...prevState.options, 'uid')
            // }));
          });
        }else{
          const optionsRef = firebase.database().ref('members');
          optionsRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
            if (snapshot.exists()) {
              var user = snapshot.val();
              var key = Object.keys(snapshot.val())[0];
              var crew = user[key]['crew'];
              var options = [];
              if(crew){
                Object.entries(crew).map((c,i) => {
                  let member = c[1];
                  options.push({
                    label: member.user,
                    status: 'invited',
                    user: member.user,
                    uid: member.uid,
                    userphoto: member.userphoto,
                    value: slugify(member.user),
                  });
                  return console.log("c");
                });
                this.setState({ options: options });
              }
            }
          });
        }
      }
    });
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleOptionChange = (selectedOption) => {
    this.setState({ selectedOption });
  }

  render() {
    const {
      description,
      group,
      owner,
      name,
      selectedOption,
      options,
    } = this.state;

    let Members = '';

    if(group.members && Object.entries(group).length > 0){
      Members = Object.entries(group.members).map((c,i) => {
        let member = c[1];
        return (
        <div className='crew-member-row' key={`crew-member-${i}`}>
          <img src={member.userphoto} alt={member.user} className="crew-member-image" />
          <p className="small crew-member-name">{member.user}</p>
          <div className="crew-member-info">
            <span className={`crew-member-status ${member.status}`}>{member.status}</span>
            <span className="fa fa-times crew-member-remove"
               onClick={() => this.removeMember(member.uid)}>
            </span>
          </div>
        </div> )
      });
    }

    return (
      <div className="page-wrapper">
        <Route render={({history}) => (
          <div className="fa fa-arrow-circle-left nav-btn top-left"
             onClick={() => {history.push('/groups') }}
          ></div>
        )}/>
        {group &&
          <div>
          <h3>Edit Group - {group.name}</h3>
          <div className="small">
            (Code Name: <span className="group-sms-name">{group.smsname}</span>)
          </div>
          <hr />
          <MuiThemeProvider>
            <form
             onSubmit={this.handleSubmit}
             className={'group-creation-form'}
            >
            <TextField
             type="text"
             name="name"
             placeholder={group.name}
             onChange={this.handleChange}
             value={name}
             style={{ background: `${ this.state.bkgdColor }` }}
            />
            <TextField
              name="description"
              multiline
              rows="4"
              placeholder={group.description}
              value={description}
              onChange={this.handleChange}
              style={{ background: `${ this.state.bkgdColor }` }}
            />
          {this.state.options &&
              <Select
                className={'group-select'}
                value={selectedOption}
                placeholder={'Choose group Members...'}
                onChange={this.handleOptionChange}
                options={options}
                isMulti={true}
              />
            }
            <button className="btn">{"Update"}</button>
            </form>
          </ MuiThemeProvider>
            <hr />
            <div>
              {owner &&
                <div className="crew-member-row" key={`crew-member-0`}>
                  <img src={owner.userphoto} alt={owner.name} className="crew-member-image" />
                  <p className="small crew-member-name">{owner.name}</p>
                  <div className="crew-member-info">
                    <span className="crew-member-status owner">Owner</span>
                  </div>
                </div>
              }
              {Members}
            </div>
          </div>
        }
      </div>
    );
  }
}

export default GroupsEdit;
