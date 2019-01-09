import React from "react";
import firebase from './firebase.js';

class HeaderPoints extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        points: {}
      }
    }

    render() {
        if(this.props.uid){
          const usersRef = firebase.database().ref('members');
          usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
            if (snapshot.exists()) {
              var user = snapshot.val();
              var key = Object.keys(snapshot.val())[0];
              var points = user[key]['points'];
              if(points){
                this.setState({points});
              }
            }
          });
        }
        let total = 0;
        Object.entries(this.state.points).map((p,i) => {
          let points = p[1];
          let desc = Object.keys(points);
          let value = Object.values(points);
          total = parseInt(total) + parseInt(value);
        });
        return (
          <span className='user-points'>{total}</span>
        );
    }
}

export default HeaderPoints;
