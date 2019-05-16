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
                <div className="fywText" data-aos="zoom-out-down">How It Works - Employers</div> 
                
                <div className="howItWorksEmployer">  
        
                    {/* FOR DESKTOP - stacking properly */ }
                    <div className="showOnDesktop">
                        <div className="module_wrapper">
                            <div className="aos-animate"> 
                                <div className="module_img module_img1"></div>
                            </div> 
                            <div className="aos-animate">  
                                <div className="module_content">
                                    <h1>Sign up</h1>
                                    <p>Create your profile which outlines details that help our system get to know you and your&nbsp;company.</p>
                                </div>
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div className="aos-animate"> 
                                <div className="module_content">
                                    <h1>Post Job</h1>
                                    <p>Take a couple of minutes to fill out a job profile and save to&nbsp;submit.</p>
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
                                    <h1>View Shortlist</h1>
                                    <p>Get notified when you’ve been sent a shortlist and let us know who you would like to&nbsp;interview.</p>
                                </div> 
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div className="aos-animate">  
                                <div className="module_content">
                                    <h1>Hired!</h1>
                                    <p>Allow us to work with recruiters to help manage candidates along your interview process (interview preparation, interview feedback, references, testing, etc.) so that you can be more&nbsp;efficient.</p>
                                </div> 
                            </div>
                            <div className="aos-animate">  
                                    <div className="module_img module_img4"></div> 
                            </div>
                        </div>
                    </div>
                    {/* end FOR DESKTOP - stacking properly */ }





                    {/* FOR MOBILE - stacking properly */ }
                    <div className="showOnMobile">
                        <div className="module_wrapper">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img1"></div>
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>Sign up</h1>
                                    <p>Create your profile which outlines details that help our system get to know you and your&nbsp;company.</p>
                                </div>
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img2"></div>
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>Post Job</h1>
                                    <p>Take a couple of minutes to fill out a job profile and save to&nbsp;submit.</p>
                                </div> 
                            </div>
                        </div>
                        <div className="module_wrapper">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img3"></div>
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>View Shortlist</h1>
                                    <p>Get notified when you’ve been sent a shortlist and let us know who you would like to&nbsp;interview.</p>
                                </div> 
                            </div>
                        </div>
                        <div className="module_wrapper whiteBG">
                            <div data-aos="fade-right"> 
                                <div className="module_img module_img4"></div>  
                            </div>
                            <div data-aos="fade-left"> 
                                <div className="module_content">
                                    <h1>Hired!</h1>
                                    <p>Allow us to work with recruiters to help manage candidates along your interview process (interview preparation, interview feedback, references, testing, etc.) so that you can be more&nbsp;efficient.</p>
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