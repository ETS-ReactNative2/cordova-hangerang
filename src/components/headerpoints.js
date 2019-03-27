import React from "react";
import firebase from './firebase.js';
import {Route} from 'react-router-dom';

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
          let value = Object.values(points);
          total = parseInt(total, 10) + parseInt(value, 10);
          return total;
        });
        return (
          <Route render={({history}) => (
              <a onClick={() => {history.push('/points/total') }}
                 className='user-points'>
                  <i className='fa fa-star'></i>{total}
              </a>
          )}/>
        );
    }
}

export default HeaderPoints;
