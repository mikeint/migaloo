import React, { Component } from "react"
import './Employer.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Link } from 'react-router-dom'

import whaleCool from "../../files/images/landingPage/whaleCool.png" 
 
class Employer extends Component {
    componentDidMount(){
        AOS.init({
          duration : 500
        })
    }
    render() {
        return ( 
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">For Employers</div> 
                
                <div className="lp2_employerContainer">  
                    <div className="employerContent"> 
                        <div className="fullText">
                            <div data-aos="fade-down">Hi there ! I'm Migaloo,</div>
                            <div data-aos="fade-up">the whale of recruitment</div>
                        </div>
                        <div className="flex">
                            <div className="flex r_para" data-aos="zoom-in" data-aos-offset="-200">
                                <div className="flex_paragraph" data-aos="zoom-in" data-aos-delay="500">I believe that you agree that recruiters can add a ton (~50 tonnes in my case) of value for hard to find&nbsp;roles.</div>
                                <div className="flex_paragraph" data-aos="zoom-in" data-aos-delay="1000">I also understand that you are way too busy to manage external recruiter&nbsp;relationships.</div>
                                <div className="flex_paragraph" data-aos="zoom-in" data-aos-delay="1500">I give you access to top talent from a pool of vetted, specialized recruiters with one contract & one point of contact,&nbsp;always.</div>
                            </div>
                        </div>
                         
                        <div className="flexCenter" data-aos="fade-in">
                            <div className="whaleCool">
                                <img src={whaleCool} alt="" />
                            </div> 
                            <div className="soundCool">
                                <div className="sc_Background" data-aos="fade-in">Sound cool?</div>
                            </div>
                        </div>

                        <div className="flex" data-aos="fade-in">
                            I'm inviting you to enter the managed marketplace for top talent & join the whales of&nbsp;recruitment 
                        </div>
                        <div className="flex" data-aos="fade-up">
                            <Link to='signUpFormEmployer'><div className="signUpBtnHome">Employer RSVP</div></Link>
                        </div>
                    </div>

                </div>
            </React.Fragment>
        );
    }
}

export default Employer;