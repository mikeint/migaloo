import React, { Component } from 'react'; 
import { Link } from 'react-router-dom';
import './Landing.css';
import heroHome from '../../files/images/hero_2.jpg'; 
import ScrollAnimation from 'react-animate-on-scroll';

import SocialSide from "../SocialSide/SocialSide"; 
import ContactSection from "../ContactSection/ContactSection"; 

class Landing extends Component {

	render() {
		return (
			<React.Fragment>
				<SocialSide />
				<div id="header">
					<div id="logoContainer"><div className="logo">HR</div></div>
					<div id="navBar">
						<li className="navBarA noselect">Home</li>
						<li className="navBarA noselect">Overview</li>
						<li className="navBarA noselect">How it Works</li> 
						<li className="navBarA noselect">Contact</li> 
						<li className="navBarA noselect"><Link to="/login">Login</Link></li>
					</div>

					<div id="navBarMobile">
						<div id="nav-icon1">
							<span className="hmbSpanA"></span>
							<span className="hmbSpanA"></span>
							<span className="hmbSpanA"></span> 
						</div>
						<div className="side-menu" id="side-menu">
							<li className="noselect">Home</li> 
							<li className="noselect">Overview</li>
							<li className="noselect">How it Works</li>
							<li className="noselect">Contact Us</li>
							<li className="noselect"><Link to="/login">Login</Link></li>
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

				<ContactSection />
                
 

			</React.Fragment>
		);
  	}
}

export default Landing;
