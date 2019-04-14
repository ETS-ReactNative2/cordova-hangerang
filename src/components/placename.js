import React from "react";
import { Places } from 'google-places-web';

Places.apiKey = 'AIzaSyCLpF3Kgl5ILBSREQ2-v_WNxBTuLi1FxXY';
Places.debug = false;

class GooglePlaceName extends React.Component {

  constructor() {
    super();
    this.state = {
      name: '',
    }
  }

  getPlaceDetails(id){
      Places.details({ placeid: id }).then((result) => { this.setState({ name: result.name }) }).catch(e => console.log(e.message));
  }

  render() {
    return (
      <span className="placename">
        {//this.getPlaceDetails(this.props.placeid)}
        {this.state.name}
      </span>
    )
  }

}

export default GooglePlaceName;
