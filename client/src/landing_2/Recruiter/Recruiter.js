import React, { Component } from "react"
import './Recruiter.scss'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Link } from 'react-router-dom' 
 
import whaleCool from "../../files/images/landingPage/whaleCool.png" 
 
class Recruiter extends Component {
    componentDidMount(){
        AOS.init({
          duration : 500
        })
    }
    render() {
        return ( 
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">For Recruiters</div> 
                
                <div className="recruiterContent"> 
                    <div className="titleText">
                        <div data-aos="fade-down">Hi there! I'm Migaloo,</div>
                        <div data-aos="fade-up">the whale of recruitment</div>
                    </div>
                    
                    <div className="paragraphContainer" data-aos="zoom-in" data-aos-offset="-200"> 
                        <div className="paragraph" data-aos="zoom-in-right">I'm here to help you save time & make more&nbsp;placements.</div>
                        <div className="paragraph" data-aos="zoom-in-left" data-aos-delay="250">Every great recruiter deserves a whale on their side who can add relevant, retained jobs to their&nbsp;pipeline.</div>
                        <div className="paragraph" data-aos="zoom-in-right" data-aos-delay="500">You will receive job reqs based on your specialization from top companies who desperately need your help but, who sadly don't have enough time to properly manage recruiter&nbsp;relationships.</div>
                    </div>
                        
                    <div className="center" data-aos="fade-in">
                        <div className="whaleCool"><img src={whaleCool} alt="" /></div> 
                        <div className="soundCoolContainer">
                            <div className="sc_Background" data-aos="fade-in">Sound cool?</div>
                        </div>
                    </div>

                    <div className="textBtm" data-aos="fade-in">
                        <div data-aos="fade-down">You're cordially invited to make an even bigger splash in your market.</div>
                        <div data-aos="fade-up">Join the whales of recruitment.</div>
                    </div> 
                    <Link to='signUpFormRecruiter'><div className="signUpBtnHome">Recruiter RSVP</div></Link>

                </div>

            </React.Fragment> 
        );
    }
}

export default Recruiter;