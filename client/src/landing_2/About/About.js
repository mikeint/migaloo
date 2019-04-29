import React, { Component } from "react";  
import './About.css';
import NavBar from "../components/NavBar/NavBar"
 
class About extends Component { 
    render() {
        return (
            <div className="lp2_container">
                <div className="lp2_menu">
                    <NavBar />
                </div>
                <div className="lp2_body">
                    About
                </div>
            </div>
        );
    }
}

export default About;