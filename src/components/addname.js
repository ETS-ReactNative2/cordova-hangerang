import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import firebase from './firebase.js';

class AddName extends Component {
 state = {
   name: '',
   error: null,
 };
handleInputChange = (event) => {
   this.setState({ [event.target.name]: event.target.value });
 };
handleSubmit = (event) => {
   event.preventDefault();
   const usersRef = firebase.database().ref('members');
   usersRef.orderByChild("uid").equalTo(this.props.user.uid).once('value', (snapshot) => {
     if (snapshot.exists()) {
       var user = snapshot.val();
       let key = Object.keys(user)[0];
       const memberRef = firebase.database().ref(`/members/${key}`);
       memberRef.update({name: this.state.name});
       this.props.setUserName(this.state.name);
       console.log('Rad! Name added!');
       return;
     }
   });
 };
 render() {
   const { error } = this.state;
     return (
       <div className="page-wrapper AddName">
         <h3>What's your name, friend?</h3>
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
                 name="name"
                 placeholder="Name"
                 value={this.state.name}
                 onChange={this.handleInputChange}
               />
             </div>
             <button className="btn login">Save</button>
           </form>
         </MuiThemeProvider>
       </div>
   );
 }
}
export default AddName;
