import React from "react";
import firebase, {base} from './firebase.js';
import Hashids from 'hashids';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import AddPhone from './addphone.js';
import GoogleSuggest from './places.js';
import ip from 'ip';
import ipLocation from "iplocation";
import Location from '../assets/location.png';
import Gem from '../assets/gem.png';
import Star from '../assets/star.png';

import { ShareButtons, generateShareIcon } from 'react-share';
const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const EmailIcon = generateShareIcon('email');
const { FacebookShareButton, TwitterShareButton } = ShareButtons;

var hashids = new Hashids('', 5);

class OnBoarding extends React.Component {
    constructor() {
      super();
      this.state = {
        hash: '',
        hasShared: false,
        getLocation: false,
        ipLocation: '',
        selected: [],
        special: '',
        step: 1,
        total: 0,
      }
      this.setHasShared = this.setHasShared.bind(this);
      this.setGetLocation = this.setGetLocation.bind(this);
      this.setStep = this.setStep.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount = () => {
      ipLocation(window.userip)
      .then((res) => {
        this.setState({
          ipLocation: res
        });
      })
      .catch(err => {
        console.log(err);
      });
      if(this.props.uid){
        const usersRef = firebase.database().ref('members');
        usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
          if (snapshot.exists()) {
            var user = snapshot.val();
            var key = Object.keys(snapshot.val())[0];
            var points = user[key]['points'];
            if(points){
              let total = 0;
              Object.entries(points).map((p,i) => {
                let points = p[1];
                let value = Object.values(points);
                total = parseInt(total, 10) + parseInt(value, 10);
                this.setState({ total: total });
              });
            }
          }
        });
      }
    }

    handleShareButton(url) {
      this.props.openPopupBox(url);
      this.setHasShared();
    }

    handleChange(e) {
      this.setState({
        [e.target.name]: e.target.value
      });
    }

    setHasShared() {
      this.setState({ hasShared: true });
    }

    setGetLocation() {
      this.setState({ getLocation: true });
    }

    setStep(step){
      this.setState({step: step});
    }

    handleSelect(str) {
      let selected = this.state.selected;
      let index = selected.indexOf(str);
      if(index === -1){
        this.setState({ selected: [...this.state.selected, str] })
      }else{
        selected.splice(index, 1);
        this.setState({selected: selected});
      }
    }

    setUserLocation = (type) => {
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var user = snapshot.val();
          let userkey = Object.keys(user)[0];
          const memberRef = firebase.database().ref(`/members/${userkey}`);
          if(type === "search"){
            memberRef.update({
                lat: this.props.location.geometry.location.lat(),
                lng: this.props.location.geometry.location.lng(),
                address: this.props.location.formatted_address
            });
          }
          if(type === "auto"){
            memberRef.update({
                lat: this.state.ipLocation.latitude,
                lng: this.state.ipLocation.longitude,
                address: this.state.ipLocation.city+', '+this.state.ipLocation.regionCode
            });
          }
          console.log('Home Base Added');
          this.setState({
            step: 2
          });
          return;
        }
      });
    }

    setUserInterests = () => {
      const usersRef = firebase.database().ref('members');
      var key = Date.now();
      key = key.toString().split("").map(num => parseInt(num, 0));
      key = key.splice(8, 5);
      key = key.sort(function(a, b){ return 0.5 - Math.random() });
      const hash = hashids.encode(key);
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var user = snapshot.val();
          let userkey = Object.keys(user)[0];
          const memberRef = firebase.database().ref(`/members/${userkey}`);
          memberRef.update({
              interests: this.state.selected,
              hash: hash
          });
          console.log('User Interests Saved');
          this.setState({step: 3, hash: hash});
          return;
        }
      });
    }

    setUserGem = () => {
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var user = snapshot.val();
          let userkey = Object.keys(user)[0];
          const memberRef = firebase.database().ref(`/members/${userkey}`);
          memberRef.update({
              gem: {
                pid: this.props.location.place_id,
                name: this.props.name,
                comment: this.state.special
              }
          });
          console.log('Gem Added');
          this.setState({step: 4});
          return;
        }
      });
    }

    unlockUser = () => {
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var user = snapshot.val();
          let userkey = Object.keys(user)[0];
          const memberRef = firebase.database().ref(`/members/${userkey}`);
          memberRef.update({
             onboard: true
          });
          this.props.setOnboard(true);
          console.log('User Unlocked and Onboard :)');
          return;
        }
      });
    }

    disableInput = (str) => {
      const { selected } = this.state;
      if(selected.indexOf(str) === -1 && selected.length === 3) {
        return true;
      }else{
        return false;
      }
    }

    render() {
        const {
          getLocation,
          hasShared,
          ipLocation,
          length,
          selected,
          step,
          total
        } = this.state;
        const { location } = this.props;
        var baseUrl = window.location.protocol + "//" + window.location.host;
        var shareUrl = baseUrl+'/user/invite/'+this.state.hash;
        return (
            <div className="page-wrapper">
              <ul className="steps">
                <li className={step === 1 ? 'active' : ''}>1</li>
                <li className={step === 2 ? 'active' : ''}>2</li>
                <li className={step === 3 ? 'active' : ''}>3</li>
                <li className={step === 4 ? 'active' : ''}>4</li>
                <li className={step === 5 ? 'active' : ''}>5</li>
              </ul>
              {step === 1 && <div>
                <h3 className="normal">
                Welcome <strong>{this.props.displayName}</strong>!
                </h3>
                <hr />
                <img src={Location} alt="location" />
                {getLocation ?
                  <div>
                  <MuiThemeProvider>
                    <GoogleSuggest
                     name="homecity"
                     onLocChange={this.props.setLocation}
                     onNameChange={this.props.setName}
                     placeholder="Please Enter Your Home City"
                     types={["(cities)"]}
                    />
                  </MuiThemeProvider>
                  <div className="welcome-buttons">
                    <button
                     className="btn blue"
                     onClick={() => {this.setUserLocation('search')}}
                    >Save</button>
                  </div>
                  </div> :
                  <div>
                    <div><strong>Thanks for joining Hangerang!</strong></div>
                    <div>
                      It looks like your location is: <br />
                      <strong className={'capsule'}>
                      {ipLocation.city},&nbsp;
                      {ipLocation.regionCode}&nbsp;
                      </strong><br />
                      Is this your home city?
                    </div>
                    <div className="welcome-buttons">
                      <button
                        className="btn blue"
                        onClick={() => {this.setUserLocation('auto')}}>
                        Yes</button>
                      <button
                        className="btn pink"
                        onClick={() => {this.setGetLocation()}}>
                        No
                      </button>
                    </div>
                  </div>
                }
              </div>}
              {step === 2 &&
                <div>
                  <h3>
                    What sort of things are you most interested in?
                  </h3>
                  <div className="small">Choose 3</div>
                  <hr />
                  <div className="choices">
                    <input type="checkbox" id="food-drink"
                      onChange={() => {this.handleSelect('food-drink')}}
                      disabled={this.disableInput('food-drink')}
                    />
                    <label htmlFor="food-drink" className="food-drink">
                    Food <br />&amp;<br /> Drink</label>
                    <input type="checkbox" id="arts-crafts"
                      onChange={() => {this.handleSelect('arts-crafts')}}
                      disabled={this.disableInput('arts-crafts')}
                    />
                    <label htmlFor="arts-crafts" className="arts-crafts">
                    Arts <br />&amp;<br /> Crafts</label>
                    <input type="checkbox" id="music-concerts"
                      onChange={() => {this.handleSelect('music-concerts')}}
                      disabled={this.disableInput('music-concerts')}
                    />
                    <label htmlFor="music-concerts" className="music-concerts">
                    Music <br />&amp;<br /> Concerts</label>
                    <input type="checkbox" id="trails-views"
                      onChange={() => {this.handleSelect('trails-views')}}
                      disabled={this.disableInput('trails-views')}
                    />
                    <label htmlFor="trails-views" className="trails-views">
                    Trails <br />&amp;<br /> Views</label>
                    <input type="checkbox" id="stage-screen"
                      onChange={() => {this.handleSelect('stage-screen')}}
                      disabled={this.disableInput('stage-screen')}
                    />
                    <label htmlFor="stage-screen" className="stage-screen">
                    Stage <br />&amp;<br /> Screen</label>
                    <input type="checkbox" id="sports-fitness"
                      onChange={() => {this.handleSelect('sports-fitness')}}
                      disabled={this.disableInput('sports-fitness')}
                    />
                    <label htmlFor="sports-fitness" className="sports-fitness">
                    Sports <br />&amp;<br /> Fitness</label>
                    <input type="checkbox" id="help-giving"
                      onChange={() => {this.handleSelect('help-giving')}}
                      disabled={this.disableInput('help-giving')}
                    />
                    <label htmlFor="help-giving" className="help-giving">
                    Help <br />&amp;<br /> Giving</label>
                    <input type="checkbox" id="words-stories"
                      onChange={() => {this.handleSelect('words-stories')}}
                      disabled={this.disableInput('words-stories')}
                    />
                    <label htmlFor="words-stories" className="words-stories">
                    Words <br />&amp;<br /> Stories</label>
                    <input type="checkbox" id="games-trivia"
                      onChange={() => {this.handleSelect('games-trivia')}}
                      disabled={this.disableInput('games-trivia')}
                    />
                    <label htmlFor="games-trivia" className="games-trivia">
                    Games <br />&amp;<br /> Trivia</label>
                    {selected.length === 3 &&
                    <div>
                      <hr />
                      <div className="welcome-buttons">
                        <button
                         className="btn blue"
                         onClick={() => {this.setUserInterests()}}
                        >Save</button>
                      </div>
                    </div> }
                  </div>
                </div>
              }
              {step === 3 &&
                <div>
                  <p>
                    Is there a <strong>hidden gem</strong><br /> in <strong>
                    {this.props.userLocation}&nbsp;</strong><br />
                    that you love to visit?
                  </p>
                  <img src={Gem} alt="Gem" />
                  <MuiThemeProvider>
                    <div>
                    <GoogleSuggest
                     name="gem"
                     onLocChange={this.props.setLocation}
                     onNameChange={this.props.setName}
                     placeholder="What is this Magical Place?"
                    />
                    <TextField
                      className={"input-title"}
                      name='special'
                      placeholder="Why is it special?"
                      onChange={this.handleChange}
                      value={this.state.special}
                    />
                    </div>
                  </MuiThemeProvider>
                  {location && <div className="welcome-buttons">
                    <button
                     className="btn blue"
                     onClick={() => {this.setUserGem()}}
                    >Save</button>
                  </div>}
                  <a
                    onClick={() => {this.setStep(4)}}
                    className="small underline">
                    I'll do this later.
                  </a>
                </div>}
                {step === 4 &&
                  <div>
                  <AddPhone uid={this.props.uid} setStep={this.setStep} />
                  <a
                    onClick={() => {this.setStep(5)}}
                    className="small underline">
                    I'll do this later.
                  </a>
                  </div>
                }
                {step === 5 &&
                  <div>
                    <h3>Almost Done!</h3>
                    <p>
                      You have already earned <strong>{total} points</strong>!<br />
                    </p>
                    <img src={Star} alt="star" />
                    <p>
                      Invite friends to join your <strong>Crew</strong><br/>
                      to unlock the <strong>Marketplace</strong>
                    </p>
                    <p>
                      You only need <strong>{200 - total} more points</strong>. <br />
                      Every new user you bring on<br /> earns <strong>20 points</strong>.
                    </p>
                    <div className="welcome-buttons">
                      <FacebookShareButton
                        onClick={() => {this.setHasShared()}}
                        url={shareUrl}
                        quote={'Join Me on Hangerang, A new app for getting together! '+ shareUrl}>
                        <FacebookIcon size={48} round />
                      </FacebookShareButton>
                      <TwitterShareButton
                        onClick={() => {this.setHasShared()}}
                        url={shareUrl}
                        title={'Join Me on Hangerang, A new app for getting together!'}>
                        <TwitterIcon size={48} round />
                      </TwitterShareButton>
                      <button
                        className="fa fa-link"
                        onClick={() => this.handleShareButton(shareUrl)}>
                      </button>
                      </div>
                      {hasShared && <div>
                      <hr />
                      <div className="welcome-buttons">
                        <button
                         className="btn blue"
                         onClick={() => {this.unlockUser()}}
                        >Get Hangin'!</button>
                      </div>
                      </div>}
                      <div>
                        <a
                          onClick={() => {this.unlockUser()}}
                          className="small underline">
                          I'll do this later.
                        </a>
                      </div>
                  </div>}
            </div>
        );
    }
}

export default OnBoarding;
