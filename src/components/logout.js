import React, { Component } from 'react';
class Logout extends Component {
  componentDidMount = () => {
    setTimeout(() => {
      this.props.logout();
      console.log('Logged out?');
    }, 3000);
  }
  render() {
    return (
      <div className="page-wrapper nobkgd">
        <h4>Logging out...</h4>
        <div className="center page-spinner">
          <i className="fa fa-circle-o-notch fa-spin"></i>
        </div>
      </div>
    )
  }
}
export default Logout;
