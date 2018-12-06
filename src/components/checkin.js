import React from "react";
import firebase from './firebase.js';
import moment from 'moment';
import QrReader from 'react-qr-reader';

import { getPoints } from '../helpers/points.js';

/*
Humble Downtown: -LKXsfeTzOmVmHsEoWxD
Humble Lomas: -LKyK8Vq4Z6mqjbJo3-v
Little Bear: -LKyKDjkGtUb0PYMy4oU
Villa Myriam: -LKyKNoL1Yt8tN6y-5KO
The Brew: -LKyKYI0sPo_XYKMTJMD
Zendo: -LKyKgci1oueqrdngpKQ
Prismatic: -LKyKmgEGbiR2WPyYD4H
*/
const disloyalPlaces = [
'-LKXsfeTzOmVmHsEoWxD',
'-LKyK8Vq4Z6mqjbJo3-v',
'-LKyKDjkGtUb0PYMy4oU',
'-LKyKNoL1Yt8tN6y-5KO',
'-LKyKYI0sPo_XYKMTJMD',
'-LKyKgci1oueqrdngpKQ',
'-LKyKmgEGbiR2WPyYD4H'
]
const baseUrl = window.location.protocol + "//" + window.location.host;

class CheckIn extends React.Component {
    constructor() {
      super();
      this.state = {
        place: null,
        hang: false,
        inhang: false,
        host: false,
        crew: false,
        disloyal: false,
        key: '',
        delay: 300,
        result: 'No result',
        validURL: false
      }
      this.handleScan = this.handleScan.bind(this)
    }

    handleScan(data){
      if(data){
        this.setState({
          result: data
        })
      }
      if(data && data.includes("goo.gl") || data && data.includes("checkin")){
        this.setState({
          validURL: true
        })
      }
    }
    handleError(err){
      console.error(err)
    }

