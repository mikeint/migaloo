import React, { Component } from "react"
import './Recruiter.css'
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
                
                <div className="lp2_recruiterContainer"> 

                    <div className="recruiterContent"> 
                        <div className="fullText">
                            <div data-aos="fade-down">Hi there ! I'm Migaloo,</div>
                            <div data-aos="fade-up">the whale of recruitment</div>
                        </div>
                        <div className="flex">
                            <div className="flex r_para" data-aos="zoom-in" data-aos-offset="-200">
                                I'm here to help you save time & make more placements. I believe every great recruiter deserves a whale on their side who can who can add relevant, 
                                retained jobs to their pipeline. I will Deliver job reqs based on your specialization from top companies who desperately need your help but, who sadly, 
                                don't have enough time to properly manage recruiter&nbsp;relationships.
                            </div>
                        </div>

                        <div className="flexCenter" data-aos="zoom-in">
                            <div className="whaleCool">
                                <img src={whaleCool} alt="" />
                            </div> 
                            <div className="soundCool">
                                <div className="sc_Background" data-aos="zoom-in">Sound cool?</div>
                            </div>
                        </div>

                        <div className="flex" data-aos="zoom-in">
                            I'm inviting you to make an even bigger splash in your market & join the whales of recruitment.
                        </div>
                        <div className="flex">
                            <Link to='signUpFormRecruiter'><div className="signUpBtnHome">Recruiter RSVP</div></Link>
                        </div>
                    </div>

                </div>
            </React.Fragment>
        );
    }
}

export default Recruiter;