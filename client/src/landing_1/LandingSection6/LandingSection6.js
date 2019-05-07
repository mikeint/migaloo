import React, { Component } from "react";  
import './LandingSection6.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { Link } from 'react-router-dom';
import empImg from "../../files/images/landingPage/employer_pick.png";
import recImg from "../../files/images/landingPage/recruiter_pick.png"; 

 
class LandingSection6 extends Component {
    constructor() {
        super();
		this.state = {
            showSignUpButtons: false,
        }; 
    }

    componentDidMount(){
        AOS.init({
          duration : 1000
        })
    }

    showButtons = () => { 
        this.setState({ showSignUpButtons: !this.state.showSignUpButtons })
    }
  
    render() {  
        return (
            <div className="landingSection6">   
                <div className="calloutSectionMid">
                    <div className="calloutSectionText1">What makes Migaloo special?</div>
                    <div className="coImg_container">

                        <div className="full_COsection">
                            <div className="co_section" data-aos='flip-up' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-200" data-aos-delay="100">
                                <div className="calloutImg"></div>
                                <p>Managing recruiters and employers with better results</p>
                            </div>
                            <div className="co_section" data-aos='flip-down' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-200" data-aos-delay="300">
                                <div className="calloutImg"></div>
                                <p>Providing expert tech knowledge</p>
                            </div>
                        </div>
                        <div className="full_COsection">
                            <div className="co_section" data-aos='flip-up' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-200" data-aos-delay="200">
                                <div className="calloutImg"></div>
                                <p>Filtering best candidates for you</p>
                            </div>
                            <div className="co_section" data-aos='flip-down' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-200" data-aos-delay="400">
                                <div className="calloutImg"></div>
                                <p>No need for unnecessary phone calls</p>
                            </div>
                        </div> 
                    </div>

                    <div className="calloutSectionText2">A place where team dynamic fits</div>
                    <div className="calloutSectionText3">Register now for early access</div>

                    <div className="sp_choose">
                        {!this.state.showSignUpButtons ? 
                            <div className="signUpBtnHome" data-aos='zoom-in' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-100" data-aos-delay="300" onClick={this.showButtons}>Sign Up</div>
                        :  
                        <React.Fragment> 
                            <Link to='signUpFormEmployer'><div className="signUpBtnHome signUpBtnChoose"><img src={empImg} alt="" align="middle" />Employer</div></Link>
                            <Link to='signUpFormRecruiter'><div className="signUpBtnHome signUpBtnChoose"><img src={recImg} alt="" align="middle" />Recruiter</div></Link>
                        </React.Fragment>
                        }  
                    </div> 


                </div>
            </div>
        );
    }
}

export default LandingSection6;