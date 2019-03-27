import React from "react";
import firebase from './firebase.js';
import { Route } from 'react-router-dom';
import Select from 'react-select';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from '@material-ui/core/TextField';
import slugify from 'slugify';
import _ from 'lodash';
import generate from 'project-name-generator';
import Hashids from 'hashids';

let hashids = new Hashids('', 5);

class Groups extends React.Component {
    constructor() {
      super();
      this.state = {
        description: '',
        name: '',
        options: [],
        selectedOption: null,
        smsname: '',
        users: [],
      }
    }

    handleSubmit = (e) => {
      e.preventDefault();
      const { selectedOption } = this.state;
      const groupsRef = firebase.database().ref('groups');
      var key = Date.now();
      key = key.toString().split("").map(num => parseInt(num, 0));
      key = key.splice(8, 5);
      key = key.sort(function(a, b){ return 0.5 - Math.random() });
      const groupHash = hashids.encode(key);
      const group = {
        description: this.state.description,
        owner: this.props.uid,
        name: this.state.name,
        smsname: this.state.smsname,
        hash: groupHash
      }
      groupsRef.push(group).then((snap) => {
        let id = snap.key;
        let members = selectedOption;
        if(members){
          Object.entries(members).map((user) => {
            const groupMembersRef = firebase.database().ref(`/groups/${id}/members`);
            user = user[1];
            groupMembersRef.push(user);
            const usersRef = firebase.database().ref('members');
            usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
              if (snapshot.exists()) {
                var user = snapshot.val();
                let key = Object.keys(user)[0];
                const memberInviteRef = firebase.database().ref(`/members/${key}/invite`);
                memberInviteRef.push({type: 'group', groupid: id});
                console.log('Invite added!');
                return;
              }
            });
            return console.log("user");
          });
        }
        const groupRef = firebase.database().ref(`/groups/${id}`);
        groupRef.once('value', (snapshot) => {
           let group = snapshot.val();
           this.setState({ group });
         });
         const optionsRef = firebase.database().ref('members');
         optionsRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
           if (snapshot.exists()) {
             let key = Object.keys(snapshot.val())[0];
             const ownedRef = firebase.database().ref(`/members/${key}/owned`);
             ownedRef.push({id});
           }
         });
      });
      this.setState({
        name: '',
        options: [],
        selectedOption: null,
        users: [],
      });
   }

    componentWillMount(){
      var generated = generate().dashed;
      var genarray = generated.split('-');
      for(var i in genarray) {
        genarray[i] = _.startCase(genarray[i]);
      }
      var smsname = genarray.join('');
      this.setState({smsname});
      if(this.props.uid){
        const optionsRef = firebase.database().ref('members');
        optionsRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var user = snapshot.val();
            var key = Object.keys(snapshot.val())[0];
            var crew = user[key]['crew'];
            if(crew){
              Object.entries(crew).map((c,i) => {
                let member = c[1];
                this.setState(prevState => ({
                  options: [...prevState.options,
                    {
                      label: member.user,
                      status: 'invited',
                      user: member.user,
                      uid: member.uid,
                      userphoto: member.userphoto,
                      value: slugify(member.user),
                    }
                  ]
                }));
                return console.log("c");
              });
            }
          }
        });
      }
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
        options,
        name,
        selectedOption,
      } = this.state;

      let Members = '';

      if(group && group.members){
        Members = Object.entries(group.members).map((c,i) => {
          let member = c[1];
          return (
          <div className="crew-member-row" key={`crew-member-${i}`}>
            <img src={member.userphoto} alt={member.user} className="crew-member-image" />
            <p className="small crew-member-name">{member.user}</p>
            <div className="crew-member-info">
              <span className={`crew-member-status ${member.status}`}>{member.status}</span>
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
          <h3>Create A Group</h3>
          <hr />
          <MuiThemeProvider>
            <form
             onSubmit={this.handleSubmit}
             className={'group-creation-form'}
            >
            <TextField
             type="text"
             name="name"
             label="Name"
             onChange={this.handleChange}
             value={name}
            />
            <TextField
              name="description"
              multiline
              rows="4"
              label="Description"
              onChange={this.handleChange}
              value={description}
            />
           {this.state.options.length > 0 &&
              <Select
                className={'group-select'}
                value={selectedOption}
                placeholder={'Choose group Members...'}
                onChange={this.handleOptionChange}
                options={options}
                isMulti={true}
              />
            }
            {name &&
            <button className="btn">{"Add"}</button>
            }
            </form>
          </ MuiThemeProvider>
          {group &&
            <div>
              <h3>{group.name}</h3>
              <div>
                (Code Name: <span className="group-sms-name">{group.smsname}</span>)
              </div>
              <div>{Members}</div>
            </div>
          }
        </div>
      );
    }
}

export default Groups;
