import React, {Component} from "react";
import './SocialSide.css';

class SocialSide extends Component {
    render() { 

    return (
            <div className="socialSideContainer">  
                <div className="icon-bar">
                    <a href="#" className="facebook">F</a>
                    <a href="#" className="twitter">F</a>
                    <a href="#" className="google">F</a>
                    <a href="#" className="linkedin">F</a>
                    <a href="#" className="youtube">F</a>
                </div> 
            </div>
        );
    }
}

export default SocialSide;