import React, { Component } from "react";  
import './LandingSection3.css'; 
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
                                <p>Employers sign up to see a short list of vetted candidates from the top recruiters in their area. Recruiters sign up to gain access to exclusive job requisitions from employers anxious to win the war for&nbsp;talent.</p>
                            </div>
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper whiteBG">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}> 
                            <div className="module_content">
                                <h1>Submit Candidate</h1>
                                <p>Recruiters submit their most qualified candidate(s) for each requisition for&nbsp;review.</p>
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
                                <h1>ShortList</h1>
                                <p>The list of submissions from top recruiters is distilled by migaloo and organized into a shortlist that is then sent to the employer in an organized&nbsp;fashion.</p>
                            </div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper whiteBG">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}>  
                            <div className="module_content">
                                <h1>Engage</h1>
                                <p>Employer gives a “thumbs up” on candidate(s) from migaloo’s shortlist, subsequently opening their schedule up for interview times.  Recruiter is informed and next steps are organized through the concierge&nbsp;service.</p>
                            </div> 
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>  
                                <div className="module_img module_img4"></div> 
                        </ScrollAnimation>
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
                                <p>Employers sign up to post jobs exclusively to third-party recruiters. Recruiters sign up to gain access to jobs posted by employers seeking third-party recruitment&nbsp;services.</p>
                            </div>
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper whiteBG">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}>
                            <div className="module_img module_img2"></div>
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>
                            <div className="module_content">
                                <h1>Submit Profile</h1>
                                <p>Recruiters submit their top candidate profiles along with terms and conditions to relevant job&nbsp;postings</p>
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
                                <p>Employer reviews the credit-based, organized list and picks the candidate(s) that they wish to move forward with based on their profile and the recruiters terms and&nbsp;conditions</p>
                            </div> 
                        </ScrollAnimation>
                    </div>
                    <div className="module_wrapper whiteBG">
                        <ScrollAnimation animateIn='bounceInLeft' duration={1} animateOnce={true}>  
                            <div className="module_img module_img4"></div>  
                        </ScrollAnimation>
                        <ScrollAnimation animateIn='bounceInRight' duration={1} animateOnce={true}>
                            <div className="module_content">
                                <h1>Engage</h1>
                                <p>Employer can reach out to the recruiter(s) they’ve chosen to engage based on their candidate profile submission and terms and conditions via our messaging app, email, or&nbsp;phone</p>
                            </div> 
                        </ScrollAnimation>
                    </div> 
                </div>
                {/* FOR MOBILE - stacking properly*/ }
 
            </div>
        );
    }
}

export default LandingSection3;