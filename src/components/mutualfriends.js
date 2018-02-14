import React from "react";
import firebase from './firebase.js';
import Async from 'react-promise';
import graph from 'fb-react-sdk';

class MutualFriends extends React.Component {
  getMutualFriends(user, uid, token){

    var getfbid = async () => {
      return new Promise((resolve, reject) => {
        const usersRef = firebase.database().ref(`/users/`);
        usersRef.orderByChild("uid").equalTo(uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var u = snapshot.val();
            Object.entries(u).map((member) => {
                resolve(member[1].fbid);
                return member[1].fbid;
            });
          }
          return;
        });
      });
    };

    var getGraphRequest = async () => {
      var fbid = await getfbid();
      return new Promise((resolve, reject) => {
        if(token){
          graph.get(fbid+'?fields=context.fields(mutual_friends)&access_token='+token, (err, res) => {
              if(!err){
                var friends = res.context.mutual_friends.summary.total_count;
                resolve(friends);
              }
          });
        }
      });
    };

    var friends = async () => {
      var result = await getGraphRequest();
      return new Promise((resolve, reject) => {
        resolve(result);
      });
    }

    return friends();

  }

  render(){
      return (
          <Async promise={this.getMutualFriends(this.props.user, this.props.hang.uid, this.props.token)} then={(val) => <span className="hang-number">{val}</span>}/>
      );
    }

}

export default MutualFriends;
