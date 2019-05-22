import React from "react";
import './Social.scss';

import linkedInLogo from '../../../files/images/landingPage/linkedin.png' ;
import slackLogo from '../../../files/images/landingPage/slack.png' ;
  
const Social = () => 
    <div className="socialContainer">  
        <div className="icon-bar">
            <a href="https://www.linkedin.com/company/migalooio/about/" className="linkedin" target="_blank" rel="noopener noreferrer"><img src={linkedInLogo} alt="" /></a>
           {/*  <a href="/" className="slack" target="_blank" rel="noopener noreferrer"><img src={slackLogo} alt="" /></a> */}
        </div> 
    </div>
 
export default Social;