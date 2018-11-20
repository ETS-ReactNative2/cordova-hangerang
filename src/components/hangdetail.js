import React from "react";
import axios from 'axios';
import QRCode from 'qrcode.react';
import firebase, {base} from './firebase.js';
import HangItem from './hangitem.js';
import GeoCheck from './geocheck.js';
import Seo from './seo.js';

class HangDetail extends React.Component {
  constructor() {
    super();
    this.state = {
      hang: [],
      image: [],
      key: '',
      token: '',
      placekey: '',
      chckloc: false,
      geoReady: '',
      geoCheck: false
    }
    this.onHangChange = this.onHangChange.bind(this);
    this.getPlaceKey = this.getPlaceKey.bind(this);
  }

  setAddress = (address) => this.setState({ address })
  setGeoCheck = (geoCheck) => this.setState({ geoCheck });
  setCheckLoc = (chckloc) => this.setState(chckloc);

  onHangChange(hangid) {
    const hangRef = firebase.database().ref(`/hangs/${hangid}`);
    hangRef.once('value', (snapshot) => {
       let hang = snapshot.val();
       this.setState({ hang });
     });
  }

  getPlaceKey(place) {
    const placesRef = firebase.database().ref(`/places/`);
    placesRef
    .orderByChild('pid')
    .equalTo(place)
    .limitToFirst(1)
    .once('value', (snapshot) => {
       let key = Object.keys(snapshot.val())[0];
       this.setState({ placekey: key });
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
            this.getPlaceKey(this.state.hang.place);
          }
        }
      });
      axios.get(`https://firebasestorage.googleapis.com/v0/b/fun-food-friends-cf17d.appspot.com/o/images%2F${this.props.hash}.png`)
        .then(res => {
          const token = res.downloadTokens;
          this.setState({ token });
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
            {this.state.key && this.props.userphoto === this.state.hang.userphoto ?
            <div className="center">
            {this.state.chckloc ?
              <GeoCheck
              user={this.props.user}
              hang={this.state.hang}
              getGeoCheck={this.getGeoCheck}
              setCheckLoc={this.setCheckLoc}
              hangKey={this.state.key}
              userkey={this.props.userkey}
               />
            : ''}
            {this.state.hang.validhost ?
              <div className="hang-qr">
                <QRCode
                  value={"/checkin/"+this.state.placekey}
                  size='256'
                  fgColor='#000000'
                  bgColor='#ffffff'
                  level='L'
                  renderAs='svg'
                />
              </div>
            : <a className="btn" onClick={() => this.setCheckLoc({chckloc: true})}>
            Host Check-In
              </a>}
            </div> : ''}
            <Seo
              title={"Hangerang: "+this.state.hang.title}
              path={"/hang/"+this.props.hash}
              image={`https://firebasestorage.googleapis.com/v0/b/fun-food-friends-cf17d.appspot.com/o/images%2F${this.props.hash}.png?alt=media&token=${this.state.token}`}
            />
          </section>
        : <div className="center"><i className="fa fa-circle-o-notch fa-spin"></i></div> }
        </div>
      );
    }

}

export default HangDetail;
