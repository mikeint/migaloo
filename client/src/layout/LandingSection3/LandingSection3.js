import React, { Component } from "react";  
import './LandingSection3.css';
import { NavLink } from 'react-router-dom';
import ScrollAnimation from 'react-animate-on-scroll'; 
 
import carouselImg3 from '../../files/images/landingPage/carousel-3.png'; 
import carouselImg4 from '../../files/images/landingPage/carousel-4.png'; 
import carouselImg5 from '../../files/images/landingPage/carousel-5.png'; 
import carouselImg6 from '../../files/images/landingPage/carousel-6.png';   

class LandingSection3 extends Component {
  
    render() { 

        return (
            <div className="landingSection3">  
                    <div className="module_wrapper mc_4">
                        <ScrollAnimation animateIn='bounceInLeft' duration={2} animateOnce={true}> 
                            <div className=""> 
                                <img src={carouselImg6} alt="" /> 
                            </div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={2} animateOnce={true}> 
                            <div className="moduleText">
                                <div className="module_content">
                                    <h1>Sign up</h1>
                                    <p>Employers sign up to post jobs exclusively to third-party recruiters. Recruiters sign up to gain access to jobs posted by employers seeking third-party recruitment services.</p>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>
                 
                    <div className="module_wrapper">
                        <ScrollAnimation animateIn='bounceInLeft' duration={3} animateOnce={true}>
                            <div className="moduleText">
                                <div className="module_content">
                                    <h1>Submit Profile</h1>
                                    <p>Recruiters submit their top candidate profiles along with terms and conditions to relevant job postings</p>
                                </div>
                            </div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={3} animateOnce={true}>
                            <div className=""> 
                                <img src={carouselImg5} alt="" /> 
                            </div>
                        </ScrollAnimation>
                    </div>  
                    <div className="module_wrapper mc_4">
                        <ScrollAnimation animateIn='bounceInLeft' duration={3} animateOnce={true}> 
                            <div className="">    
                                <img src={carouselImg3} alt="" /> 
                            </div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={3} animateOnce={true}> 
                            <div className="moduleText">
                                <div className="module_content">
                                    <h1>Review List</h1>
                                    <p>Employer reviews the credit-based, organized list and picks the candidate(s) that they wish to move forward with based on their profile and the recruiters terms and conditions</p>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div> 
                    <div className="module_wrapper">
                        <ScrollAnimation animateIn='bounceInLeft' duration={3} animateOnce={true}> 
                            <div className="moduleText"> 
                                <div className="module_content">
                                    <h1>Engage</h1>
                                    <p>Employer can reach out to the recruiter(s) they’ve chosen to engage based on their candidate profile submission and terms and conditions via our messaging app, email, or phone</p>
                                </div>
                            </div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={3} animateOnce={true}> 
                            <div className=""> 
                                <img src={carouselImg4} alt="" /> 
                            </div>
                        </ScrollAnimation>
                    </div>
                <div className="module_wrapper greyBG">
                    <div className="module_half moduleText">
                        <div className="module_content"> 
                            <h1>Ready to find out more?</h1>
                            <p>We are currently working towards finishing our plat- Sign Up form. Please sign up below to get word about when our FREE version launches. </p>
                        </div>
                    </div>
                    <div className="homeBtnContainer"> 
                        <NavLink to='/login'><div className="signUpBtnHome">Sign Up</div></NavLink> 
                    </div>
                </div>
            </div>
        );
    }
}

export default LandingSection3;