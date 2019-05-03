import React, { Component } from "react"
import './Recruiter.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Link } from 'react-router-dom'
import NavBar from "../components/NavBar/NavBar"
 
import whaleCool from "../../files/images/landingPage/whaleCool.png"
import Spray from '../../components/Loader/Loader'
 
class Recruiter extends Component {

    componentDidMount(){
        AOS.init({
          duration : 500
        })
    }
    
    render() {
        return ( 
            <div className="lp2_container">
                <div className="lp2_menu">
                    <NavBar />
                </div>
                <div className="lp2_body lp2_recruiter">
                    <div className="fywText">for.recruiters</div>

                    <div className="fullRecruiterText">
                        <div className="r1_Background r1_BackgroundLong" data-aos="fade-right">HI THERE ! I'M MIGALOO</div>
                        <div className="r1_Background r1_BackgroundShorter" data-aos="fade-right">THE WHALE OF RECRUITMENT</div>
                    </div>
                    
                    <div className="recruiterContent">
                        <div className="flex">
                            <div className="flex r_para" data-aos="fade-right" data-aos-offset="-200">
                                I'm here to help you save time & make more placements. 
                                I believe every great recruiter deserves 
                                a whale on their side who can who can add relevant, 
                                retained jobs to their pipeline. 
                            </div>
                            <div className="flex r_para" data-aos="fade-left" data-aos-offset="-200">
                                I will Deliver job reqs based on your 
                                specialization from top companies who
                                desperatley need you help but, who sadly, 
                                dont have enough time to properly manage 
                                recruiter relationships.
                            </div>
                        </div>
 
                        <div className="flexCenter" data-aos="zoom-in">
                            <div className="whaleCool">
                                <img src={whaleCool} alt="" />
                            </div> 
                            <div className="soundCool">
                                <div className="sc_Background" data-aos="zoom-in">SOUND COOL?</div>
                            </div>
                        </div>

                        <div className="flex" data-aos="zoom-in">
                            Im inviting you to make an even bigger splash in your market.<br/>
                            & join the whales of recruitment.
                        </div>
                        <div className="flex">
                            <Link to='signUpFormRecruiter'><div className="signUpBtnHome">
                                <Spray sprayColor="#fff"/>Recruiter RSVP</div>
                            </Link>
                        </div>
                    </div>

                </div>
            </div> 
        );
    }
}

export default Recruiter;