import React, { Component } from "react"
import './HowItWorks.scss'
import AOS from 'aos'
import 'aos/dist/aos.css' 
 
class HowItWorks extends Component {

    componentDidMount(){
        AOS.init({
          duration : 500
        })
    }
    
    render() {
        return (
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">How It Works - Recruiter</div> 
                
                <div className="howItWorksRecruiter">  
        
                    {/* FOR DESKTOP - stacking properly */ }
                    <div className="showOnDesktop">
                        <div className="module_wrapper">
                            <div className="aos-animate"> 
                                <div className="module_img module_img1"></div>
                            </div> 
                            <div className="aos-animate">  
                                <div className="module_content">
                                    <h1>Sign up</h1>
                                    <p>Recruiter creates their profile which outlines details that help our system get to know&nbsp;them.</p>
                                </div>
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div className="aos-animate"> 
                                <div className="module_content">
                                    <h1>Add Candidate</h1>
                                    <p>Recruiter can proactively add profiles to their candidate pool (bank?).  This helps our system know which recruiters are best equipped to work on a given&nbsp;requisition.</p>
                                </div> 
                            </div>
                            <div className="aos-animate"> 
                                <div className="module_img module_img2"></div> 
                            </div>
                        </div>
                        <div className="module_wrapper">
                            <div className="aos-animate"> 
                                <div className="module_img module_img3"></div>
                            </div>
                            <div className="aos-animate">  
                                <div className="module_content">
                                    <h1>View Job Reqs</h1>
                                    <p>Get notified when jobs are added to your pipeline.  View the job profiles and let us know if you’re interested in helping us with the&nbsp;search.</p>
                                </div> 
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div className="aos-animate">  
                                <div className="module_content">
                                    <h1>Submit Candidate</h1>
                                    <p>Discuss the role with your qualified candidates and submit those that are&nbsp;interested.</p>
                                </div> 
                            </div>
                            <div className="aos-animate">  
                                    <div className="module_img module_img4"></div> 
                            </div>
                        </div>
                        <div className="module_wrapper">
                            <div className="aos-animate"> 
                                <div className="module_img module_img3"></div>
                            </div>
                            <div className="aos-animate">  
                                <div className="module_content">
                                    <h1>Management</h1>
                                    <p>With your expertise in the recruitment market, help move candidates through the employer’s recruitment process&nbsp;(interview preparation, interview feedback, offer management, etc.).</p>
                                </div> 
                            </div>
                        </div>
                    </div>
                    {/* end FOR DESKTOP - stacking properly */ }





                    {/* FOR MOBILE - stacking properly*/ }
                    <div className="showOnMobile">
                        <div className="module_wrapper">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img1"></div>
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>Sign up</h1>
                                    <p>Recruiter creates their profile which outlines details that help our system get to know&nbsp;them.</p>
                                </div>
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img2"></div>
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>Add Candidate</h1>
                                    <p>Recruiter can proactively add profiles to their candidate pool (bank?).  This helps our system know which recruiters are best equipped to work on a given&nbsp;requisition.</p>
                                </div> 
                            </div>
                        </div>
                        <div className="module_wrapper">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img3"></div>
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>View Job Reqs</h1>
                                    <p>Get notified when jobs are added to your pipeline.  View the job profiles and let us know if you’re interested in helping us with the&nbsp;search.</p>
                                </div> 
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img4"></div>  
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>Submit Candidate</h1>
                                    <p>Discuss the role with your qualified candidates and submit those that are&nbsp;interested.</p>
                                </div> 
                            </div>
                        </div> 
                        <div className="module_wrapper">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img3"></div>
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>Management</h1>
                                    <p>With your expertise in the recruitment market, help move candidates through the employer’s recruitment process&nbsp;(interview preparation, interview feedback, offer management, etc.).</p>
                                </div> 
                            </div>
                        </div>
                    </div>
                    {/* FOR MOBILE - stacking properly */ }

                </div> 
                 
            </React.Fragment>
        );
    }
}

export default HowItWorks;