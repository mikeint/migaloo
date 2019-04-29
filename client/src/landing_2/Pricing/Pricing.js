import React, { Component } from "react";  
import './Pricing.css';
import NavBar from "../components/NavBar/NavBar"
 
class Pricing extends Component { 
    render() {
        return (
            <div className="lp2_container">
                <div className="lp2_menu">
                    <NavBar />
                </div>
                <div className="lp2_body">
                    Pricing
                </div>
            </div>
        );
    }
}

export default Pricing;