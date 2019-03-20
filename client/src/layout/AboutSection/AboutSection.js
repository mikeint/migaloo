import React, { Component } from "react";  
import './AboutSection.css'; 

class AboutSection extends Component {
  
    render() { 

        return (
            <div className="aboutSection">  
                <div className="third">
                    <div className="content_container"> 
                        <div id="f1_container">
                            <div id="f1_card" className="shadow">
                                <div className="front teamFace img1"> 
                                </div>
                                <div className="back teamFace center">
                                </div>
                            </div>
                        </div>
                        <div className="name">Michael Sansone</div>
                        <div className="title">CTO</div>
                    </div>
                </div>
                <div className="third">
                    <div className="content_container">   
                        <div id="f1_container">
                            <div id="f1_card" className="shadow">
                                <div className="front teamFace img2"> 
                                </div>
                                <div className="back teamFace center"> 
                                </div>
                            </div>
                        </div>
                        <div className="name">Michael Nasser</div>
                        <div className="title">CEO</div>
                    </div>
                </div>
                <div className="third">
                    <div className="content_container">   
                        <div id="f1_container">
                            <div id="f1_card" className="shadow">
                                <div className="front teamFace img3">  
                                </div>
                                <div className="back teamFace center"> 
                                </div>
                            </div>
                        </div>
                        <div className="name">Michael Marcucci</div>
                        <div className="title">CTO</div>
                    </div>
                </div> 
            </div>
        );
    }
}

export default AboutSection;