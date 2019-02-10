import React, {Component} from "react";
import './SocialSide.css';

import linkedInLogo from '../../files/images/linkedin.png' ;

class SocialSide extends Component {
    render() { 

    return (
            <div className="socialSideContainer">  
                <div className="icon-bar">
                    <a href="https://www.linkedin.com/company/hireranked/about/" className="linkedin" target="_blank"><img src={linkedInLogo} alt="" /></a>
                    {/* <a href="#" className="facebook">F</a>
                    <a href="#" className="twitter">F</a>
                    <a href="#" className="google">F</a>
                    <a href="#" className="youtube">F</a> */}
                </div> 
            </div>
        );
    }
}

export default SocialSide;