import React from "react";
import firebase, {base} from './firebase.js';
import Moment from 'react-moment';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';

class HangChat extends React.Component {

  constructor() {
    super();
    this.state = {
      datetime: '',
      msg: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const chatRef = firebase.database().ref(`/hangs/${this.props.id}/chat/`);
    const msg = {
      msg: this.state.msg,
      username: this.props.username,
      userphoto: this.props.userphoto,
      timestamp: Date.now(),
    }
    chatRef.push(msg);
    this.setState({
      msg: '',
    });
  }

  componentDidMount() {
    base.syncState(`/hangs/${this.props.id}/chat/`, {
      context: this,
      state: 'chat',
      keepKeys: true,
      asArray: true
    });
  }

  render(){
      return (
        <div className="hang-chats">
          {this.state.chat ?
          <div className="hang-chat-wrapper">
          {this.state.chat.length > 0 ?
              <ul className="hang-chat">
              <span className="hang-chat-label">Details</span>
                  {Object.entries(this.state.chat).map((msg) => {
                    return(
                     <li className={msg[1].userphoto === this.props.userphoto ? 'hang-chat-item hang-chat-primary' : 'hang-chat-item' } key={msg[1].key}>
                       <span className="hang-msg-user">
                         <img src={msg[1].userphoto} alt={msg[1].user} />
                       </span>
                       <span className="hang-msg">
                         {msg[1].msg}
                         <Moment fromNow className={'time-elapsed'}>{msg[1].timestamp}</Moment>
                       </span>
                     </li>
                   )})}
              </ul>
          : ''}
          <MuiThemeProvider>
          <form onSubmit={this.handleSubmit}>
            <input type="hidden" name="username" />
            <div className="add-msg-wrapper">
              <TextField type="text" name="msg" placeholder="Send message to the crew..." value={this.state.msg} onChange={this.handleChange} />
            </div>
            <div className="add-msg-footer">
              <button className="btn fa fa-send"></button>
            </div>
          </form>
          </MuiThemeProvider>
          </div>
          : ''}
        </div>
      );
    }

}

export default HangChat;
