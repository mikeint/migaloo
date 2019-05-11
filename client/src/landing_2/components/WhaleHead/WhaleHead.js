import React from "react"
import './WhaleHead.scss'
import WhaleSpray from '../../../components/Loader/Loader'
import whaleHead from "../../../files/images/landingPage/whaleHead.png"
 

const WhaleHead = () => 
    <div className="whaleHeadContainer">
        <img src={whaleHead} alt="whaleHead" />
        <span className="whaleHeadSpray"><WhaleSpray sprayColor={"#fff"}/></span>
    </div>

export default WhaleHead;