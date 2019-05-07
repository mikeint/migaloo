import React, { Component } from "react";  
import './Iphone.css' 
class Iphone extends Component {
 
    render() { 
        return (
            <div className="iphone">
                <div className="iphone-top">
                    <span className="camera"></span>
                    <span className="sensor"></span>
                    <span className="speaker"></span>
                </div>
                <div className="top-bar"></div>
                <div className="iphone-screen">
                    <img src={this.props.image} alt=""/>
                </div>
                <div className="buttons">
                    <span className="on-off"></span>
                    <span className="sleep"></span>
                    <span className="up"></span>
                    <span className="down"></span>
                </div>
                <div className="bottom-bar"></div>
                <div className="iphone-bottom">
                    <span></span>
                </div>
            </div>   
        );
    }
}

export default Iphone;