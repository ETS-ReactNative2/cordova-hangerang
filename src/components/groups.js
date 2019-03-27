import React from "react";
import firebase, {base} from './firebase.js';
import {Redirect, Route} from 'react-router-dom';

class Groups extends React.Component {
    constructor() {
      super();
      this.state = {
        invited: [],
        joined: [],
        owned: [],
      }
    }

    removeGroup(id) {
      base.remove(`/groups/${id}`);
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var key = Object.keys(snapshot.val())[0];
          const usersGroupsRef = firebase.database().ref(`/members/${key}/owned`);
          usersGroupsRef.orderByChild("id").equalTo(id).once('value', (snapshot) => {
                if (snapshot.exists()) {
                  var group = Object.keys(snapshot.val())[0];
                  base.remove(`/members/${key}/owned/${group}`);
                }
            });
        }
      });
    }

    getGroups(){
      if(this.props.uid){
        const usersRef = firebase.database().ref('members');
        usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var key = Object.keys(snapshot.val())[0];
            base.listenTo(`/members/${key}`, {
              context: this,
              then(member){
                console.log('A change has happened!');
                if(member.invite){
                  Object.entries(member.invite).map((item) => {
                    if(item[1].type === 'group'){
                      const groupsRef = firebase.database().ref(`/groups/${item[1].groupid}`);
                      groupsRef.once('value',
                        (snapshot) => {
                          if (snapshot.exists()) {
                            let index = this.state.invited.findIndex(el => el.key === item[1].groupid);
                            if(index === -1){
                              this.setState({ invited: [...this.state.invited, {key: item[1].groupid, value: snapshot.val()} ] });
                            }
                          }
                      });
                    }
                    return console.log("item");
                  });
                }
                if(member.groups){
                  Object.entries(member.groups).map((item) => {
                    const groupsRef = firebase.database().ref(`/groups/${item[1].id}`);
                    groupsRef.once('value',
                      (snapshot) => {
                          if (snapshot.exists()) {
                            let index = this.state.joined.findIndex(el => el.key === item[1].id);
                            if(index === -1){
                              this.setState({ joined: [...this.state.joined, {key: item[1].id, value: snapshot.val()} ] });
                            }
                          }
                      });
                      return console.log("item");
                  });
                }
                if(member.owned){
                  Object.entries(member.owned).map((item) => {
                    const groupsRef = firebase.database().ref(`/groups/${item[1].id}`);
                    groupsRef.once('value',
                      (snapshot) => {
                        if (snapshot.exists()) {
                          let index = this.state.owned.findIndex(el => el.key === item[1].id);
                          if(index === -1){
                            this.setState({ owned: [...this.state.owned, {key: item[1].id, value: snapshot.val()} ] });
                          }
                        }
                      });
                      return console.log("item");
                  });
                }
              }
            });
          }
        });
      }
    }

    componentDidMount(){
      this.getGroups();
    }

    componentDidChange(){
      this.getGroups();
    }

    render() {
        const { invited, joined, owned } = this.state;

        if (!this.props.uid || this.props.uid === '' || this.props.uid === null) {
           return <Redirect to='/' />
        }

        let Invited = invited.map((c,i) => {
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

        let Joined = joined.map((c,i) => {
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
                   onClick={() => {history.push('/group/invite/'+group.smsname+'/'+group.hash)}}
                ></i>
              )}/>
            </td>
          </tr>
          )
        });

        let Owned = owned.map((c,i) => {
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
                   onClick={() => {history.push('/group/invite/'+group.smsname+'/'+group.hash)}}
                ></i>
              )}/>
              <Route render={({history}) => (
                <i className="fa fa-pencil"
                   onClick={() => {history.push('/group/edit/'+key)}}
                ></i>
              )}/>
              <i className="fa fa-times"
                 onClick={() => this.removeGroup(key)}></i>
            </td>
          </tr>
          )
        });

        return (
            <div className="page-wrapper groups">
              <Route render={({history}) => (
                <div className="fa fa-home nav-btn top-left"
                   onClick={() => {history.push('/') }}
                ></div>
              )}/>
              <Route render={({history}) => (
                <div className="fa fa-plus-circle nav-btn top-right"
                   onClick={() => {history.push('/group/add') }}
                ></div>
              )}/>
            {owned || invited || joined ?
              <div>
                <h3>Your Groups</h3>
                <hr />
                {owned && owned.length > 0 &&
                  <div>
                    <h4>Owned</h4>
                    <table className="groups-table">
                      <tbody>{Owned}</tbody>
                    </table>
                    <hr />
                  </div>}
                {invited && invited.length > 0 &&
                  <div>
                    <h4>Invited</h4>
                    <table className="groups-table">
                      <tbody>{Invited}</tbody>
                    </table>
                    <hr />
                  </div>}
                {joined && joined.length > 0 &&
                  <div>
                    <h4>Joined</h4>
                    <table className="groups-table">
                      <tbody>{Joined}</tbody>
                    </table>
                  </div>}
                </div>
              : <div className="center page-spinner">
              <i className="fa fa-circle-o-notch fa-spin"></i>
              </div>}
            </div>
        );
    }
}

export default Groups;
