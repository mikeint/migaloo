import React, { Component } from "react";  
import './LandingSection4.css';
import ScrollAnimation from 'react-animate-on-scroll';
import { Parallax } from 'react-parallax';
import { Link } from 'react-router-dom';

import empImg from "../../files/images/employer_pick.png";
import recImg from "../../files/images/recruiter_pick.png";

import section4Parallax from "../../files/images/landingPage/sectionParralax.png";

 
class LandingSection4 extends Component {
    constructor() {
        super();
		this.state = {
            showSignUpButtons: false,
        }; 
    }
    showButtons = () => { 
        this.setState({ showSignUpButtons: !this.state.showSignUpButtons })
    }
    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }
 
    render() { 

        return (
            <div className="landingSection4">  

{/*                 <div className="module_wrapper greyBG">
                    <div className="animated_half">
                        <div className="module_content"> 
                            <h1>Ready to find out more?</h1>
                            <p>We are near the release of our beta platform but we are not quite there yet - thanks for your patience.  Please sign up now to be part of our first cohort of recruiters and employers… Free of&nbsp;charge!</p>
                        </div>
                    </div>
                    <div className="animated_half">  
                        {!this.state.showSignUpButtons ? 
                            <div className="signUpBtnHome" onClick={this.showButtons}>Sign Up</div>
                        :  
                        <React.Fragment>
                            <div className="chooseText">Please choose:</div>
                            <Link to='signUpFormEmployer'><div className="signUpBtnHome"><img src={empImg} alt="" align="middle" />Employer</div></Link>
                            <Link to='signUpFormRecruiter'><div className="signUpBtnHome"><img src={recImg} alt="" align="middle" />Recruiter</div></Link>
                        </React.Fragment>
                        } 
                    </div>
                </div>  */}
                     
                <Parallax bgImage={section4Parallax} strength={300}> 
                    <div className="sp_contain"> 
                        
                        <div className="sp_text">
                            <ScrollAnimation animateIn='fadeIn'>
                                <div className="module_content"> 
                                    <h1>Ready to find out more?</h1>
                                    <p>We are near the release of our beta platform. Sign up now to be part of our first cohort of recruiters and&nbsp;employers</p>
                                </div>
                            </ScrollAnimation>
                        </div>
                        
                        <div className="sp_choose">
                            {!this.state.showSignUpButtons ? 
                                <div className="signUpBtnHome" onClick={this.showButtons}>Sign Up</div>
                            :  
                            <React.Fragment>
                                <div className="chooseText">Please choose:</div>
                                <Link to='signUpFormEmployer'><div className="signUpBtnHome signUpBtnChoose"><img src={empImg} alt="" align="middle" />Employer</div></Link>
                                <Link to='signUpFormRecruiter'><div className="signUpBtnHome signUpBtnChoose"><img src={recImg} alt="" align="middle" />Recruiter</div></Link>
                            </React.Fragment>
                            }  
                        </div>
                        
                    </div> 
                    <div style={{ height: '550px' }}></div>
                </Parallax> 
            
 
            </div>
        );
    }
}

export default LandingSection4;