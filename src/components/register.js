import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import firebase from './firebase.js';

//Actions
import { getPoints } from '../helpers/points.js';

class Register extends Component {
 state = {
   email: '',
   password: '',
   error: null,
 };
handleInputChange = (event) => {
   this.setState({ [event.target.name]: event.target.value });
 };
handleSubmit = (event) => {
   event.preventDefault();
   const { email, password } = this.state;
firebase
     .auth()
     .createUserWithEmailAndPassword(email, password)
     .then((user) => {
       const usersRef = firebase.database().ref('members');
       usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
         if (snapshot.exists()) {
           console.log('user already exists');
           return;
         }else{
           this.setState({usernew: true});
           let points = getPoints("newuser");
           usersRef.push({
             email: user.email,
             uid: user.uid,
             points:[ points ]
           });
           console.log('user created in database');
           return;
         }
       });
       this.props.history.push('/');
     })
     .catch((error) => {
       this.setState({ error: error });
     });
 };
 render() {
   const { email, password, error } = this.state;
   return (
     <div className="page-wrapper register">
       <MuiThemeProvider>
         {error ? (
           <div>
             <span className="red">{error.message}</span>
           </div>
         ) : null}
         <form onSubmit={this.handleSubmit}>
          <div className="add-hang-wrapper">
             <TextField
               type="text"
               name="email"
               placeholder="Email"
               value={email}
               onChange={this.handleInputChange}
             />
             <TextField
               type="password"
               name="password"
               placeholder="Password"
               value={password}
               onChange={this.handleInputChange}
             />
           </div>
           <button className="btn login">
           Register</button>
         </form>
         <span className='small'>
          Already registered? <a className='small underline' onClick={() => {this.props.toggleReg();this.props.toggleLogin();}}>Sign In.</a>
         </span>
         <i className="fa fa-window-close close" onClick={() => {this.props.toggleReg()}}></i>
       </MuiThemeProvider>
     </div>
   );
 }
}
export default Register;
