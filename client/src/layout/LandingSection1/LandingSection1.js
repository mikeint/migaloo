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
                        <div className="module_content">
                            <div className="csImg"><img src={currStateImg} alt="" /></div>
                            <h2>The Current State</h2>
                            <p className="maxTextW">There are way more job openings than there are qualified candidates on the market.  Employers are beginning to realize that they need to rethink their approach if they want to win the war for&nbsp;talent.</p>
                        </div>
                    </div>
                    <div className="animated_third centerText">
                        <div className="module_content">
                            <div className="csImg"><img src={realityImg} alt="" /></div>
                            <h2>The Reality</h2>
                            <p className="maxTextW">Employers want to hire top talent.  In this market, good candidates are in the driver's seat, gainfully employed, and are not actively looking for a new job.  It takes skill and a lot of time to reach these passive candidates who, for the right opportunity, might consider switching jobs.  Third party recruiters spend their days getting to know and gaining the trust of these candidates and should be considered for important&nbsp;searches.</p>
                        </div>
                    </div>
                    <div className="animated_third centerText">
                        <div className="module_content">
                            <div className="csImg"><img src={problemImg} alt="" /></div>
                            <h2>The Problem</h2>
                            <p className="maxTextW">There are hundreds if not thousands of recruiters in an employers given market who are constantly trying to get noticed.  Employers rightfully feel overwhelmed and tend to ignore their cold attempts at their business.  It’s when employers start to feel desperate to fill an important job opening that they might consider taking on a third party recruiter but which one should they choose?  Should they just go with one they’ve used in the past?  Should they diversify and use more than one?  Is this recruiter’s fee too high?  This process is&nbsp;cumbersome.</p>
                        </div>
                    </div>
                </div> 
            </div>
        );
    }
}
 


export default LandingSection1;