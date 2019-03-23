import React, { Component } from "react";  
import ScrollAnimation from 'react-animate-on-scroll';
import './AboutTeam.css'; 
import NavBar from '../components/NavBar/NavBar'
import SocialSide from "../SocialSide/SocialSide";  
import HeroContainer from "../HeroContainer/HeroContainer";  
import AboutSection from "../AboutSection/AboutSection"; 

import ContactSection from '../ContactSection/ContactSection';

class AboutTeam extends Component {
  
    render() { 

        return (
            <div className="aboutTeamPage">  
                <SocialSide />
                <NavBar page="AboutPage" />
                <div className="theWhalesText"> 
					<ScrollAnimation className="heroTxtFull" animateIn='fadeIn' initiallyVisible={false} animateOnce={true}> 
						The whales
					</ScrollAnimation>
				</div>
                <HeroContainer />  
                <AboutSection />
                <ContactSection />
            </div>
        );
    }
}

export default AboutTeam;