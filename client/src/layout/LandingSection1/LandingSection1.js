import React, { Component } from "react";  

import './LandingSection1.css'; 

class LandingSection1 extends Component {
  
    render() { 

        return (
            <div className="landingSection1"> 
                <div className="section1Container">
                    <div className="section1Div mc_2">
                        <h2>CURRENT STATE</h2>
                        <p>The skilled job market is candidate driven and growing. Employers now more than ever need talented third-party recruiters for hard-to-fill&nbsp;jobs. </p>
                    </div>
                    <div className="section1Div mc_3">
                        <h2>THE PROBLEM</h2>
                        <p>Employers are overwhelmed by the growing number of hungry recruiters competing for their business. They typically end up engaging familiar recruiters, but should they feel confident they're truly getting the best candidates on the&nbsp;market?</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default LandingSection1;