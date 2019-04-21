import React, { Component } from "react";  
import './LandingSection4.css'; 
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

import empImg from "../../files/images/employer_pick.png";
import recImg from "../../files/images/recruiter_pick.png"; 

 
class LandingSection4 extends Component {
    constructor() {
        super();
		this.state = {
            showSignUpButtons: false,
        }; 
    }
    componentDidMount(){
        AOS.init({
          duration : 2000
        })
    }

    showButtons = () => { 
        this.setState({ showSignUpButtons: !this.state.showSignUpButtons })
    }
    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }
 
    render() { 

        return (
            <div className="landingSection4">   

                <div className="sp_parallax">
                    <div className="sp_contain">   
                        <div className="sp_text" data-aos='zoom-in' data-aos-offset="-500"> 
                            <h1>Ready to find out more?</h1>
                            <p>We are near the release of our beta platform. Sign up now to be part of our first cohort of recruiters and&nbsp;employers</p>
                        </div> 
                        <div className="sp_choose">
                            {!this.state.showSignUpButtons ? 
                                <div className="signUpBtnHome" onClick={this.showButtons}>Sign Up</div>
                            :  
                            <React.Fragment> 
                                <Link to='signUpFormEmployer'><div className="signUpBtnHome signUpBtnChoose"><img src={empImg} alt="" align="middle" />Employer</div></Link>
                                <Link to='signUpFormRecruiter'><div className="signUpBtnHome signUpBtnChoose"><img src={recImg} alt="" align="middle" />Recruiter</div></Link>
                            </React.Fragment>
                            }  
                        </div> 
                    </div>  
                </div>  

            </div>
        );
    }
}

export default LandingSection4;