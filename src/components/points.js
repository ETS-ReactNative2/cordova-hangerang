import React from "react";
import firebase from './firebase.js';

class Points extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        points: {}
      }
    }

    componentDidMount(){
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
    }

    render() {
        let points = this.state.points;
        let total = 0;
        let Points = Object.entries(points).map((p,i) => {
          let points = p[1];
          let desc = Object.keys(points);
          let value = Object.values(points);
          total = parseInt(total) + parseInt(value);
          return (
          <tr key={`member-points-${i}`}>
            <td className="small member-points-desc">
              {desc}
            </td>
            <td className="small member-points">
              <strong>{value}</strong>
            </td>
          </tr> )
        });

        return (
            <div className="page-wrapper ">
              <h3>Points</h3>
              {this.state.points ?
                <div>
                <table className="member-points-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th className="member-points-head">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Points}
                  </tbody>
                  <tfoot>
                    <tr className="member-points-total-row">
                      <td>Total</td>
                      <td className="member-points-total">{total}</td>
                    </tr>
                  </tfoot>
                </table>
                </div>
              : <div className="center page-spinner">
              <i className="fa fa-circle-o-notch fa-spin"></i>
              </div>}
            </div>
        );
    }
}

export default Points;
