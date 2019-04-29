import React, { Component } from "react";  
import './Contact.css';
import NavBar from "../components/NavBar/NavBar"
 
class Contact extends Component { 
    render() {
        return (
            <div className="lp2_container">
                <div className="lp2_menu">
                    <NavBar />
                </div>
                <div className="lp2_body">
                    Contact
                </div>
            </div>
        );
    }
}

export default Contact;