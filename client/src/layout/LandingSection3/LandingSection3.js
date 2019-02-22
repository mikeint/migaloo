import React, { Component } from "react";  
import './LandingSection3.css';
import { NavLink } from 'react-router-dom';
import ScrollAnimation from 'react-animate-on-scroll';  

class LandingSection3 extends Component {
  
    render() { 

        return (
            <div className="landingSection3">  



            
                {/* FOR DESKTOP - stacking properly */ }
                <div className="showOnDesktop">
                    <div className="module_wrapper mc_4">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}> 
                            <div className="module_img module_img1"></div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>  
                            <div className="module_content">
                                <h1>Sign up</h1>
                                <p>Employers sign up to post jobs exclusively to third-party recruiters. Recruiters sign up to gain access to jobs posted by employers seeking third-party recruitment services.</p>
                            </div>
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}> 
                            <div className="module_content">
                                <h1>Submit Profile</h1>
                                <p>Recruiters submit their top candidate profiles along with terms and conditions to relevant job postings</p>
                            </div> 
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}> 
                            <div className="module_img module_img2"></div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper mc_4">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}> 
                            <div className="module_img module_img3"></div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>  
                            <div className="module_content">
                                <h1>Review List</h1>
                                <p>Employer reviews the credit-based, organized list and picks the candidate(s) that they wish to move forward with based on their profile and the recruiters terms and conditions</p>
                            </div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}>  
                            <div className="module_content">
                                <h1>Engage</h1>
                                <p>Employer can reach out to the recruiter(s) they’ve chosen to engage based on their candidate profile submission and terms and conditions via our messaging app, email, or phone</p>
                            </div> 
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>  
                                <div className="module_img module_img4"></div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper greyBG">
                        <div className="animated_half">
                            <div className="module_content"> 
                                <h1>Ready to find out more?</h1>
                                <p>We are currently working towards finishing our plat- Sign Up form. Please sign up below to get word about when our FREE version launches. </p>
                            </div>
                        </div>
                        <div className="animated_half"> 
                            <NavLink to='/login'><div className="signUpBtnHome">Sign Up</div></NavLink> 
                        </div>
                    </div>
                </div>
                {/* end FOR DESKTOP - stacking properly */ }





                {/* FOR MOBILE - stacking properly*/ }
                <div className="showOnMobile">
                    <div className="module_wrapper mc_4">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}> 
                            <div className="module_img module_img1"></div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>  
                            <div className="module_content">
                                <h1>Sign up</h1>
                                <p>Employers sign up to post jobs exclusively to third-party recruiters. Recruiters sign up to gain access to jobs posted by employers seeking third-party recruitment services.</p>
                            </div>
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}>
                            <div className="module_img module_img2"></div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>
                            <div className="module_content">
                                <h1>Submit Profile</h1>
                                <p>Recruiters submit their top candidate profiles along with terms and conditions to relevant job postings</p>
                            </div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper mc_4">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}> 
                            <div className="module_img module_img3"></div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>  
                            <div className="module_content">
                                <h1>Review List</h1>
                                <p>Employer reviews the credit-based, organized list and picks the candidate(s) that they wish to move forward with based on their profile and the recruiters terms and conditions</p>
                            </div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}>  
                            <div className="module_img module_img4"></div>  
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>
                            <div className="module_content">
                                <h1>Engage</h1>
                                <p>Employer can reach out to the recruiter(s) they’ve chosen to engage based on their candidate profile submission and terms and conditions via our messaging app, email, or phone</p>
                            </div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper greyBG">
                        <div className="animated_half">
                            <div className="module_content"> 
                                <h1>Ready to find out more?</h1>
                                <p>We are currently working towards finishing our plat- Sign Up form. Please sign up below to get word about when our FREE version launches. </p>
                            </div>
                        </div>
                        <div className="animated_half">
                            <div className="module_content">
                                <NavLink to='/login'><div className="signUpBtnHome">Sign Up</div></NavLink>
                            </div>
                        </div>
                    </div>
                </div>
                {/* FOR MOBILE - stacking properly*/ }



 
            </div>
        );
    }
}

export default LandingSection3;