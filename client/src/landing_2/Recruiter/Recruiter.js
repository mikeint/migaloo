import React, { Component } from "react";  
import './Recruiter.css';
import { Link } from 'react-router-dom';
import NavBar from "../components/NavBar/NavBar"
 
import whaleCool from "../../files/images/landingPage/whaleCool.png"; 
import recImg from "../../files/images/recruiter_pick.png"; 
 
class Recruiter extends Component { 
    render() {
        return ( 
            <div className="lp2_container">
                <div className="lp2_menu">
                    <NavBar />
                </div>
                <div className="lp2_body lp2_recruiter">
                    <div className="fywText">find.your.whale</div>

                    <div className="fullRecruiterText">
                        <div className="r1_Background r1_BackgroundLong">HI THERE ! I'M MIGALOO</div>
                        <div className="r1_Background r1_BackgroundShorter">THE WHALE OF RECRUITMENT</div>
                    </div>
                    
                    <div className="opacBackground">
                        <div className="flex">
                            <div className="flex r_para">
                                I'm here to help you save time & make more placements. 
                                I believe every great recruiter deserves 
                                a whale on their side who can who can add relevant, 
                                retained jobs to their pipeline. 
                            </div>
                            <div className="flex r_para">
                                I will Deliver job reqs based on your 
                                specialization from top companies who
                                desperatley need you help but, who sadly, 
                                dont have enough time to properly manage 
                                recruiter relationships.
                            </div>
                        </div>
 
                        <div className="flexCenter">
                            <div className="whaleCool">
                                <img src={whaleCool} alt="" />
                            </div> 
                            <div className="soundCool">
                                <div className="sc_Background">SOUND COOL?</div>
                            </div>
                        </div>

                        <div className="flex">
                            Im inviting you to make an even bigger splash in your market.<br/>
                            & join the whales of recruitment.
                        </div>
                        <div className="flex">
                            <Link to='signUpFormRecruiter'><div className="signUpBtnHome signUpBtnChoose"><img src={recImg} alt="" align="middle" />Recruiter Sign Up</div></Link>
                        </div>
                    </div>

                </div>
            </div> 
        );
    }
}

export default Recruiter;