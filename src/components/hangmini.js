import React from "react";
import firebase from './firebase.js';
import Moment from 'react-moment';
import HangLink from './hanglink.js';

var hangHeader = {
  position: "relative",
  backgroundColor: "#ec008c",
  margin: "0",
  color: "#fff",
  fontWeight: "300",
  padding: "1rem 5rem 1rem 1rem",
  cursor: "pointer",
  fontFamily: "'Poppins', sans-serif",
  boxSizing: "border-box",
  borderTopLeftRadius: "0.5rem",
  borderTopRightRadius: "0.5rem",
}

var hangHeaderTitle = {
  fontSize: "1.25rem",
  fontWeight: "600",
  lineHeight: "1",
  marginBottom: "0",
  textTransform: "capitalize",
  fontFamily: "'Poppins', sans-serif",
}

var hangDate = {
  background: "#000",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  top: "0",
  right: "0",
  height: "100%",
  padding: "0 1rem",
  textTransform: "uppercase",
  textAlign: "center",
  borderCollapse: "collapse",
  borderTopRightRadius: "0.5rem",
}


var hangMonth = {
  fontSize: "0.75rem",
  lineHeight: "1",
  paddingBottom: "0.33rem",
  display: "block",
}

var hangYear = {
  fontSize: "0.75rem",
  lineHeight: "0",
}

var hangDay = {
  fontFamily: "Josefin Sans, sans-serif",
  fontWeight: "bold",
  fontSize: "1.6rem",
  lineHeight: "0",
}

class HangMini extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hang: {},
    }
  }

  componentDidMount = (result) => {
    const hangRef = firebase.database().ref(`/hangs/${this.props.hang}`);
    hangRef.once('value', (snapshot) => {
       let hang = snapshot.val();
       if(hang){
         this.setState({ hang });
       }else{
         console.log(this.props.hang);
       }
       return;
     });
  }

  render() {

    var hangLink = '/hang/'+this.state.hang.hash;

    if(this.state.hang){

    let Hang =
      <span>
        <HangLink to={hangLink} text={
        <span ref="detail">
        <table width="100%" style={hangHeader} className={'hang-header'}>
          <tbody>
          <tr>
            <td>
              <h2 style={hangHeaderTitle}>{this.state.hang.title}</h2>
              <div className="hang-placetime">
                <Moment format="hh:mm a" className="hang-time">{this.state.hang.datetime}</Moment> @ {this.state.hang.placename}
              </div>
              <hr />
              <div className="small">
              <b>Host:</b> {this.state.hang.user}
              </div>
            </td>
            <td>
              <table style={hangDate}>
                <tbody>
                <tr>
                  <td>
                <Moment format="MMM" className="hang-month" style={hangMonth}>{this.state.hang.datetime}</Moment>
                  </td>
                </tr>
                <tr>
                  <td>
                <Moment format="DD" className="hang-day" style={hangDay}>{this.state.hang.datetime}</Moment>
                  </td>
                </tr>
                <tr>
                  <td>
                <Moment format="YYYY" className="hang-year" style={hangYear}>{this.state.hang.datetime}</Moment>
                  </td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
          </tbody>
        </table>
        </span>
        } />
      </span>;

    let HangMini = <div className={'hang-item show'} key={this.state.hang.key}>{Hang}</div>;
    return HangMini;

    }
  }
}

export default HangMini;
