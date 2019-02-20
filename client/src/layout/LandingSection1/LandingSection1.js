import React, { Component } from "react";  
import './LandingSection1.css'; 

import currStateImg from '../../files/images/landingPage/the-current-state-icon.png';  
import problemImg from '../../files/images/landingPage/the-problem-icon.png';  

class LandingSection1 extends Component {
  
    render() { 

        return (
            <div className="landingSection1">  
                <div className="full">
                    <div className="half whiteBG centerText maxTextW">
                        <div className="csImg"><img src={currStateImg} alt="" /></div>
                        <h2>The Current State</h2>
                        <p>The skilled job market is candidate driven and growing. Employers now more than ever need talented third-party recruiters for hard-to-fill&nbsp;jobs.</p>
                    </div>
                    <div className="half whiteBG centerText maxTextW">
                        <div className="csImg"><img src={problemImg} alt="" /></div>
                        <h2>The Problem</h2>
                        <p>Employers are overwhelmed by the growing number of hungry recruiters competing for their business. They typically end up engaging familiar recruiters, but should they feel confident they're truly getting the best candidates on the&nbsp;market?</p>
                    </div>
                </div> 
            </div>
        );
    }
}

export default LandingSection1;