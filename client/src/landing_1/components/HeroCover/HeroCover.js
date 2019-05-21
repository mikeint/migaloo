import React, { Component } from 'react';  
import './HeroCover.css'; 
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

import empImg from "../../../files/images/landingPage/employer_pick.png";
import recImg from "../../../files/images/landingPage/recruiter_pick.png"; 

import Whale from '../../../components/Whale/Whale'; 

class HeroCover extends Component {
   
    constructor(props) {
        super(props);
		this.state = { 
        };
    }
    componentDidMount(){
        AOS.init({
          duration : 500
        })
    }
 
	render() {
        const whaleOptions={whaleImg:'whaleWs.png', sprayColor:'#fff'};

		return ( 
            <div className="heroCoverContain"> 

                <div className="hc_left">
                    <Whale {...whaleOptions}/>
                    <div className="hc_text1" data-aos='zoom-in'>
                        For a managed marketplace<br/>Join the whales of recruitment.
                    </div>
                    <div className="hc_text2" data-aos='zoom-in'>
                        Finally, talent first. Reinventing recruitment <br/>to achieve an easy hiring process.
                    </div> 
                </div> 
 
                <div className="hc_right">
 
                    <div className="hc_text3" data-aos='zoom-in'>
                        Sign Up now to get early access
                    </div> 
 
                    <div className="sp_choose"> 
                        <Link to='signUpFormEmployer'><div className="signUpBtnHome signUpBtnChoose"><img src={empImg} alt="" align="middle" />Employer</div></Link>
                        <Link to='signUpFormRecruiter'><div className="signUpBtnHome signUpBtnChoose"><img src={recImg} alt="" align="middle" />Recruiter</div></Link>
                    </div>  
                </div>

            </div> 
        ) 
  	}
}

export default HeroCover;