import React, { Component } from 'react';
import './Landing.css';
import SocialSide from "../SocialSide/SocialSide";
import LandingSection1 from "../LandingSection1/LandingSection1";
import LandingSection3 from "../LandingSection3/LandingSection3";
import LandingSection4 from "../LandingSection4/LandingSection4";
import LandingSection5 from "../LandingSection5/LandingSection5";
import LandingSection6 from "../LandingSection6/LandingSection6";
//import ContactSection from "../ContactSection/ContactSection";
import HeroContainer from "../HeroContainer/HeroContainer";
//import NavBar from '../components/NavBar/NavBar';
import HeroCover from '../components/HeroCover/HeroCover';


class Landing extends Component {

	render() {
		return (
			<React.Fragment>
				<SocialSide />
                {/* <NavBar page="home" /> */}
                <HeroCover /> 
                <HeroContainer /> 
                <LandingSection1 />
				<LandingSection3 /> 
                <LandingSection6 />
                <LandingSection5 />
                <LandingSection4 />
				{/* <ContactSection /> */} 
			</React.Fragment>
		);
  	}
}

export default Landing;
