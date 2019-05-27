import React, { Component } from "react";  
import './Whale.css';  
import WhaleSpray from '../WhaleSpray/WhaleSpray';
import migaloo from "../../files/images/landingPage/whaleWs.png"

class Whale extends Component {
 
    render() { 
        return (
                <React.Fragment>
                    <div className="whaleContainer">
                        <img src={migaloo} alt="mig" />
                        <span className="whaleSpray"><WhaleSpray sprayColor={this.props.sprayColor}/></span>
                    </div>
                </React.Fragment>
        );
    }
}

export default Whale;