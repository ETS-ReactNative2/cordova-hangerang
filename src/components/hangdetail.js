import React from "react";
import firebase, {base} from './firebase.js';
import HangItem from './hangitem.js';

class HangDetail extends React.Component {
  constructor() {
    super();
    this.state = {
      hang: [],
      key: ''
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
    if(this.props.hash){
      base.syncState(`hangs`, {
        context: this,
        state: 'hash',
        asArray: true,
        queries: {
          orderByChild: 'hash',
          equalTo: this.props.hash
        },
        then() {
          var item = this.state.hash;
          if(item.length > 0){
            this.setState({ key: item[0]['key'] });
            base.syncState(`hangs/${item[0]['key']}`, {
              context: this,
              state: 'hang',
              keepKeys: true
            });
          }
        }
      });
    }
  }

  render(){
      return (
        <div className="wrapper">
        {Object.keys(this.state.hang).length > 0 ?
          <section className="hang-detail">
            <HangItem
              onHangChange={this.onHangChange}
              hang={this.state.hang}
              user={this.props.user}
              username={this.props.username}
              userphoto={this.props.userphoto}
              token={this.props.token}
              id={this.state.key}
              mapsize={'600x300'}
              detail={true}
              openPopupBox={this.props.openPopupBox}
            />
          </section>
        : <div className="center"><i className="fa fa-circle-o-notch fa-spin"></i></div> }
        </div>
      );
    }

}

export default HangDetail;
