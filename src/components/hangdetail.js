import React from "react";
import firebase, {base} from './firebase.js';
import { CSSTransitionGroup } from 'react-transition-group';
import HangItem from './hangitem.js';

class HangDetail extends React.Component {
  constructor() {
    super();
    this.state = {
      hang: [],
    }
    this.onHangChange = this.onHangChange.bind(this);
  }

  onHangChange(hangid) {
    const hangRef = firebase.database().ref(`/hangs/${hangid}`);
    hangRef.once('value', (snapshot) => {
       let newhang = snapshot.val();
       this.setState({ hang: newhang });
     });
  }

  componentDidMount() {
    base.syncState(`hangs/${this.props.id}`, {
      context: this,
      state: 'hang',
      keepKeys: true
    });
  }

  render(){
      return (
        <div className="wrapper">
          <CSSTransitionGroup
            className="hangs"
            transitionName="hangs"
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={500}>
              <section className="hang-detail">
                <HangItem
                  onHangChange={this.onHangChange}
                  hang={this.state.hang}
                  user={this.props.user}
                  username={this.props.username}
                  userphoto={this.props.userphoto}
                  token={this.props.token}
                  id={this.props.id}
                  mapsize={'600x300'}
                  detail={true}
                />
              </section>
          </CSSTransitionGroup>
        </div>
      );
    }

}

export default HangDetail;
