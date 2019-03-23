import React, { Component } from "react";  
import './Whale.css';  
import WhaleSpray from '../Loader/Loader';

class Whale extends Component {
 
  
    render() { 
        return (
                <React.Fragment>
                    <div className="whaleContainer"><span className="migalooLogoText">Migaloo</span></div>
                    <span className="whaleSpray"><WhaleSpray sprayColor={this.props.sprayColor}/></span>
                </React.Fragment>
        );
    }
}

export default Whale;