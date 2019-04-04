import React from "react";
import ReactDOM from 'react-dom';
import fsm from 'fuzzy-string-matching';
import Rate from 'rc-rate';
import { PopupboxManager,PopupboxContainer } from 'react-popupbox';

import Dollar from '../assets/dollar.svg';

class Zcard extends React.Component {

  constructor() {
    super();
    this.state = {
      placeimg: ''
    }
    this.getPlace = this.getPlace.bind(this);
    this.placeCallback = this.placeCallback.bind(this);
  }

  placeCallback = (results, status) => {
    const { item } = this.props;
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      let result;
      results.map(function(obj){
          let fuzzy = fsm(obj.name, item.name);
          if (fuzzy > 0.015) result = obj;
          return null;
      });
      if(result){
        if(result.photos && result.photos.length > 0){
          var placePhotoUrl = result.photos[0].getUrl({maxWidth:320});
          this.setState({placeimg: placePhotoUrl});
        }
      }
    }
  }

  getPlace = (lat,lng) => {
    let maploc = new window.google.maps.LatLng(lat,lng);
    let mapdom = ReactDOM.findDOMNode(this.refs.map);
    let map = new window.google.maps.Map(mapdom, {
        center: maploc,
        zoom: 20
      });
    let service = new window.google.maps.places.PlacesService(map);
    let request = {
      location: maploc,
      radius: '500',
      name: this.props.item.name
    };
    service.nearbySearch(request, this.placeCallback);
  }

  openPopupbox = () => {
      const { item } = this.props;
      const content = <img url="static/demo.jpg" />
      PopupboxManager.open({
        content,
        config: {
          titleBar: {
            enable: true,
            text: ''+item.name+''
          },
          fadeIn: true,
          fadeInSpeed: 500
        }
      })
    }


  componentDidMount(){
    const { item, nth } = this.props;
    let time = 0;
    if(nth < 5){
      time = 3000+(nth*50);
    }else{
      time = 6000+(nth*50);
    }
    setTimeout(() => {
      this.getPlace(item.location.latitude,item.location.longitude);
    },time);
  }

  render() {
    const { item } = this.props;

    var Image = {
      backgroundImage: "url('"+this.state.placeimg+"')",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      overflow: "hidden",
      height: "144px",
      borderRadius: "0.5rem",
      cursor: "pointer"
    }

    var Price = [];
    var i;
    for(i = 0; i < item.price_range; i++){
        Price.push(<img key={'dollar-'+i} src={Dollar} />);
    }

    const popupboxConfig = {
       titleBar: {
         enable: true,
         text: 'Popupbox Demo'
       },
       fadeIn: true,
       fadeInSpeed: 500
    }

    let rating = 0;
    rating = item.user_rating.aggregate_rating;
    rating = parseInt(rating);

    return (
      <div style={Image} onClick={this.openPopupbox}>
        <div id="map" ref={'map'} />
          <div className="content">
            <h4>{item.name}</h4>
            {rating > 0 && rating &&
              <div>
                <Rate value={rating} allowHalf={true} />
              </div>
            }
            {item.price_range &&
            <div>
              {Price}
            </div>
            }
          </div>
        {this.state.placeimg && <span></span>}
      </div>
    );
  }
}

export default Zcard;
