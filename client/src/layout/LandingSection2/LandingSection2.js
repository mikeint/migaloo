import React, { Component } from "react";  

import './LandingSection2.css'; 

class LandingSection2 extends Component {
  
    render() {

        return (
            <div className="landingSection2"> 
                <div className="section2Container"> 
                    <h1>Overview</h1>
                    <div className="full">
                        <div className="infoDivContainer"> 
                            <div className="infoDiv">
                                <h2>Real Recruitment Platform</h2>
                                <p>The first and only platform connecting employers directly to third-party recruiters.</p>
                            </div>
                        </div>
                        <div className="infoDivContainer">
                            <div className="infoDiv">
                                <h2>Top Quality Candidates</h2>
                                <p>Recruiters have the opportunity to showcase their best candidates, and employers get a ranked list of top talent to choose from.</p>
                            </div>
                        </div>
                        <div className="infoDivContainer">
                            <div className="infoDiv">
                                <h2>Efficient</h2>
                                <p>Employers will only view qualified candidates. Recruiters get the right information upfront so they can assess their candidate pool to see if they have a match.  </p>
                            </div>
                        </div>
                    </div>
                    <div className="full">
                        <div className="infoDivContainer">
                            <div className="infoDiv">
                                <h2>Credit-Based System</h2>
                                <p>Recruiters can rank ahead of their competition based on the confidence in their ability to fill the opening.  Employers get an organized list of qualified candidates.</p>
                            </div>
                        </div>
                        <div className="infoDivContainer">
                            <div className="infoDiv">
                                <h2>Transparency</h2>
                                <p>Each submission has recruiters' terms and conditions included allowing employers to make informed decisions on which recruiter(s) they choose to engage. </p>
                            </div>
                        </div>
                        <div className="infoDivContainer">
                            <div className="infoDiv">
                                <h2>Confidentiality</h2>
                                <p>Both employer and candidate details are confidential. Only when successful matches have been made are details divulged.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LandingSection2;