    componentDidMount = (result) => {
      if(this.props.id !== 'scan'){
        const placeRef = firebase.database().ref(`/places/${this.props.id}`);
        placeRef.once('value', (snapshot) => {
          this.setState({place: snapshot.val()});
        }).then((res) => {
          if(this.state.place){
            let hangs = this.state.place['hangs'];
            Object.keys(hangs).forEach((e) => {
              let hangId = hangs[e];
              const hangRef = firebase.database().ref(`/hangs/${hangId}`);
              hangRef.once('value', (snapshot) => {
                let hang = snapshot.val();
                if(hang){
                  let time = moment(hang['datetime']).subtract(0,'hours').format("X");
                  var now = new Date();
                  var before = now.setHours(now.getHours() - 1);
                  var after = now.setHours(now.getHours() + 3);
                  before = Math.round( before*0.001 );
                  after = Math.round( after*0.001 );
                  console.log(before +"<"+ time +"<"+ after);
                  if(before < time && time < after) {
                    this.setState({
                      hang: hang,
                      key: hangId
                    });
                    console.log('there is a hang happening here right now!');
                  }else{
                    this.setState({hang: false});
                    console.log('there is no hang happening here right now...');
                  }
                }
              }).then(() => {
                if(this.state.hang){
                  const hangVisitRef = firebase.database().ref(`/hangs/${this.state.key}`);
                  if(this.props.uid === this.state.hang.uid){
                    this.setState({inhang: true});
                    hangVisitRef.once('value', (snapshot) => {
                      if(snapshot){
                        hangVisitRef.update({validhost: true});
                      }
                    });
                  }
                  let crew = this.state.hang['crew'];
                  if(crew && !this.state.inhang && !this.state.host){
                    Object.keys(crew).forEach((p) => {
                      let user = crew[p];
                      console.log(p);
                      console.log(user.uid);
                      console.log(this.props.uid);
                      if(user.uid === this.props.uid){
                        this.setState({inhang: true});
                        let hangCrewRef = firebase.database().ref(`/hangs/${this.state.key}/crew/${p}`);
                        hangVisitRef.once('value', (snapshot) => {
                          if(snapshot){
                            hangVisitRef.update({validcrew: true});
                            hangCrewRef.update({validcrew: true});
                          }
                        });
                      }
                    });
                  }
                  let validate = setInterval(() => {
                    if(this.state.hang && this.state.inhang && this.state.host && this.state.crew){
                      const usersRef = firebase.database().ref('members');
                      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
                        if (snapshot.exists()) {
                          var key = Object.keys(snapshot.val())[0];
                          const crewPointsRef = firebase.database().ref(`/members/${key}/points/`);
                          let points = getPoints(`checkin-${this.state.hang.visibility}`);
                          crewPointsRef.push(points);
                        }
                        if (snapshot.exists() && disloyalPlaces.indexOf(this.props.id) !== -1) {
                          const usersPlaceRef = firebase.database().ref(`/members/${key}/places/`);
                          usersPlaceRef.orderByChild("pid").equalTo(this.props.id).once('value', (snapshot) => {
                            if (snapshot.exists()) {
                              console.log('Already Visited');
                              return;
                            }else{
                              usersPlaceRef.push({ pid: this.props.id });
                              this.setState({disloyal: true});
                              console.log('Create a DisLoyal Visit');
                              return;
                            }
                          });
                        }
                    });
                    usersRef.orderByChild("uid").equalTo(this.state.hang.uid).once('value', (snapshot) => {
                      if (snapshot.exists()) {
                        var key = Object.keys(snapshot.val())[0];
                        console.log(key);
                        const hostPointsRef = firebase.database().ref(`/members/${key}/points/`);
                        let points = getPoints(`checkin-${this.state.hang.visibility}`);
                        hostPointsRef.push(points);
                      }
                    });
                    clearInterval(validate);
                  }else{
                    if(!this.state.key){
                      //don't do a damn thing...
                    }else{
                      let hangValidRef = firebase.database().ref(`/hangs/${this.state.key}`);
                      hangValidRef.once('value', (snapshot) => {
                        if(snapshot){
                          let hang = snapshot.val();
                          this.setState({host: hang.validhost});
                          this.setState({crew: hang.validcrew});
                        }
                      });
                    }
                  }
                }, 2000);
              }
              });
            });
          }
        });
      }
    }

    ScanQR = (() => {
      return (
        <div>
          <p>Use your camera to scan QR code.</p>
          <QrReader
            delay={this.state.delay}
            onError={this.handleError}
            onScan={this.handleScan}
            className={'qrreader'}
            />
        </div>
      )
    });

    ValidQR = (() => {
      return (
        <div>
          <img alt="valid code avatar" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MDcuMiA1MDcuMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTA3LjIgNTA3LjI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiMzMkJBN0M7IiBjeD0iMjUzLjYiIGN5PSIyNTMuNiIgcj0iMjUzLjYiLz4KPHBhdGggc3R5bGU9ImZpbGw6IzBBQTA2RTsiIGQ9Ik0xODguOCwzNjhsMTMwLjQsMTMwLjRjMTA4LTI4LjgsMTg4LTEyNy4yLDE4OC0yNDQuOGMwLTIuNCwwLTQuOCwwLTcuMkw0MDQuOCwxNTJMMTg4LjgsMzY4eiIvPgo8Zz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBkPSJNMjYwLDMxMC40YzExLjIsMTEuMiwxMS4yLDMwLjQsMCw0MS42bC0yMy4yLDIzLjJjLTExLjIsMTEuMi0zMC40LDExLjItNDEuNiwwTDkzLjYsMjcyLjggICBjLTExLjItMTEuMi0xMS4yLTMwLjQsMC00MS42bDIzLjItMjMuMmMxMS4yLTExLjIsMzAuNC0xMS4yLDQxLjYsMEwyNjAsMzEwLjR6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTM0OC44LDEzMy42YzExLjItMTEuMiwzMC40LTExLjIsNDEuNiwwbDIzLjIsMjMuMmMxMS4yLDExLjIsMTEuMiwzMC40LDAsNDEuNmwtMTc2LDE3NS4yICAgYy0xMS4yLDExLjItMzAuNCwxMS4yLTQxLjYsMGwtMjMuMi0yMy4yYy0xMS4yLTExLjItMTEuMi0zMC40LDAtNDEuNkwzNDguOCwxMzMuNnoiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
          <p>QR Code Valid</p>
          <a href={this.state.result} className={'btn'}>Check In</a>
        </div>
      )
    });

    CheckIn = (() => {
      return (
        <div>
        {this.state.place ?
        <p>
          Welcome to
          <strong> {this.state.place ? this.state.place['name'] : ''} </strong>
          {this.props.user.displayName}!
        </p>
        : <p>Checking Place and User...</p> }
        {this.state.hang ?
          <p className={'small'}>There is a <b>Hang</b> happening here right now!</p> :
          <p className={'small'}>There are no hangs happening here right now.</p>
        }
        {this.state.hang && this.state.inhang ?
          <p className={'small'}>You are part of it! Rock!</p> :
          ''
        }
        {this.state.hang && !this.state.inhang ?
          <p className={'small'}>Must be another hang. Bummer.</p> :
          ''
        }
        {this.state.host && this.state.inhang && !this.state.crew ?
          <p className={'small'}>Waiting for at least <b>one crew member</b> to check-in...</p> : ''
        }
        {!this.state.host && this.state.inhang && this.state.crew ?
          <p className={'small'}>Waiting for the <b>Host</b> to check-in...</p> : ''
        }
        {this.state.disloyal ?
          <p>You have a new stamp on your &nbsp;
            <b><a href={baseUrl+'/disloyalty/'+this.props.uid}>
            DisLoyalty Card</a></b>!
          </p> :
          ''
        }
        {this.state.host && this.state.inhang && this.state.crew ?
          <img className={'checkin-icon'} alt="valid hang" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiM4MDI4OTc7IiBjeD0iMjU2IiBjeT0iMjU2IiByPSIyNTYiLz4KPHBhdGggc3R5bGU9ImZpbGw6IzQ1MTE1MjsiIGQ9Ik01MTIsMjU2YzAtMC45NjEtMC4wMjYtMS45MTUtMC4wMzYtMi44NzRsLTExNC44MzYtMTE0LjZjLTMuMjA5LTQuMjM2LTcuMTg2LTYuMzE1LTEwLjkyOC03LjI0NiAgYy0zLjktMC45Ny04LjA0LTAuMTgtMTEuNjYsMi4yM2MtMC4zNDQsMC4yMjktMC42OTgsMC40ODktMS4wNTUsMC43NjVsLTMxLjgyMy0zMi4xMmMtNS4xNzktNi44NjYtMTIuMTU3LTcuNjg2LTE1LjEzMi03LjY4NiAgYy0yLjA4LDAtNC4wNiwwLjM3LTUuOTEsMS4wOGMtNy4xMzcsMi42ODktMTIuNDY1LDEwLjI3Ni0xNC41MDMsMjAuNTYybC00OS44MDUtNDguOTg4TDIzNS42MTQsNjEuNWwtMTIuODA1LDQ3LjEyNWwtNDYuNTAzLTQ2LjI4MSAgbC0yMC4xNzIsNy4yODhsMjIuMTU3LDYxLjMyM2wxNS4wNjcsMTQuODAxYy00Ljg1MywyLjEzNC0xMC4zMTEsNy4wMjUtMTIuNjQ3LDE4LjAzNGwtMTguODg2LTE4Ljg1NGwtNTYuMjAyLTMzLjA1N2wtMTAuODc0LDE4LjQ4NyAgbDUwLjU0LDUwLjIyM2MtMS4zNTQtMC4wNzctMi43MSwwLjA0My00LjAzOSwwLjM3Yy04Ljg0LDIuMi0xOS4wMSwxMC43OC0xNy4yMSwzOS4xNmMxLjM3OSwyMS43MTYsOC44MDcsODAuMzcyLDEyLjA0MSwxMDUuMzU3ICBsLTIxLjQ3MS0yMS44MzJjLTguNjE0LTkuMTc1LTE3LjgxLTE0LjA1NS0yNi4wNjktMTMuNzk1Yy01LjUxLDAuMTctMTAuMjUsMi42NS0xMy43Miw3LjE3Yy0xMC42MywxMy44Ni04LjkxLDMyLjAzLDYuNDgsNDguMjUgIGMxMi4wMSwxMi42NiwzNi40MSwzNi41NSw1MS4zLDUxLjk2YzQuMDQsNC4xOSw2LjM2LDEwLjMyLDYuMzYsMTYuODR2NjkuNjYyQzE3NC4wMzgsNTAxLjc5NywyMTMuODI3LDUxMiwyNTYsNTEyICBDMzk3LjM4NSw1MTIsNTEyLDM5Ny4zODUsNTEyLDI1NnoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0U2NzUwMDsiIGQ9Ik00NDYuMTUsMjk1LjU4Yy0xMi4wMSwxMi42Ny0zNi40MSwzNi41NS01MS4zLDUxLjk3Yy00LjA0LDQuMTgtNi4zNiwxMC4zMi02LjM2LDE2LjgzdjExMC43MSAgYy0yMC44NiwxMi42NC00My42NywyMi4zOS02Ny44NywyOC42OGMtMTEuOTQsMy4xMS0yNC4yMSw1LjM3LTM2Ljc2LDYuNzNjLTkuMTUsMC45OS0xOC40NSwxLjUtMjcuODYsMS41ICBjLTQuMTYsMC04LjMtMC4xLTEyLjQxLTAuMjlWMzM3Ljc2Yy0wLjI1LTIuNDktMy41Ny0zNC4zNi0xNS45Ny04Mi4wNmMtMS42My02LjI2LTMuNDEtMTIuOC01LjM3LTE5LjU4ICBjLTEuOS02LjYxLTMuOTctMTMuNDYtNi4yMS0yMC41Yy0xMC40OC0zMi45Mi0xMy43MS00OC4xNi0wLjY2LTU1LjkzYzEuMTgtMC43LDIuMzktMS4yNCwzLjYxLTEuNmMyLjc0LTAuODIsNS41My0wLjc4LDguMjQsMC4xNCAgYzYuMjEsMi4xLDExLjUxLDguNTcsMTUuNzUsMTkuMjFjMC4zMSwwLjc5LDAuNjQsMS42MiwwLjk3LDIuNDljNi4xOSwxNi4wNiwxNS41Myw0NC44MiwxOS40LDU2LjljMC4yMSwwLjY0LDAuNTcsMC44NSwwLjY0LDAuODMgIGMwLjM0LTAuMSwwLjg2LTAuOTQsMC42OS0yYy0wLjM5LTIuNTEtMC45Mi01LjktMS41Ni05Ljg5Yy0yLjE5LTEzLjg1LTUuNzMtMzYuMTgtOC4xMi01My43M2MtMC4yNC0xLjczLTAuNDYtMy40LTAuNjctNS4wMiAgYy0yLjY2LTIwLjUtNS4xNy0zOS44NywxMS4zOS00NC4yN2M0LjUtMS4xOSw4LjYxLTAuNTksMTIuMjIsMS43OWM3LjAzLDQuNjIsMTEuNTksMTUuNDcsMTQuMzYsMzQuMTQgIGMxLjI0LDguMzgsNC44NCwzMS4xMiw3Ljg0LDQ5LjI2YzEuNDcsOC44OCwyLjgsMTYuNjYsMy42NCwyMS4xMmMwLjE1LDAuNzgsMC41NywxLjEyLDAuNjksMS4xMmMwLjE0LDAsMC43My0wLjU0LDAuNzMtMS42VjEyNS43ICBjMC0xNS4wNiw2LjIxLTI2LjY4LDE1LjQyLTMwLjE1YzEuODUtMC43MSwzLjgzLTEuMDgsNS45MS0xLjA4YzUuMDEsMCwyMS4zOCwyLjMsMjEuMzgsMzEuOTN2MTAxLjY1YzAsMS4xNiwwLjY0LDEuNzksMC45LDEuOCAgYzAuMjIsMCwwLjctMC40NCwwLjg2LTEuMjljMi4wNS0xMS4zNCw4Ljk4LTQ5LjgyLDExLjkyLTY4Ljk2YzIuNDgtMTYuMDksOC40MS0yMy4wNywxMi45NS0yNi4wOWMzLjYyLTIuNDEsNy43Ni0zLjIsMTEuNjYtMi4yMyAgYzguODQsMi4yLDE5LjAxLDEwLjc4LDE3LjIxLDM5LjE1Yy0xLjQsMjIuMDYtOS4wNCw4Mi4yMS0xMi4xOSwxMDYuNTFjNi4zMi02LjQ3LDE1LjE0LTE1LjYsMTkuNzItMjAuODggIGM5LjE1LTEwLjUyLDE5LjEtMTYuMTgsMjcuOTctMTUuOWM1LjUxLDAuMTcsMTAuMjUsMi42NSwxMy43Miw3LjE4QzQ2My4yNiwyNjEuMiw0NjEuNTQsMjc5LjM3LDQ0Ni4xNSwyOTUuNTh6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiNDMDYyMDA7IiBkPSJNNDQ2LjE1LDI5NS41OGMtMTIuMDEsMTIuNjctMzYuNDEsMzYuNTUtNTEuMyw1MS45N2MtNC4wNCw0LjE4LTYuMzYsMTAuMzItNi4zNiwxNi44M3YxMTAuNzEgIGMtMjAuODYsMTIuNjQtNDMuNjcsMjIuMzktNjcuODcsMjguNjhWOTUuNTVjMS44NS0wLjcxLDMuODMtMS4wOCw1LjkxLTEuMDhjNS4wMSwwLDIxLjM4LDIuMywyMS4zOCwzMS45M3YxMDEuNjUgIGMwLDEuMTYsMC42NCwxLjc5LDAuOSwxLjhjMC4yMiwwLDAuNy0wLjQ0LDAuODYtMS4yOWMyLjA1LTExLjM0LDguOTgtNDkuODIsMTEuOTItNjguOTZjMi40OC0xNi4wOSw4LjQxLTIzLjA3LDEyLjk1LTI2LjA5ICBjMy42Mi0yLjQxLDcuNzYtMy4yLDExLjY2LTIuMjNjOC44NCwyLjIsMTkuMDEsMTAuNzgsMTcuMjEsMzkuMTVjLTEuNCwyMi4wNi05LjA0LDgyLjIxLTEyLjE5LDEwNi41MSAgYzYuMzItNi40NywxNS4xNC0xNS42LDE5LjcyLTIwLjg4YzkuMTUtMTAuNTIsMTkuMS0xNi4xOCwyNy45Ny0xNS45YzUuNTEsMC4xNywxMC4yNSwyLjY1LDEzLjcyLDcuMTggIEM0NjMuMjYsMjYxLjIsNDYxLjU0LDI3OS4zNyw0NDYuMTUsMjk1LjU4eiIvPgo8cGF0aCBzdHlsZT0iZmlsbDojRkZEQ0E4OyIgZD0iTTMxMS40MSwyNjUuM2MtMjIuMDQsNjkuMjYtMjcuMjQsMTE5LjAxLTI3LjU1LDEyMi4xNFY1MTAuNWMtOS4xNSwwLjk5LTE4LjQ1LDEuNS0yNy44NiwxLjUgIGMtNC4xNiwwLTguMy0wLjEtMTIuNDEtMC4yOWMtMTIuNTEtMC42LTI0Ljc5LTIuMS0zNi43Ni00LjQzYy0yMy45OS00LjY3LTQ2Ljc4LTEyLjY4LTY3Ljg3LTIzLjU0di02OS42NyAgYzAtNi41Mi0yLjMyLTEyLjY1LTYuMzYtMTYuODRjLTE0Ljg5LTE1LjQxLTM5LjI5LTM5LjMtNTEuMy01MS45NmMtMTUuMzktMTYuMjItMTcuMTEtMzQuMzktNi40OC00OC4yNSAgYzMuNDctNC41Miw4LjIxLTcsMTMuNzItNy4xN2M4Ljg3LTAuMjgsMTguODIsNS4zNywyNy45NywxNS45YzQuNTgsNS4yNywxMy40LDE0LjQxLDE5LjcyLDIwLjg4ICBjLTMuMTUtMjQuMy0xMC43OS04NC40Ni0xMi4xOS0xMDYuNTFjLTEuOC0yOC4zOCw4LjM3LTM2Ljk2LDE3LjIxLTM5LjE2YzMuOS0wLjk2LDguMDQtMC4xOCwxMS42NiwyLjIzICBjNC41NCwzLjAyLDEwLjQ3LDEwLjAxLDEyLjk1LDI2LjFjMi45NCwxOS4xMyw5Ljg3LDU3LjYxLDExLjkyLDY4Ljk1YzAuMTYsMC44NSwwLjY0LDEuMjksMC44NiwxLjI5YzAuMjYsMCwwLjktMC42NCwwLjktMS44ICBWMTc2LjA5YzAtMjkuNjQsMTYuMzctMzEuOTQsMjEuMzgtMzEuOTRjNy44OSwwLDE0LjQsNS4zNiwxOC4wNywxMy45NGMyLjA5LDQuODYsMy4yNiwxMC43NSwzLjI2LDE3LjI5djEwMi44OCAgYzAsMS4wNywwLjU5LDEuNiwwLjczLDEuNmMwLjEyLDAsMC41NC0wLjM0LDAuNjktMS4xMmMwLjg5LTQuNzcsMi4zNi0xMy4zNiwzLjk1LTIzLjA0YzIuOTQtMTcuNzksNi4zMy0zOS4yNSw3LjUzLTQ3LjMzICBjMS45Ni0xMy4yMSw0LjgxLTIyLjUsOC44LTI4LjQ0YzEuNjYtMi40NywzLjUtNC4zNiw1LjU2LTUuNzFjMS43Mi0xLjE0LDMuNTUtMS44Nyw1LjQ5LTIuMThjMi4xMi0wLjM2LDQuMzctMC4yMyw2LjczLDAuNCAgYzE2LjU2LDQuNCwxNC4wNSwyMy43NiwxMS4zOSw0NC4yN2MtMi4zNSwxOC4wOS02LjM4LDQzLjU0LTguNzksNTguNzRjLTAuNjQsMy45OS0xLjE3LDcuMzgtMS41Niw5Ljg5Yy0wLjE3LDEuMDcsMC4zNSwxLjksMC42OSwyICBjMC4wNywwLjAyLDAuNDMtMC4xOCwwLjY0LTAuODJjNC4wOC0xMi43MywxNC4yMy00NC4wMSwyMC4zNy01OS40YzQuMjItMTAuNTksOS40OS0xNy4wNCwxNS42Ny0xOS4xOCAgYzAuMDMtMC4wMSwwLjA1LTAuMDIsMC4wOC0wLjAzYzEuNjQtMC41NiwzLjMxLTAuNzksNC45OC0wLjdjMi4zMiwwLjExLDQuNjQsMC44Myw2Ljg3LDIuMTYgIEMzMjUuMTIsMjE3LjE0LDMyMS44OSwyMzIuMzgsMzExLjQxLDI2NS4zeiIvPgo8cGF0aCBzdHlsZT0iZmlsbDojRkZDNTZFOyIgZD0iTTMyMC42MiwyMjUuNzljMCw5LjA4LTMuNTQsMjEuNzEtOS4yMSwzOS41MWMtMjIuMDQsNjkuMjYtMjcuMjQsMTE5LjAxLTI3LjU1LDEyMi4xNFY1MTAuNSAgYy05LjE1LDAuOTktMTguNDUsMS41LTI3Ljg2LDEuNWMtMTYuODIsMC0zMy4yNi0xLjYyLTQ5LjE3LTQuNzJWMTQ1LjIyYzkuMjEsMy40OCwxNS40MiwxNS4xLDE1LjQyLDMwLjE2djEwMi44OCAgYzAsMS4wNywwLjU5LDEuNiwwLjczLDEuNmMwLjExLDAsMC41NC0wLjMzLDAuNjktMS4xMWMyLjU2LTEzLjU1LDkuNjMtNTcuOTEsMTEuNDgtNzAuMzhjMi43Ny0xOC42OCw3LjM0LTI5LjUzLDE0LjM2LTM0LjE1ICBjMy42MS0yLjM4LDcuNzItMi45OCwxMi4yMi0xLjc4YzE2LjU2LDQuNCwxNC4wNSwyMy43NywxMS4zOSw0NC4yN2MtMi4zNSwxOC4wOS02LjM4LDQzLjU0LTguNzksNTguNzQgIGMtMC42MywzLjk5LTEuMTcsNy4zOC0xLjU2LDkuODljLTAuMTcsMS4wNiwwLjM1LDEuOSwwLjY5LDJjMC4wNywwLjAyLDAuNDMtMC4xOCwwLjY0LTAuODJjNC4wOC0xMi43MywxNC4yMy00NC4wMSwyMC4zNy01OS40ICBjNC4yNC0xMC42NCw5LjU0LTE3LjEsMTUuNzUtMTkuMjFjMy45Mi0xLjMzLDguMDEtMC44MiwxMS44NSwxLjQ2QzMxOC4wNiwyMTIuOTQsMzIwLjYyLDIxOC4wOCwzMjAuNjIsMjI1Ljc5eiIvPgo8cmVjdCB4PSIxNjYuNTcxIiB5PSI2NC4wNTUiIHRyYW5zZm9ybT0ibWF0cml4KC0wLjk0MDUgMC4zMzk4IC0wLjMzOTggLTAuOTQwNSAzNzYuODgzMiAxMjcuMzEzOSkiIHN0eWxlPSJmaWxsOiNGRkY1Q0I7IiB3aWR0aD0iMjEuNDQ4IiBoZWlnaHQ9IjY1LjIiLz4KPHJlY3QgeD0iMjI2LjY5IiB5PSI2My4xNjYiIHRyYW5zZm9ybT0ibWF0cml4KC0wLjk2NSAtMC4yNjIyIDAuMjYyMiAtMC45NjUgNDQxLjQxMDYgMjUwLjQzMjEpIiBzdHlsZT0iZmlsbDojRkZFRDk3OyIgd2lkdGg9IjIxLjQ0OCIgaGVpZ2h0PSI2NS4xOTkiLz4KPHJlY3QgeD0iMTE3LjU3IiB5PSIxMDUuMDQ2IiB0cmFuc2Zvcm09Im1hdHJpeCgtMC41MDcgMC44NjIgLTAuODYyIC0wLjUwNyAzMTEuOTgzMyA5Ni44NDc0KSIgc3R5bGU9ImZpbGw6I0ZGRjVDQjsiIHdpZHRoPSIyMS40NDkiIGhlaWdodD0iNjUuMjAzIi8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" /> :
          <img className={'checkin-icon'} alt="in-valid hang" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGNpcmNsZSBzdHlsZT0iZmlsbDojMjczQjdBOyIgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiMxMjExNDk7IiBkPSJNMTU0LjcyMSwzNTUuODM3TDMwNS45OSw1MDcuMTA2YzEwMS4yODMtMjAuMDUxLDE4MS4wNjctOTkuODM3LDIwMS4xMTgtMjAxLjExOUwzNTcuMTM2LDE1Ni4wMTUgIEwxNTQuNzIxLDM1NS44Mzd6Ii8+CjxjaXJjbGUgc3R5bGU9ImZpbGw6I0ZGQzYxQjsiIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjE0Mi4yMjIiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0VBQTIyRjsiIGQ9Ik0zOTguMjIyLDI1NmMwLTc4LjU0Ni02My42NzQtMTQyLjIyMi0xNDIuMjIyLTE0Mi4yMjJ2Mjg0LjQ0NCAgQzMzNC41NDgsMzk4LjIyMiwzOTguMjIyLDMzNC41NDYsMzk4LjIyMiwyNTZ6Ii8+CjxjaXJjbGUgc3R5bGU9ImZpbGw6I0ZGRURCNTsiIGN4PSIxOTkuMTExIiBjeT0iMjI3LjU1NiIgcj0iMjguNDQ0Ii8+CjxjaXJjbGUgc3R5bGU9ImZpbGw6IzI3MjUyNTsiIGN4PSIxOTkuMTExIiBjeT0iMjI3LjU1NiIgcj0iMTQuMjIyIi8+CjxjaXJjbGUgc3R5bGU9ImZpbGw6I0ZGRURCNTsiIGN4PSIzMTIuODg5IiBjeT0iMjI3LjU1NiIgcj0iMjguNDQ0Ii8+CjxjaXJjbGUgc3R5bGU9ImZpbGw6IzI3MjUyNTsiIGN4PSIzMTIuODg5IiBjeT0iMjI3LjU1NiIgcj0iMTQuMjIyIi8+CjxwYXRoIHN0eWxlPSJmaWxsOiNDOTJGMDA7IiBkPSJNMzE4LjkxOSwzMzUuNDZjLTIuOTUzLDAtNS42ODUtMS45MS02LjU5Mi00Ljg4MmMtNy4wNTgtMjMuMTA0LTMwLjIyMi0zOS4yMzgtNTYuMzI5LTM5LjIzOCAgYy0yNi4xMDUsMC00OS4yNjgsMTYuMTM0LTU2LjMyOSwzOS4yMzhjLTEuMTE0LDMuNjQxLTQuOTY3LDUuNjkxLTguNjA5LDQuNTc5Yy0zLjY0My0xLjExNC01LjY5Mi00Ljk2OC00LjU3OS04LjYwOSAgYzguODE4LTI4Ljg1LDM3LjQwNS00OC45OTksNjkuNTE3LTQ4Ljk5OWMzMi4xMTYsMCw2MC43MDIsMjAuMTQ5LDY5LjUxNiw0OC45OTljMS4xMTQsMy42NDEtMC45MzgsNy40OTctNC41NzksOC42MDkgIEMzMjAuMjY1LDMzNS4zNjIsMzE5LjU4NiwzMzUuNDYsMzE4LjkxOSwzMzUuNDZ6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiM5MzAwMDA7IiBkPSJNMzI1LjUxNiwzMjYuNTQ3Yy04LjgxNi0yOC44NS0zNy40MDItNDguOTk5LTY5LjUxOC00OC45OTljLTAuMTkxLDAtMC4zODEsMC4wMS0wLjU3MiwwLjAxdjEzLjgwMiAgYzAuMTkxLTAuMDAyLDAuMzgxLTAuMDIyLDAuNTcyLTAuMDIyYzI2LjEwNywwLDQ5LjI2OSwxNi4xMzQsNTYuMzI5LDM5LjIzOGMwLjkwNywyLjk3MiwzLjYzOSw0Ljg4Miw2LjU5Miw0Ljg4MiAgYzAuNjY3LDAsMS4zNDUtMC4wOTgsMi4wMTctMC4zMDNDMzI0LjU3OSwzMzQuMDQzLDMyNi42MjgsMzMwLjE4OCwzMjUuNTE2LDMyNi41NDd6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />
        }
        </div>
      )
    });

    render() {
        return (
            <span>
            {this.props.id === 'scan' ?
            <div className='page-wrapper'>
              <h3>Hang Check In</h3>
              <hr />
              {this.state.validURL ? this.ValidQR() : '' }
              {!this.state.validURL ? this.ScanQR() : ''}
            </div> :
            <div className='page-wrapper'>
              <h3>Hang Check In</h3>
              <hr />
              {this.CheckIn()}
            </div>
            }
            </span>
        );
    }
}

export default CheckIn;
