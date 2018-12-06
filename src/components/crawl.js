import React from "react";
import firebase from './firebase.js';
import humble from '../assets/crawl/humble.png';
import littlebear from '../assets/crawl/littlebear.png';
import prismatic from '../assets/crawl/prismatic.png';
import villamyriam from '../assets/crawl/villamyriam.png';
import zendo from '../assets/crawl/zendo.png';

/*
Humble Downtown: -LKXsfeTzOmVmHsEoWxD
Humble Lomas: -LKyK8Vq4Z6mqjbJo3-v
Little Bear: -LKyKDjkGtUb0PYMy4oU
Villa Myriam: -LKyKNoL1Yt8tN6y-5KO
The Brew: -LKyKYI0sPo_XYKMTJMD
Zendo: -LKyKgci1oueqrdngpKQ
Prismatic: -LKyKmgEGbiR2WPyYD4H

const disloyalPlaces = [
'-LKXsfeTzOmVmHsEoWxD',
'-LKyK8Vq4Z6mqjbJo3-v',
'-LKyKDjkGtUb0PYMy4oU',
'-LKyKNoL1Yt8tN6y-5KO',
'-LKyKYI0sPo_XYKMTJMD',
'-LKyKgci1oueqrdngpKQ',
'-LKyKmgEGbiR2WPyYD4H'
]

*/

class Crawl extends React.Component {
    constructor() {
      super();
      this.state = {
        humble: false,
        littlebear: false,
        prismatic: false,
        myriam: false,
        zendo: false,
      }
    }

    componentDidMount = (result) => {
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var user = snapshot.val();
          var key = Object.keys(snapshot.val())[0];
          var places = user[key]['places'];
          if(places){
            Object.keys(places).forEach((p) => {
              let place = places[p];
              if(place.pid === '-LKXsfeTzOmVmHsEoWxD' || place.pid === '-LKyK8Vq4Z6mqjbJo3-v'){
                this.setState({humble: true});
              }else if(place.pid === '-LKyKDjkGtUb0PYMy4oU'){
                this.setState({littlebear: true});
              }else if(place.pid === '-LKyKNoL1Yt8tN6y-5KO' || place.pid === '-LKyKYI0sPo_XYKMTJMD'){
                this.setState({myriam: true});
              }else if(place.pid === '-LKyKmgEGbiR2WPyYD4H'){
                this.setState({prismatic: true});
              }else if(place.pid === '-LKyKgci1oueqrdngpKQ'){
                this.setState({zendo: true});
              }
            });
          }
        }
      });
    }

    render() {
        return (
            <div className="page-wrapper">
              <h3>Coffee Crawl</h3>
              <hr />
              <div className={'locations'}>
                <div id="humble" className={this.state.humble ? 'checked' : ''}>
                  <a href="http://humblecoffeeco.com/" target="blank">
                    <img src={humble} alt="Humble Coffee" />
                  </a>
                </div>
                <div id="littlebear" className={this.state.littlebear ? 'checked' : ''}>
                  <a href="http://humblecoffeeco.com/" target="blank">
                    <img src={littlebear} alt="Little Bear Coffee" />
                  </a>
                </div>
                <div id="prismatic" className={this.state.prismatic ? 'checked' : ''}>
                  <a href="http://humblecoffeeco.com/" target="blank">
                    <img src={prismatic} alt="Prismatic Coffee" />
                  </a>
                </div>
                <div id="villamyriam" className={this.state.myriam ? 'checked' : ''}>
                  <a href="http://humblecoffeeco.com/" target="blank">
                    <img src={villamyriam} alt="Villy Myriam Coffee" />
                  </a>
                </div>
                <div id="zendo" className={this.state.zendo ? 'checked' : ''}>
                  <a href="http://humblecoffeeco.com/" target="blank">
                    <img src={zendo} alt="Zendo Coffee" />
                  </a>
                </div>
              </div>
              {this.state.humble &&
              this.state.littlebear &&
              this.state.prismatic &&
              this.state.myriam &&
              this.state.zendo ?
              <p>
              <b>Congratulations!</b><br />
              You have formed a <b>caffeine</b> and <b>friendship</b> based
              Voltron.<br />
              Time to <b>treat yo self!</b>
              </p>
              : <span><p className={'small'}><b>Hang</b> and <b>Check-In</b>
              &nbsp; at any of these fine local coffee places.</p>
              <p className={'small'}>Check-In at all <b>5</b> and get a
              &nbsp;<b>free item*</b> at any location on your next visit</p></span>}
              <span className={'x-small'}>* Item $10 or less in value</span>
            </div>
        );
    }
}

export default Crawl;
