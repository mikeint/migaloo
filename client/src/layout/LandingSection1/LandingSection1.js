import React, { Component } from "react";  
import './LandingSection1.css'; 
import ScrollAnimation from 'react-animate-on-scroll';

import currStateImg from '../../files/images/landingPage/the-current-state-icon.png';  
import problemImg from '../../files/images/landingPage/the-problem-icon.png';  
import realityImg from '../../files/images/landingPage/the-reality-icon.png';  

class LandingSection1 extends Component {
  
    render() { 

        return (
            <div className="landingSection1">  
                <div className="module_wrapper">
                    <div className="animated_third centerText">
                        <div className="module_content header_module_content">
                            <ScrollAnimation className="heroTxtFull" animateIn='bounceInLeft' initiallyVisible={true} animateOnce={true}> 
                                <div className="csImg csImg_desktop"><img src={currStateImg} alt="" /></div> 
                            </ScrollAnimation> 
                            <div className="csImg csImg_mobile"><img src={currStateImg} alt="" /></div> 
                            <h2 className="ls_text">Current State</h2> 
                            <p className="maxTextW">There are more job openings than there are qualified candidates on the&nbsp;market</p>
                        </div>
                    </div>
                    <div className="animated_third centerText">
                        <div className="module_content header_module_content">
                            <ScrollAnimation className="heroTxtFull" animateIn='bounce' initiallyVisible={true} animateOnce={true}> 
                                <div className="csImg csImg_desktop"><img src={realityImg} alt="" /></div> 
                            </ScrollAnimation> 
                            <div className="csImg csImg_mobile"><img src={realityImg} alt="" /></div> 
                            <h2 className="ls_text">Reality</h2> 
                            <p className="maxTextW">The best candidates are gainfully employed, and are not actively searching for a new&nbsp;job.</p>
                        </div>
                    </div>
                    <div className="animated_third centerText">
                        <div className="module_content header_module_content">
                            <ScrollAnimation className="heroTxtFull" animateIn='bounceInRight' initiallyVisible={true} animateOnce={true}> 
                                <div className="csImg csImg_desktop"><img src={problemImg} alt="" /></div> 
                            </ScrollAnimation> 
                            <div className="csImg csImg_mobile"><img src={realityImg} alt="" /></div> 
                            <h2 className="ls_text">Problem</h2>
                            <p className="maxTextW">Navigating the world of recruiters can be cumbersome for employers, but necessary for hard-to-fill&nbsp;roles.</p>
                        </div>
                    </div>
                </div> 
            </div>
        );
    }
}
 


export default LandingSection1;