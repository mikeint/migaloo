import React, { Component } from "react";  
import './Team.css';
import NavBar from "../components/NavBar/NavBar"
 
class Team extends Component { 
    render() {
        return (
            <div className="lp2_container">
                <div className="lp2_menu">
                    <NavBar />
                </div>
                <div className="lp2_body">
                    Team
                </div>
            </div>
        );
    }
}

export default Team;