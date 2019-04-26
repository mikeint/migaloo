import React, { Component } from "react";  
import './MainPage.css';
import NavBar from "../components/NavBar/NavBar"
 
class MainPage extends Component { 
    render() {
        return (
            <div className="lp2_MainPage"> 
            
                <div className="container">
                    <div className="menu"><NavBar page={this.props.page} selectPage={this.props.selectPage} /></div>
                    <div className="body">Body {this.props.page}</div>
                </div>
 
            </div>
        );
    }
}

export default MainPage;