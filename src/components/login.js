import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import firebase from './firebase.js';
class Login extends Component {
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
     .signInWithEmailAndPassword(email, password)
     .then((user) => {
       this.props.history.push('/');
       const usersRef = firebase.database().ref('members');
       usersRef.orderByChild("uid").equalTo(user.uid).once('value', (snapshot) => {
         if (snapshot.exists()) {
           console.log('user exists');
           var user = snapshot.val();
           this.props.setUserName(user.name);
           return;
         }
       });
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
           Login</button>
         </form>
         <div>
          <a className='underline' onClick={() => {this.props.toggleReg();this.props.toggleLogin();}}>New here?</a>
         </div>
         <i className="fa fa-window-close close" onClick={() => {this.props.toggleLogin()}}></i>
       </MuiThemeProvider>
     </div>
   );
 }
}
export default Login;
