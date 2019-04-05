import React from "react";
import ReactDOM from 'react-dom';
import geolib from 'geolib';
import fsm from 'fuzzy-string-matching';
import Rate from 'rc-rate';
import { PopupboxManager,PopupboxContainer } from 'react-popupbox';

import Dollar from '../assets/dollar.svg';

class Zcard extends React.Component {

  constructor() {
    super();
    this.state = {
      placeimg: '',
      distance: 0,
      open: false,
      location: {}
    }
    this.getPlace = this.getPlace.bind(this);
    this.placeCallback = this.placeCallback.bind(this);
    this.startHang = this.startHang.bind(this);
  }

  startHang = () => {
    setTimeout(() => {
      this.props.toggleForm();
      this.props.setLocation(this.state.location);
      this.props.setName(this.props.item.name);
    },500);
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
          if(result.opening_hours){
            this.setState({open: result.opening_hours.open_now});
          }
          this.setState({location: {
            formatted_address: result.vicinity,
            place_id: result.place_id,
            geometry: result.geometry,
          }});
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
    var Price = [];
    var i;
    for(i = 0; i < item.price_range; i++){
        Price.push(<img key={'dollar-'+i} src={Dollar} />);
    }
    let rating = 0;
    rating = item.user_rating.aggregate_rating;
    rating = parseInt(rating);
    var Image = {
      backgroundImage: "url('"+this.state.placeimg+"')",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      overflow: "hidden",
      cursor: "pointer",
      height: "144px",
    }
    const content = (
      <div className={'card-popup'}>
        <i className={'fa fa-times'}
        onClick={()=>{PopupboxManager.close();}}>
        </i>
        {this.state.placeimg &&
        <div style={Image} className={'card-popup-header'}></div>}
        <div className={'card-popup-content'}>
          <h5>{item.name}</h5>
          <div>{item.cuisines}</div>
          <div className="small">{this.state.distance}mi</div>
          <div className={this.state.open ? "small open-status green" : "small open-status red"}>
            {this.state.open ? 'Open Now' : 'Not Open Now'}
          </div>
          {rating > 0 && rating &&
            <div>
              <Rate value={rating} allowHalf={true} />
            </div>
          }
          {item.price_range &&
            <div className="price">
              {Price}
            </div>
          }
        </div>
        <div
          className={'card-popup-bottom'}
          onClick={()=>{this.startHang(); PopupboxManager.close();}}
        >
          <div className={'card-popup-makehang'}>
            Make A Hang Here
          </div>
        </div>
      </div>
    )
    PopupboxManager.open({ content });
  }

  componentDidMount = () => {
    const { item, nth } = this.props;
    let time = 0;
    time = 1000+(nth*500);
    setTimeout(() => {
      this.getPlace(item.location.latitude,item.location.longitude);
    },time);
    let distance = geolib.getDistance(
      {latitude: this.props.lat, longitude: this.props.lng},
      {latitude: item.location.latitude, longitude: item.location.longitude}
    );
    distance = (distance/1000) * 0.621371;
    distance = distance.toFixed(1);
    this.setState({distance});
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

    let rating = 0;
    rating = item.user_rating.aggregate_rating;
    rating = parseInt(rating);

    return (
      <div>
        <div style={Image} onClick={this.openPopupbox}>
          <div id="map" ref={'map'} />
            <div className="content">
              <h4>{item.name}</h4>
              <div className="small">{this.state.distance}mi</div>
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
      </div>
    );
  }
}

export default Zcard;
