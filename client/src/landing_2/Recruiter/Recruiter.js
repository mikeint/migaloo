import React, { Component } from "react";  
import './Recruiter.css';
import NavBar from "../components/NavBar/NavBar"
 
class Recruiter extends Component { 
    render() {
        return ( 
            <div className="lp2_container">
                <div className="lp2_menu">
                    <NavBar />
                </div>
                <div className="lp2_body">
                    Body
                </div>
            </div> 
        );
    }
}

export default Recruiter;