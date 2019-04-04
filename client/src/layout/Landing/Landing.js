import React, { Component } from 'react';  
import './Landing.css'; 
import ScrollAnimation from 'react-animate-on-scroll';
import ScrollableAnchor from 'react-scrollable-anchor'
import SocialSide from "../SocialSide/SocialSide"; 
import ContactSection from "../ContactSection/ContactSection"; 

import LandingSection1 from "../LandingSection1/LandingSection1"; 
import LandingSection2 from "../LandingSection2/LandingSection2"; 
import LandingSection3 from "../LandingSection3/LandingSection3";  
import HeroContainer from "../HeroContainer/HeroContainer";  
import NavBar from '../components/NavBar/NavBar';



class Landing extends Component {

	render() {
		return (
			<React.Fragment>
				<SocialSide />
                <NavBar page="home" />
  
                <div className="heroText"> 
					<ScrollAnimation className="heroTxtFull" animateIn='fadeIn' initiallyVisible={true} animateOnce={true}> 
						For a managed marketplace<br/>
						join the whales of recruitment.
					</ScrollAnimation>
				</div>

                <HeroContainer /> 
                <ScrollableAnchor id={'header'}><LandingSection1 /></ScrollableAnchor>
				<ScrollableAnchor id={'landingSection2'}><LandingSection2 /></ScrollableAnchor>
				<ScrollableAnchor id={'landingSection3'}><LandingSection3 /></ScrollableAnchor>
				<ScrollableAnchor id={'contactSection'}><ContactSection /></ScrollableAnchor>
                 
			</React.Fragment>
		);
  	}
}

export default Landing;
