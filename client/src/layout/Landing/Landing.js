import React, { Component } from 'react'; 
import { Link } from 'react-router-dom';
import './Landing.css';
//import heroHome from './images/landingPage/hero_2.jpg'; 
//import HRlogoblack from './images/landingPage/HR-logo-black.png'; 
import ScrollAnimation from 'react-animate-on-scroll';
import ScrollableAnchor from 'react-scrollable-anchor'
import SocialSide from "../SocialSide/SocialSide"; 
import ContactSection from "../ContactSection/ContactSection"; 

import LandingSection1 from "../LandingSection1/LandingSection1"; 
import LandingSection2 from "../LandingSection2/LandingSection2"; 
import LandingSection3 from "../LandingSection3/LandingSection3";  
import HeroContainer from "../HeroContainer/HeroContainer"; 
import AboutSection from '../AboutSection/AboutSection';


class Landing extends Component {
   
    constructor(props) {
        super(props);
		this.state = {
            smallHeader: false,
            menuOpen: false,
        }; 
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    } 
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }
    handleScroll = () => {  
        this.setState({ smallHeader: window.pageYOffset > 0 });
    }
    toggleMobileMenu = () => {
        this.setState({ menuOpen: !this.state.menuOpen }); 
        window.scrollTo(0,0);
    }
    toggleLandingMenu = () => { 
        this.setState({ menuOpen: !this.state.menuOpen }); 
    }

	render() {
		return (
			<React.Fragment>
				<SocialSide />
				<div id="header" className={this.state.smallHeader ? "smallHeader" : ""}>

                    <div id="logoContainer">
                        {/* <div className="mainLogoContainer">
                            <div className="logoCircleDiv div1"></div>
                            <div className="logoCircleDiv div2"></div>
                            <div className="logoCircleDiv div3"></div>
                            <div className="logoCircleDiv div4"></div>
                            <div className="logoText"></div>
                        </div> */} 
                    </div>

					<div id="navBar"> 
						<a href="#landingSection2"><li className="navBarA">Overview</li></a>
						<a href="#landingSection3"><li className="navBarA">How it Works</li></a>
						<a href="#contactSection"><li className="navBarA">Contact</li></a> 
                        <Link to='/about'><li className="navBarA">About</li></Link>
						{/* <Link to="/login"><li className="navBarA">Login</li></Link> */}
						{/* <li className="navBarA">Login</li> */}
					</div>

					<div id="navBarMobile">
						<div id="nav-icon1" onClick={this.toggleLandingMenu} className={this.state.menuOpen ? "open" : ""}>
							<span className="hmbSpanA"></span>
							<span className="hmbSpanA"></span>
							<span className="hmbSpanA"></span> 
						</div>
						<div id="side-menu" className={this.state.menuOpen ? "side-menu active-side-menu" : "side-menu"}> 
							<a href="#landingSection2" onClick={this.toggleMobileMenu}><li>Overview</li></a>
							<a href="#landingSection3" onClick={this.toggleMobileMenu}><li>How it Works</li></a>
                            <Link to='/about' onClick={this.toggleMobileMenu}><li>About</li></Link>
							<a href="#contactSection" onClick={this.toggleMobileMenu}><li>Contact Us</li></a> 
							{/* <Link to="/login"><li>Login</li></Link> */}
							{/* <li>Login</li> */}
						</div>
					</div>
                    <a href="#header"> 
                        <div className="whaleContainer"><span className="migalooLogoText">Migaloo</span></div>
                    </a>
				</div>
  
                <div className="heroText"> 
					<ScrollAnimation className="heroTxtFull" animateIn='bounceInLeft' initiallyVisible={true} animateOnce={true}> 
						For A managed marketplace<br/>Join the whales of recruitment.
					</ScrollAnimation>
				</div>

                <HeroContainer />

				
                <ScrollableAnchor id={'header'}><LandingSection1 /></ScrollableAnchor>
				<ScrollableAnchor id={'landingSection2'}><LandingSection2 /></ScrollableAnchor>
				<ScrollableAnchor id={'landingSection3'}><LandingSection3 /></ScrollableAnchor>
                <AboutSection />
				<ScrollableAnchor id={'contactSection'}><ContactSection /></ScrollableAnchor>
                 
 

			</React.Fragment>
		);
  	}
}

export default Landing;
