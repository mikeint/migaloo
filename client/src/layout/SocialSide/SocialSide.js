import React, {Component} from "react";
import './SocialSide.css';

import linkedInLogo from '../../files/images/landingPage/linkedin.png' ;
import slackLogo from '../../files/images/landingPage/slack.png' ;

class SocialSide extends Component {
    render() { 

    return (
            <div className="socialSideContainer">  
                <div className="icon-bar">
                    <a href="https://www.linkedin.com/in/miga-loo-67ab78181/" className="linkedin" target="_blank" rel="noopener noreferrer"><img src={linkedInLogo} alt="" /></a>
                    <a href="#" className="slack" target="_blank" rel="noopener noreferrer"><img src={slackLogo} alt="" /></a> 
                    {/*<a href="#" className="twitter">F</a>
                    <a href="#" className="google">F</a>
                    <a href="#" className="youtube">F</a> */}
                </div> 
            </div>
        );
    }
}

export default SocialSide;