import React, { Component } from "react"
import './Employer.scss'
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
            <div className="employerContent"> 
                <div className="titleText">
                    <div data-aos="fade-down">Hi there! I'm Migaloo,</div>
                    <div data-aos="fade-up">the whale of recruitment</div>
                </div>
                
                <div className="paragraphContainer" data-aos="zoom-in" data-aos-offset="-200"> 
                    <div className="paragraph" data-aos="zoom-in-right">Do you agree that recruiters can add a ton (~50 tonnes in my case) of value for hard-to-fill&nbsp;roles?</div> 
                    <div className="paragraph" data-aos="zoom-in-left" data-aos-delay="250">But aren't you way too busy to manage external recruiter&nbsp;relationships?</div>
                    <div className="paragraph" data-aos="zoom-in-right" data-aos-delay="500">Allow me to take some work off your plate and give you access to top talent from a pool of vetted, specialized recruiters with one contract & one point of contact (me),&nbsp;always.</div>
                </div>
                    
                <div className="center" data-aos="fade-in">
                    <div className="whaleCool"><img src={whaleCool} alt="" /></div> 
                    <div className="soundCoolContainer">
                        <div className="sc_Background" data-aos="fade-in">Sound cool?</div>
                    </div>
                </div>

                <div className="textBtm" data-aos="fade-in">
                    <div data-aos="fade-down">You're cordially invited to enter into the managed marketplace for top&nbsp;talent.</div>
                    <div data-aos="fade-up">Join the whales of recruitment.</div>
                </div> 
                <Link to='/landing/signUpFormEmployer'><div data-aos="fade-up" className="signUpBtnHome">Employer RSVP</div></Link>

            </div> 
        );
    }
}

export default Employer;