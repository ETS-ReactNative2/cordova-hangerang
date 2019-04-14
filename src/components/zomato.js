import React from "react";
import Zomato from 'zomato.js';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Zcard from './zomcard.js';

class ZZomato extends React.Component {

  constructor() {
    super();
    this.state = {
      show: false,
      result: {},
      mode: 'food',
      modeTitle: '',
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
  }

  setMode = (str) => {
    this.setState({show: false, mode: str});
    this.getListings();
  }

  foodQuery = () => {
    this.setState({modeTitle: 'Places to Eat'});
    this.setState({hangTitle: 'Eat Food'});
    const { lat,lng } = this.props;
    const z = new Zomato('6836545ad5ff91d9a8795ff1d18b7b9c');
    //const z = new Zomato('2c2925ab93a6f8d9b1f4d1a31dfaec54');
    //const z = new Zomato('d1d9c6b0c649fa8b0f4d18ac235db4b5');
    z.geocode({
      lat: ''+lat+'',
      lon: ''+lng+''
    })
    .then((res) => {
      if(res){
        if(res && Object.entries(res.nearby_restaurants).length > 0){
          this.setState({result: res.nearby_restaurants});
          return;
        }
      }
    })
    .catch(function(err) {
      console.error(err);
    });
  }

  coffeeQuery = () => {
    this.setState({modeTitle: 'Coffee, Tea and More'});
    this.setState({hangTitle: 'Get Caffeinated'});
    const { lat,lng } = this.props;
    const z = new Zomato('6836545ad5ff91d9a8795ff1d18b7b9c');
    //const z = new Zomato('d1d9c6b0c649fa8b0f4d18ac235db4b5');
    z.search({
      count: '10',
      cuisines: '161',
      lat: ''+lat+'',
      lon: ''+lng+'',
      radius: '3000',
      sort: 'real_distance',
    })
    .then((res) => {
      if(res){
        if(res && Object.entries(res.restaurants).length > 0){
          this.setState({result: res.restaurants});
          return;
        }
      }
    })
    .catch(function(err) {
      console.error(err);
    });
  }

  drinkQuery = () => {
    this.setState({modeTitle: 'Breweries'});
    this.setState({hangTitle: 'Grab a Drink'});
    const { lat,lng } = this.props;
    const z = new Zomato('6836545ad5ff91d9a8795ff1d18b7b9c');
    //const z = new Zomato('d1d9c6b0c649fa8b0f4d18ac235db4b5');
    z.search({
      count: '10',
      establishment_type: '161',
      lat: ''+lat+'',
      lon: ''+lng+'',
      radius: '1500',
      sort: 'real_distance',
    })
    .then((res) => {
      if(res){
        if(res && Object.entries(res.restaurants).length > 0){
          this.setState({result: res.restaurants});
          return;
        }
      }
    })
    .catch(function(err) {
      console.error(err);
    });
  }

  getListings = () => {
    setTimeout(() => {
      if(this.state.mode === 'food'){
        this.foodQuery();
      }
      if(this.state.mode === 'coffee'){
        this.coffeeQuery();
      }
      if(this.state.mode === 'drinks'){
        this.drinkQuery();
      }
      this.setState({show: true});
    },1000);
  }

  componentDidMount = () => {
    this.getListings();
  }

  render() {
    const { mode, modeTitle, result, show } = this.state;
    var settings = {
      infinite: false,
      slidesToShow: 5,
      slidesToScroll: 5,
      arrows: true,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            infinite: false,
            arrows: false,
            slidesToShow: 5,
            slidesToScroll: 5,
          }
        },
        {
          breakpoint: 480,
          settings: {
            infinite: false,
            arrows: false,
            slidesToShow: 3,
            slidesToScroll: 3,
          }
        }
      ]
    };

    let items = Object.entries(result).slice(0,8);

    let Results = items.map((item, i) => {
      if(item[1].restaurant){
        item = item[1].restaurant;
      }else{
        item = item[1];
      }
      return (
        <Zcard
         lat={this.props.lat}
         lng={this.props.lng}
         key={'zom-card'+item.id+'-'+i}
         item={item}
         nth={i}
         toggleForm={this.props.toggleForm}
         setLocation={this.props.setLocation}
         setName={this.props.setName}
         setTitle={this.props.setTitle}
        />
      )
    });

    return (
      <div>
        <div className="section-header">
          <h4>{modeTitle}</h4>
          <div className="menu">
            <i
              onClick={() => {this.setMode('food')}}
              className={mode === 'food' ? "fa fa-cutlery on" : "fa fa-cutlery"}></i>
            <i
              onClick={() => {this.setMode('coffee')}}
              className={mode === 'coffee' ? "fa fa-coffee on" : "fa fa-coffee"}></i>
            <i
              onClick={() => {this.setMode('drinks')}}
              className={mode === 'drinks' ? "fa fa-beer on" : "fa fa-beer"}></i>
            {/*
            <i
              onClick={() => {this.setMode('activities')}}
              className={mode === 'activities' ? "fa fa-trophy on" : "fa fa-trophy"}></i>
            <i
              onClick={() => {this.setMode('gems')}}
              className={mode === 'gems' ? "fa fa-diamond on" : "fa fa-diamond"}></i>
            */}
          </div>
        </div>
        {show && result ?
        <Slider {...settings} className="places-slider">
          {Results}
        </Slider>
        : <div className="center page-spinner slick-empty">
          <i className="fa fa-circle-o-notch fa-spin"></i>
          </div>
        }
      </div>
    );
  }
}

export default ZZomato;
