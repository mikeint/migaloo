import React, { Component } from "react";  
import './Team.css'; 

import AOS from 'aos'
import 'aos/dist/aos.css' 

import linkedInImg from '../../files/images/landingPage/linkedin.png'
import mailToImg from '../../files/images/landingPage/mailTo.png'
import phoneToImg from '../../files/images/landingPage/phoneTo.png'
 
class Team extends Component {
    componentDidMount(){
        AOS.init({
          duration : 500
        })
    }

    render() {
        return (
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">The Whales</div>
                <div className="lp2_teamContainer">
                    <div className="teamContent"> 
                        <div className="flex">
                            <div className="teamMember teamMember1" data-aos="fade-right" data-aos-delay="400"></div>
                            <div className="name">Michael Sansone</div>
                            <div className="title">CTO</div>
                            <div className="socialItems">
                                <a href="https://www.linkedin.com/in/michael-sansone" target="_blank" rel="noopener noreferrer"><img src={linkedInImg} alt="" /></a>
                                <a href="mailto:michael.sansone@migaloo.io"><img src={mailToImg} alt="" /></a>
                                <a href="tel:647-500-7834"><img src={phoneToImg} alt="" /></a>
                            </div>
                            <p>Teacher, speaker, programming enthuthiast</p>
                        </div> 
                        <div className="flex">
                            <div className="teamMember teamMember2" data-aos="fade-down"></div>
                            <div className="name">Michael Nasser</div>
                            <div className="title">CEO</div>
                            <div className="socialItems">
                                <a href="https://www.linkedin.com/in/michaelnasser" target="_blank" rel="noopener noreferrer"><img src={linkedInImg} alt="" /></a>
                                <a href="mailto:michael.nasser@migaloo.io"><img src={mailToImg} alt="" /></a>
                                <a href="tel:647-628-9866"><img src={phoneToImg} alt="" /></a>
                            </div>
                            <p>Teacher, speaker, programming enthuthiast</p>
                        </div> 
                        <div className="flex">
                            <div className="teamMember teamMember3" data-aos="fade-left" data-aos-delay="400"></div>
                            <div className="name">Michael Marcucci</div>
                            <div className="title">Lead Developer</div>
                            <div className="socialItems">
                                <a href="https://www.linkedin.com/in/michael-marcucci" target="_blank" rel="noopener noreferrer"><img src={linkedInImg} alt="" /></a>
                                <a href="mailto:michael.marcucci@migaloo.io"><img src={mailToImg} alt="" /></a> 
                            </div>
                            <p>Teacher, speaker, programming enthuthiast</p>
                        </div>
                    </div> 
                </div>
            </React.Fragment>
        );
    }
}

export default Team;