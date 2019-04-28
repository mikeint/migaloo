import React, { Component } from "react"
import './WhaleHead.css'
import WhaleSpray from '../../../components/Loader/Loader'
import whaleHead from "../../../files/images/landingPage/whaleHead.png"

class WhaleHead extends Component {
 
    render() { 
        return (
                <React.Fragment>
                    <div className="whaleHeadContainer">
                        <img src={whaleHead} alt="whaleHead" />
                        <span className="whaleHeadSpray"><WhaleSpray sprayColor={"#fff"}/></span>
                    </div>
                </React.Fragment>
        );
    }
}

export default WhaleHead;