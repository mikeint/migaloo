import React, { Component } from "react";  
import './Team.css'; 

import linkedInImg from '../../files/images/landingPage/linkedin.png'
import mailToImg from '../../files/images/landingPage/mailTo.png'
import phoneToImg from '../../files/images/landingPage/phoneTo.png'
 
class Team extends Component { 
    render() {
        return (
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">The Whales</div>
                <div className="lp2_teamContainer">
                    <div className="teamContent"> 
                        <div className="flex">
                            <div className="teamMember teamMember1"></div>
                            <div className="name">Michael Sansone</div>
                            <div className="title">CTO</div>
                            <div className="socialItems">
                                <img src={linkedInImg} alt="" />
                                <img src={mailToImg} alt="" />
                                <img src={phoneToImg} alt="" />
                            </div>
                        </div> 
                        <div className="flex">
                            <div className="teamMember teamMember2"></div>
                            <div className="name">Michael Nasser</div>
                            <div className="title">CEO</div>
                            <div className="socialItems">
                                <img src={linkedInImg} alt="" />
                                <img src={mailToImg} alt="" />
                                <img src={phoneToImg} alt="" />
                            </div>
                        </div> 
                        <div className="flex">
                            <div className="teamMember teamMember3"></div>
                            <div className="name">Michael Marcucci</div>
                            <div className="title">Lead Developer</div>
                            <div className="socialItems">
                                <img src={linkedInImg} alt="" />
                                <img src={mailToImg} alt="" />
                                <img src={phoneToImg} alt="" />
                            </div>
                        </div>
                    </div> 
                </div>
            </React.Fragment>
        );
    }
}

export default Team;