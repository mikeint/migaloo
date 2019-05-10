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
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">For Employers</div> 
                 
                <div className="employerContent"> 
                    <div className="titleText">
                        <div data-aos="fade-down">Hi there ! I'm Migaloo,</div>
                        <div data-aos="fade-up">the whale of recruitment</div>
                    </div>
                    <div className="paragraphContainer" data-aos="zoom-in" data-aos-offset="-200"> 
                        <div className="paragraph" data-aos="zoom-in-right">I believe that you agree that recruiters can add a ton (~50 tonnes in my case) of value for hard to find&nbsp;roles.</div>
                        <div className="paragraph" data-aos="zoom-in-left" data-aos-delay="250">I also understand that you are way too busy to manage external recruiter&nbsp;relationships.</div>
                        <div className="paragraph" data-aos="zoom-in-right" data-aos-delay="500">I give you access to top talent from a pool of vetted, specialized recruiters with one contract & one point of contact,&nbsp;always.</div>
                    </div>
                        
                    <div className="center" data-aos="fade-in">
                        <div className="whaleCool"><img src={whaleCool} alt="" /></div> 
                        <div className="soundCoolContainer">
                            <div className="sc_Background" data-aos="fade-in">Sound cool?</div>
                        </div>
                    </div>

                    <div className="textBtm" data-aos="fade-in">
                        <div data-aos="fade-down"> I'm inviting you to enter the managed marketplace</div>
                        <div data-aos="fade-up">for top talent & join the whales of&nbsp;recruitment </div>
                    </div> 
                    <Link to='signUpFormEmployer'><div data-aos="fade-up" className="signUpBtnHome">Employer RSVP</div></Link>

                </div>

            </React.Fragment>
        );
    }
}

export default Employer;