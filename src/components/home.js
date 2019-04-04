import React, {Component} from 'react';
import logo from '../assets/logo.png';
import Scroll from 'react-scroll';
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { ShareButtons, generateShareIcon } from 'react-share';
//import Mailchimp from 'mailchimp-api-v3';

import Login from './login.js';
import Register from './register.js';

//let mailchimp = new Mailchimp('3eaef4c12d444b5a13b419b2ddf46218-us17');
let scroller = Scroll.scroller;

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const EmailIcon = generateShareIcon('email');
const { FacebookShareButton, TwitterShareButton, EmailShareButton } = ShareButtons;

const h2msg = [
  "Let's Get Together.",
  "Own The FOMO.",
  "Because Virtual Isn't Reality.",
  "Your New Social Life Awaits.",
];

class Home extends Component {
  constructor() {
    super();
    this.state = {
      h2msg: h2msg[Math.floor(Math.random()*h2msg.length)],
      timeout: false,
    }
    this.goToSection = this.goToSection.bind(this);
  }

  goToSection(section){
    scroller.scrollTo(section, {
      duration: 1500,
      delay: 100,
      smooth: "easeInOutQuint",
    })
  }

  render() {
    const shareUrl = window.location.protocol + "//" + window.location.host;
    const url = 'https://hangerang.us17.list-manage.com/subscribe/post?u=87135f90f4194955f89783499&amp;id=4750feb33d';
    return (
      <div>
        <section className='jumbo section-one' id="section-one" name="section-one">
          <div className="brand">
          <img src={logo} alt="Hangerang" />
          <h1>Hangerang</h1>
          </div>
          <div className="jumbo-content">
            <h2>{this.state.h2msg}</h2>
            <h4>We've Been Expecting You!</h4>
            {this.props.isLive ?
            <div>
            {this.props.hideLogin && this.state.timeout ?
             <p className="white">Stuck? <a onClick={this.props.logout}>Logout</a></p>
            : ''}
            {this.props.loggingIn || this.props.hideLogin ?
             <span className={'white'}><i className="fa fa-circle-o-notch fa-spin white"></i></span>
            :<div>
              {this.props.login && !this.props.register ?
                <Login
                  toggleLogin={this.props.toggleLogin}
                  toggleReg={this.props.toggleReg}
                  setUserName={this.props.setUserName}
                />
              : ''}
              {this.props.register && !this.props.login ?
                <Register
                  toggleLogin={this.props.toggleLogin}
                  toggleReg={this.props.toggleReg}
                />
              : ''}
              {!this.props.login && !this.props.register ?
                <div>
                  <div className="auth-ui">
                    <button className="btn facebook" onClick={this.props.fbLogin}>
                      <i className={'fa fa-facebook-square'}></i> Sign in with <strong>Facebook</strong>
                    </button> <button className="btn google" onClick={this.props.ggLogin}>
                      <i className={'fa fa-google'}></i> Sign in with <strong>Google</strong>
                    </button> <button className="btn twitter" onClick={this.props.twLogin}>
                      <i className={'fa fa-twitter'}></i> Sign in with <strong>Twitter</strong>
                    </button>
                  </div>
                  <div className="white small">or</div>
                  <a className="white underline" onClick={this.props.toggleLogin}>
                    Sign in the old fashioned way
                  </a>
                </div>
              : ''}
              </div>
            }
            </div>
            :
            <div className={'sign-up'}>
            {/*We need <strong>1,000</strong> interested people. Once that happens we <strong>go live!</strong>*/}
            We launch in <strong>Mid-April</strong>. Sign up to become an exclusive founding member!
            <MailchimpSubscribe url={url}/>
            <span className="share-ui">
              <span>Share with friends:</span>
              <span className="share-buttons">
                <FacebookShareButton url={shareUrl}
                  quote={'Join Me on Hangerang, A new app for getting together! https://hangerang.us!'}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl}
                  title={'Join Me on Hangerang, A new app for getting together!'}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <EmailShareButton
                  url={shareUrl}
                  subject={'Join Me on Hangerang, A new app for getting together!'}
                  body={"Check it out: https://hangerang.us!"}
                >
                  <EmailIcon size={32} round />
                </EmailShareButton>
              </span>
            </span>
            </div>
            }
            <a className="section-nav"
              onClick={() => this.goToSection("section-two") }
            ><i className="fa fa-chevron-down"></i>What?</a>
          </div>
        </section>
        <section className='jumbo section-two' id="section-two" name="section-two">
          <div className="jumbo-content">
            <span>What?</span>
            <h2>{"A Whole World to Experience!"}</h2>
            <p><strong>Hangerang</strong> is a place for casual adventures <br />with real people. (aka "Hangs")</p>
            <p>Make more <strong>connections</strong> and bring excitement into the <strong>everyday</strong>!</p>
            <a className="section-nav" onClick={() => this.goToSection("section-three") }>
              <i className="fa fa-chevron-down"></i>
              Why?
            </a>
          </div>
        </section>
        <section className='jumbo section-three' id="section-three" name="section-three">
          <div className="jumbo-content">
            <span>Why?</span>
            <h2>Likes &ne; Life</h2>
            <p>We think <strong>social media</strong> isn't really all that <strong>social</strong>.</p>
            <p>Spending time with people <strong>in real life</strong> has been scientifically proven<br /> to be beneficial for mental and physical health.</p>
            <a className="section-nav" onClick={() => this.goToSection("section-four") }>
              <i className="fa fa-chevron-down"></i>
              Who?
            </a>
          </div>
        </section>
        <section className='jumbo section-four' id="section-four" name="section-four">
          <div className="jumbo-content">
            <span>Who?</span>
            <h2>{"It's Up To You!"}</h2>
            <p>
            <strong>Hang</strong> with who you want, when you want.
            </p>
            <p>We've created the easiest platform to <strong>discover</strong>, <strong>create</strong>, and <strong>invite</strong> friends to
            local happenings.</p>
            <p>Every time you Hang, you'll have the opportunity to <strong>earn points</strong> to use on our upcoming <strong>marketplace</strong>!</p>
            <a className="section-nav" onClick={() => this.goToSection("section-one") }>
              <i className="fa fa-chevron-up"></i>
              {"Ok. I'm ready!"}
            </a>
          </div>
        </section>
      </div>
    );
  }
}

export default Home;
