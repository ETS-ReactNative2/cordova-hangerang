import React, {Component} from 'react';
import logo from '../assets/logo.png';
import Scroll from 'react-scroll';
import MailchimpSubscribe from "react-mailchimp-subscribe";
import { ShareButtons, generateShareIcon } from 'react-share';

var scroller = Scroll.scroller;

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const EmailIcon = generateShareIcon('email');
const { FacebookShareButton, TwitterShareButton, EmailShareButton } = ShareButtons;

class Home extends Component {
  constructor() {
    super();
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
            <h2>{"Let's Get Together."}</h2>
            {this.props.isLive ?
            <div>
            {this.props.loggingIn ?
             <span className={'white'}><i className="fa fa-circle-o-notch fa-spin white"></i> Logging In</span>
            :<button className="btn facebook" onClick={this.props.login}>
              Login with Facebook <i className={'fa fa-facebook-square'}></i>
            </button>
            }
            </div>
            :
            <div className={'sign-up'}>
            We need <strong>1,000</strong> interested people. Once that happens we <strong>go live!</strong>
            <MailchimpSubscribe url={url}/>
            <span className="share-ui">
              <span>Share with friends:</span>
              <span className="share-buttons">
                <FacebookShareButton url={shareUrl} quote={'Join Me on Hangerang, A new app for getting together!'}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} quote={'Join Me on Hangerang, A new app for getting together!'}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <EmailShareButton url={shareUrl} quote={'Join Me on Hangerang, A new app for getting together!'}>
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
            <p>Hangerang is a place for <strong>Hangs</strong>.</p>
            <p><strong>Hangs</strong> are real world experiences <br />with real people.</p>
            <p>Catch a movie. Try a new restaurant. Go on a hike. <br />The possibilities are limitless!</p>
            <a className="section-nav" onClick={() => this.goToSection("section-three") }>
              <i className="fa fa-chevron-down"></i>
              Why?
            </a>
          </div>
        </section>
        <section className='jumbo section-three' id="section-three" name="section-three">
          <div className="jumbo-content">
            <span>Why?</span>
            <h2>{"Social Media Is Lonely"}</h2>
            <p>Staring at your screen and feeling envious about other {"people's"} lives is no way to live.<br />
            Spending time with people <strong>in real life</strong> has been scientifically proven to be beneficial for mental and physical health.</p>
            <a className="section-nav" onClick={() => this.goToSection("section-four") }>
              <i className="fa fa-chevron-down"></i>
              Who?
            </a>
          </div>
        </section>
        <section className='jumbo section-four' id="section-four" name="section-four">
          <div className="jumbo-content">
            <span>Who?</span>
            <h2>{"It's Up To You"}</h2>
            <p>
            Hang out with who you want, when you want.
            </p>
            <p>There are 3 levels of privacy access to the Hangs you create: <b>Invite Only</b>, <b>Friends+</b>, and <b>Public</b>. <br />
            You may not want to invite the entire city to your dinner party, but you might be open to making some new friends
            while checking out the newest local tap room. Absolutely up to you!
            </p>
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
