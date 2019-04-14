import React, { Component } from 'react';
import axios from 'axios';
import querystring from 'querystring';
import ReactPhoneInput from 'react-phone-input-2';
import { Route } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import Checkbox, { enhancedSwitch } from 'material-ui/Checkbox';
import firebase from './firebase.js';

class AddPhone extends Component {
 state = {
   code: '',
   phone: '',
   error: null,
   confResult: '',
   showConfirm: false,
   isConfirmed: false,
   optin: true,
 };
handleChange = (e) => {
  this.setState({
    [e.target.name]: e.target.checked
  });
 };
handleOnChange = (value) => {
  this.setState({
     phone: value
  });
}
handleInputChange = (event) => {
   this.setState({ [event.target.name]: event.target.value });
 };
handleConfSubmit = (event) => {
 const { code, confResult } = this.state;
  event.preventDefault();
  let credential = new firebase.auth.PhoneAuthProvider.credential(confResult.verificationId, code);
  firebase.auth().currentUser.linkAndRetrieveDataWithCredential(credential).then((usercred) => {
    var user = usercred.user;
    console.log("Account linking success", user);
    this.setState({isConfirmed: true});

    const usersRef = firebase.database().ref('members');
    usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
      if (snapshot.exists()) {
        let key = Object.keys(snapshot.val())[0];
        let member = snapshot.val();
        const memberRef = firebase.database().ref(`/members/${key}`);
        const update = {
          tel: this.state.phone,
          optin: this.state.optin
        };

        memberRef.update(update);

        if(this.state.optin){

          member = member[key];
          let membername = [];
          let email = '';
          let phone = '';

          console.log(member);

          membername = member.name.split(" ");
          email = member.email;
          phone = this.state.phone;

          //Add to Simpletexting via API

          let data = {
            token: "ee15e353b2c02d97dc8b91680010b5e3",
            group: "hangerang",
            firstName: membername[0],
            lastName: membername[1],
            email: email,
            phone: phone,
          };

          let axiosConfig = {
            headers: {
                'X-Requested-With':'XMLHttpRequest'
            }
          };

          axios.get(
            'https://cors-anywhere.herokuapp.com/https://app2.simpletexting.com/v1/group/contact/add/',
            { params: data },
            axiosConfig)
            .then((res) => {
              console.log("RESPONSE RECEIVED: ", res);
            })
            .catch((err) => {
              console.log("AXIOS ERROR: ", err);
          });

        }

      }
    });

  }, function(error) {
    console.log("Account linking error", error);
  });
};
handleInitSubmit = (event) => {
   event.preventDefault();
   firebase.auth().useDeviceLanguage();
   let appVerifier = window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(this.recaptcha, {
     'size': 'invisible',
     'callback': function(confResult) {
       this.setState({confResult});
     }
   });
   firebase.auth().signInWithPhoneNumber(this.state.phone, appVerifier)
    .then((confResult) => {
      this.setState({confResult, showConfirm: true});
    }).catch(function (error) {
      console.log(error);
      // Error; SMS not sent
      // ...
    });
 };
 toggleOptin() {
   this.setState({optin: !this.state.optin})
 }
 render() {
   const { isConfirmed, error, phone, showConfirm } = this.state;
     return (
       <div className="page-wrapper addphone">
         <h3>Let's Connect a Phone Number</h3>
           {error ? (
             <div>
               <span className="red">{error.message}</span>
             </div>
           ) : null}
           {!showConfirm && !isConfirmed &&
           <form onSubmit={this.handleInitSubmit}>
             <MuiThemeProvider>
              <Checkbox
               className={'input-checkbox'}
               name="optin"
               labelPosition="left"
               label="Recieve Text Alerts on Your Phone?"
               checked={this.state.optin}
               onCheck={this.handleChange}
               value="optin"
              />
              </ MuiThemeProvider>
              <ReactPhoneInput
              defaultCountry={'us'}
              onChange={this.handleOnChange}
              value={phone}
              />
             <button className="btn">Send Confirmation Code</button>
           </form>}
           {showConfirm && !isConfirmed &&
           <MuiThemeProvider>
           <form onSubmit={this.handleConfSubmit}>
             <TextField
               type="text"
               name="code"
               placeholder="Verification Code"
               value={this.state.code}
               onChange={this.handleInputChange}
             />
             <button className="btn">Confirm</button>
           </form>
           </MuiThemeProvider>
           }
           {isConfirmed &&
             <div>
               <div>
                Phone number added! Great job!
               </div>
               <div>
                <img alt="Good Job!" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSItMiAxIDUxMSA1MTEuOTk5OTkiIHdpZHRoPSI1MTJweCI+PHBhdGggZD0ibTUwNi43NDIxODggMjYyLjE3NTc4MWMwIDEyNy4xNDg0MzgtMTAzLjA3NDIxOSAyMzAuMjE4NzUtMjMwLjIyMjY1NyAyMzAuMjE4NzUtMTI3LjE0NDUzMSAwLTIzMC4yMTg3NS0xMDMuMDcwMzEyLTIzMC4yMTg3NS0yMzAuMjE4NzUgMC0xMjcuMTQ4NDM3IDEwMy4wNzQyMTktMjMwLjIxODc1IDIzMC4yMTg3NS0yMzAuMjE4NzUgMTI3LjE0ODQzOCAwIDIzMC4yMjI2NTcgMTAzLjA3MDMxMyAyMzAuMjIyNjU3IDIzMC4yMTg3NXptMCAwIiBmaWxsPSIjZmZlOTY3Ii8+PHBhdGggZD0ibTg3LjUwNzgxMiAyNjIuMTc1NzgxYzAtMTIwLjIwMzEyNSA5Mi4xMjUtMjE4Ljg2NzE4NyAyMDkuNjE3MTg4LTIyOS4yOTI5NjktNi43ODkwNjItLjYwMTU2Mi0xMy42NjAxNTYtLjkyNTc4MS0yMC42MDU0NjktLjkyNTc4MS0xMjcuMTQ0NTMxIDAtMjMwLjIxODc1IDEwMy4wNzAzMTMtMjMwLjIxODc1IDIzMC4yMTg3NSAwIDEyNy4xNDg0MzggMTAzLjA3NDIxOSAyMzAuMjE4NzUgMjMwLjIxODc1IDIzMC4yMTg3NSA2Ljk0NTMxMyAwIDEzLjgxNjQwNy0uMzI0MjE5IDIwLjYwNTQ2OS0uOTI1NzgxLTExNy40OTIxODgtMTAuNDIxODc1LTIwOS42MTcxODgtMTA5LjA4OTg0NC0yMDkuNjE3MTg4LTIyOS4yOTI5Njl6bTAgMCIgZmlsbD0iI2ZmYjQ0ZiIvPjxwYXRoIGQ9Im00MDAuMDc4MTI1IDM5MS44NjMyODFjLTE1LjQ5MjE4NyAwLTI4LjA1MDc4MSAxMi41NTg1OTQtMjguMDUwNzgxIDI4LjA1MDc4MXYxOS43MDMxMjZoNDAuMjEwOTM3di0zNS41ODk4NDRjMC02LjcxODc1LTUuNDQ1MzEyLTEyLjE2NDA2My0xMi4xNjAxNTYtMTIuMTY0MDYzem0wIDAiIGZpbGw9IiNmZjljNDMiLz48cGF0aCBkPSJtMTUyLjk2MDkzOCAzOTEuODYzMjgxYzE1LjQ5MjE4NyAwIDI4LjA1MDc4MSAxMi41NTg1OTQgMjguMDUwNzgxIDI4LjA1MDc4MXYxOS43MDMxMjZoLTQwLjIxMDkzOHYtMzUuNTg5ODQ0YzAtNi43MTg3NSA1LjQ0NTMxMy0xMi4xNjQwNjMgMTIuMTYwMTU3LTEyLjE2NDA2M3ptMCAwIiBmaWxsPSIjZmY5YzQzIi8+PHBhdGggZD0ibTQyNi44MTY0MDYgNDY2LjI1NzgxMmMwIDI1LjI2MTcxOS0yMC40ODA0NjggNDUuNzQyMTg4LTQ1Ljc0MjE4NyA0NS43NDIxODhzLTQ1Ljc0MjE4OC0yMC40ODA0NjktNDUuNzQyMTg4LTQ1Ljc0MjE4OGMwLTI1LjI2MTcxOCAyMC40ODA0NjktNDUuNzQyMTg3IDQ1Ljc0MjE4OC00NS43NDIxODdzNDUuNzQyMTg3IDIwLjQ4MDQ2OSA0NS43NDIxODcgNDUuNzQyMTg3em0wIDAiIGZpbGw9IiNmZmI0NGYiLz48cGF0aCBkPSJtMjE3LjcwNzAzMSA0NjYuMjU3ODEyYzAgMjUuMjYxNzE5LTIwLjQ3NjU2MiA0NS43NDIxODgtNDUuNzQyMTg3IDQ1Ljc0MjE4OC0yNS4yNjE3MTkgMC00NS43NDIxODgtMjAuNDgwNDY5LTQ1Ljc0MjE4OC00NS43NDIxODggMC0yNS4yNjE3MTggMjAuNDgwNDY5LTQ1Ljc0MjE4NyA0NS43NDIxODgtNDUuNzQyMTg3IDI1LjI2NTYyNSAwIDQ1Ljc0MjE4NyAyMC40ODA0NjkgNDUuNzQyMTg3IDQ1Ljc0MjE4N3ptMCAwIiBmaWxsPSIjZmZiNDRmIi8+PHBhdGggZD0ibTM3OC42MTMyODEgMjkxLjc3MzQzOGMtNC4yNjU2MjUgMC03LjcyNjU2Mi0zLjQ2MDkzOC03LjcyNjU2Mi03LjcyNjU2M3YtMTguNjI4OTA2YzAtNC4yNjk1MzEgMy40NjA5MzctNy43MjY1NjMgNy43MjY1NjItNy43MjY1NjMgNC4yNjk1MzEgMCA3LjcyNjU2MyAzLjQ1NzAzMiA3LjcyNjU2MyA3LjcyNjU2M3YxOC42Mjg5MDZjMCA0LjI2NTYyNS0zLjQ1NzAzMiA3LjcyNjU2My03LjcyNjU2MyA3LjcyNjU2M3ptMCAwIiBmaWxsPSIjMmQzYzUwIi8+PHBhdGggZD0ibTM5Mi4xMzI4MTIgMzIwLjk0OTIxOWgtMjcuMDM5MDYyYy00LjI2NTYyNSAwLTcuNzIyNjU2LTMuNDU3MDMxLTcuNzIyNjU2LTcuNzI2NTYzIDAtNC4yNjU2MjUgMy40NTcwMzEtNy43MjY1NjIgNy43MjI2NTYtNy43MjY1NjJoMjcuMDM5MDYyYzQuMjY5NTMyIDAgNy43MjY1NjMgMy40NjA5MzcgNy43MjY1NjMgNy43MjY1NjIgMCA0LjI2OTUzMi0zLjQ2MDkzNyA3LjcyNjU2My03LjcyNjU2MyA3LjcyNjU2M3ptMCAwIiBmaWxsPSIjZmY4ODkyIi8+PHBhdGggZD0ibTE3NC40MjU3ODEgMjkxLjc3MzQzOGMtNC4yNjU2MjUgMC03LjcyNjU2Mi0zLjQ2MDkzOC03LjcyNjU2Mi03LjcyNjU2M3YtMTguNjI4OTA2YzAtNC4yNjk1MzEgMy40NjA5MzctNy43MjY1NjMgNy43MjY1NjItNy43MjY1NjMgNC4yNjk1MzEgMCA3LjcyNjU2MyAzLjQ1NzAzMiA3LjcyNjU2MyA3LjcyNjU2M3YxOC42Mjg5MDZjMCA0LjI2NTYyNS0zLjQ1NzAzMiA3LjcyNjU2My03LjcyNjU2MyA3LjcyNjU2M3ptMCAwIiBmaWxsPSIjMmQzYzUwIi8+PHBhdGggZD0ibTE4Ny45NDUzMTIgMzIwLjk0OTIxOWgtMjcuMDM1MTU2Yy00LjI2OTUzMSAwLTcuNzI2NTYyLTMuNDU3MDMxLTcuNzI2NTYyLTcuNzI2NTYzIDAtNC4yNjU2MjUgMy40NTcwMzEtNy43MjY1NjIgNy43MjY1NjItNy43MjY1NjJoMjcuMDM1MTU2YzQuMjY5NTMyIDAgNy43MjY1NjMgMy40NjA5MzcgNy43MjY1NjMgNy43MjY1NjIgMCA0LjI2OTUzMi0zLjQ2MDkzNyA3LjcyNjU2My03LjcyNjU2MyA3LjcyNjU2M3ptMCAwIiBmaWxsPSIjZmY4ODkyIi8+PHBhdGggZD0ibTI3Ni41MTk1MzEgMzE5LjgyODEyNWMtOS4zNDc2NTYgMC0xOC4xMjEwOTMtMy45MDYyNS0yNC4wNzgxMjUtMTAuNzE4NzUtMi44MDg1OTQtMy4yMTQ4NDQtMi40ODA0NjgtOC4wOTM3NS43MzQzNzUtMTAuOTAyMzQ0IDMuMjE0ODQ0LTIuODA4NTkzIDguMDkzNzUtMi40ODA0NjkgMTAuOTAyMzQ0LjczMDQ2OSAzLjAxOTUzMSAzLjQ1NzAzMSA3LjU1NDY4NyA1LjQzNzUgMTIuNDQxNDA2IDUuNDM3NXM5LjQyMTg3NS0xLjk4MDQ2OSAxMi40NDE0MDctNS40Mzc1YzIuODEyNS0zLjIxNDg0NCA3LjY5MTQwNi0zLjUzOTA2MiAxMC45MDIzNDMtLjczMDQ2OSAzLjIxNDg0NCAyLjgwODU5NCAzLjU0Mjk2OSA3LjY4NzUuNzM0Mzc1IDEwLjkwMjM0NC01Ljk1NzAzMSA2LjgxMjUtMTQuNzMwNDY4IDEwLjcxODc1LTI0LjA3ODEyNSAxMC43MTg3NXptMCAwIiBmaWxsPSIjMmQzYzUwIi8+PGcgZmlsbD0iI2ZmZTk2NyI+PHBhdGggZD0ibTk5LjQxMDE1NiA1Ni4wMTU2MjVjLTIuNzYxNzE4IDEzLjA5Mzc1LTEyLjIyMjY1NiAyMi43NDYwOTQtMjUuNjM2NzE4IDI1LjUyMzQzNy00LjY3OTY4OC45Njg3NS04LjAxOTUzMiA1LjExNzE4OC04LjAxOTUzMiAxMHYuNTM5MDYzYzAgNC43OTY4NzUgMy4zNjcxODggOC45Mjk2ODcgOC4wNjI1IDkuOTA2MjUgMTMuMzg2NzE5IDIuNzg1MTU2IDIyLjgzMjAzMiAxMi40MjU3ODEgMjUuNTg5ODQ0IDI1LjUuOTkyMTg4IDQuNzAzMTI1IDQuOTg4MjgxIDguMTY0MDYzIDkuOTE3OTY5IDguMTY0MDYzaC42NDA2MjVjNC43ODEyNSAwIDguOTI5Njg3LTMuMzM5ODQ0IDkuODk4NDM3LTguMDE5NTMyIDIuNzczNDM4LTEzLjQxMDE1NiAxMi40MjE4NzUtMjIuODcxMDk0IDI1LjUxMTcxOS0yNS42MzY3MTggNC42OTkyMTktLjk5MjE4OCA4LjE2MDE1Ni00Ljk4NDM3NiA4LjE2MDE1Ni05Ljc4OTA2M3YtLjg5MDYyNWMwLTQuODA4NTk0LTMuNDYwOTM3LTguODAwNzgxLTguMTYwMTU2LTkuNzkyOTY5LTEzLjA4OTg0NC0yLjc2MTcxOS0yMi43MzgyODEtMTIuMjIyNjU2LTI1LjUxMTcxOS0yNS42MzI4MTItLjk2ODc1LTQuNjc5Njg4LTUuMTIxMDkzLTguMDE5NTMxLTEwLjAyMzQzNy04LjAxOTUzMWgtLjY0MDYyNWMtNC44MDA3ODEgMC04LjgwMDc4MSAzLjQ0OTIxOC05Ljc4OTA2MyA4LjE0ODQzN3ptMCAwIi8+PHBhdGggZD0ibTI0LjYxMzI4MSA1LjgzOTg0NGMtMS45ODA0NjkgOS4zODI4MTItOC43NTc4MTIgMTYuMjk2ODc1LTE4LjM2NzE4NyAxOC4yODUxNTYtMy4zNTU0NjkuNjkxNDA2LTUuNzQ2MDk0IDMuNjY3OTY5LTUuNzQ2MDk0IDcuMTY0MDYydi4zODY3MTljMCAzLjQzNzUgMi40MTQwNjIgNi4zOTg0MzggNS43NzczNDQgNy4wOTc2NTcgOS41ODk4NDQgMS45OTYwOTMgMTYuMzU1NDY4IDguOTA2MjUgMTguMzM1OTM3IDE4LjI3MzQzNy43MDcwMzEgMy4zNjcxODcgMy41NzAzMTMgNS44NDM3NSA3LjEwMTU2MyA1Ljg0Mzc1aC40NjA5MzdjMy40MjU3ODEgMCA2LjM5ODQzOC0yLjM5MDYyNSA3LjA5Mzc1LTUuNzQyMTg3IDEuOTg0Mzc1LTkuNjA5Mzc2IDguODk4NDM4LTE2LjM4NjcxOSAxOC4yNzczNDQtMTguMzY3MTg4IDMuMzY3MTg3LS43MTA5MzggNS44NDM3NS0zLjU3NDIxOSA1Ljg0Mzc1LTcuMDE1NjI1di0uNjM2NzE5YzAtMy40NDUzMTItMi40NzY1NjMtNi4zMDQ2ODctNS44NDM3NS03LjAxNTYyNS05LjM3ODkwNi0xLjk4MDQ2OS0xNi4yOTI5NjktOC43NTc4MTItMTguMjc3MzQ0LTE4LjM2NzE4Ny0uNjk1MzEyLTMuMzU1NDY5LTMuNjcxODc1LTUuNzQ2MDk0LTcuMTgzNTkzLTUuNzQ2MDk0aC0uNDYwOTM4Yy0zLjQ0MTQwNiAwLTYuMzA0Njg4IDIuNDcyNjU2LTcuMDExNzE5IDUuODM5ODQ0em0wIDAiLz48L2c+PC9zdmc+Cg==" />
               </div>
               <div>
               {!this.props.setStep ? <Route render={({history}) => (
                <button
                  className="btn"
                  onClick={() => {history.push(`/profile/${this.props.uid}`) }}>
                  View Profile
                </button>
                )}/> :
                <button
                  className="btn"
                  onClick={() => {this.props.setStep(5)}}>
                  Continue
                </button>
                }
                </div>
             </div>
           }
           <div className="hide" ref={(ref)=>this.recaptcha=ref}></div>
       </div>
   );
 }
}
export default AddPhone;
