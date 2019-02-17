import React, { Component } from 'react'; 
import { Link } from 'react-router-dom';
import './Landing.css';
import heroHome from '../../files/images/hero_2.jpg'; 
import ScrollAnimation from 'react-animate-on-scroll';

import SocialSide from "../SocialSide/SocialSide"; 
import ContactSection from "../ContactSection/ContactSection"; 

import LandingSection1 from "../LandingSection1/LandingSection1"; 
import LandingSection2 from "../LandingSection2/LandingSection2"; 
import LandingSection3 from "../LandingSection3/LandingSection3"; 

class Landing extends Component {

	render() {
		return (
			<React.Fragment>
				<SocialSide />
				<div id="header">
					<div id="logoContainer"><div className="logo">HR</div></div>
					<div id="navBar">
						<li className="navBarA">Home</li>
						<li className="navBarA">Overview</li>
						<li className="navBarA">How it Works</li> 
						<li className="navBarA">Contact</li> 
						<Link to="/login"><li className="navBarA">Login</li></Link>
					</div>

					<div id="navBarMobile">
						<div id="nav-icon1">
							<span className="hmbSpanA"></span>
							<span className="hmbSpanA"></span>
							<span className="hmbSpanA"></span> 
						</div>
						<div className="side-menu" id="side-menu">
							<li>Home</li> 
							<li>Overview</li>
							<li>How it Works</li>
							<li>Contact Us</li>
							<Link to="/login"><li>Login</li></Link>
						</div>
					</div>
				</div>

				<div className="heroContainer">
					<img src={heroHome} alt="" />
					<div className="heroText"> 
					<ScrollAnimation animateIn='bounceInLeft' initiallyVisible={true} animateOnce={true}>
						A platform where EMPLOYERS<br/>post jobs to RECRUITERS.
					</ScrollAnimation>
					</div>
				</div> 

				<LandingSection1 />
				<LandingSection2 />
				<LandingSection3 />
				<ContactSection />
                
 

			</React.Fragment>
		);
  	}
}

export default Landing;
