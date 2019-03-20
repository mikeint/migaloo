import React, { Component } from "react";  
import './LandingSection1.css'; 

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
                            <div className="csImg"><img src={currStateImg} alt="" /></div>
                            <h2 className="ls_text">The Current State</h2>
                            <p className="maxTextW">There are way more job openings than there are qualified candidates on the market.  Employers are beginning to realize that they need to rethink their approach if they want to win the war for&nbsp;talent.</p>
                        </div>
                    </div>
                    <div className="animated_third centerText">
                        <div className="module_content header_module_content">
                            <div className="csImg"><img src={realityImg} alt="" /></div>
                            <h2 className="ls_text">The Reality</h2>
                            <p className="maxTextW">The best candidates are in the driver's seat, gainfully employed, and are not actively looking for a new job.  Third party recruiters spend their days getting to know and gaining the trust of these candidates and should be considered for important&nbsp;searches.</p>
                        </div>
                    </div>
                    <div className="animated_third centerText">
                        <div className="module_content header_module_content">
                            <div className="csImg"><img src={problemImg} alt="" /></div>
                            <h2 className="ls_text">The Problem</h2>
                            <p className="maxTextW">For employers, navigating the world of recruiters can be cumbersome, but necessary for hard to fill roles. Out of all the recruiters who have reached out to me, who do they choose? What price can they pay for the right candidate? Where can they fit the time for these new&nbsp;relationships?</p>
                        </div>
                    </div>
                </div> 
            </div>
        );
    }
}
 


export default LandingSection1;