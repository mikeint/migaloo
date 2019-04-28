import React, { Component } from "react"
import './Landing.css'
import { Link } from "react-router-dom"
import WhaleHead from '../components/WhaleHead/WhaleHead'
 
class Landing extends Component {  
    render() {

        return (
            <div className="lp2_HomePage">
            
                <div className="HomePage">
                    <div className="heroAnimation">
                        <div id="heroLayer0" className="heroLayer"></div>
                        <div id="heroLayer1" className="heroLayer"></div>
                        <div id="heroLayer2" className="heroLayer"></div>
                        <div id="heroLayer3" className="heroLayer"></div> 
                    </div>
 
                    <div className="heroContent">
                        <div className="flex">
                            <div className="hiText">Hi, im Migaloo.</div>
                            <div className="heroContentWhale"><WhaleHead sprayColor='#fff'/></div>
                        </div>
                        <div className="flex">
                            <p className="heroP paddingTop">An app connecting employers to passive&nbsp;talent.</p>
                        </div>
                        <div className="flex">
                            <p className="heroP paddingBottom">Lets get to know each&nbsp;other...</p>
                        </div> 
                        <div className="flex">
                            <Link to="/recruiterPage"><div className="selectBtnContainer">Recruiter</div></Link>
                            <Link to="/employerPage"><div className="selectBtnContainer">Employer</div></Link>
                        </div> 
                    </div>
                    
                </div> 
            </div>
        );
    }
}

export default Landing;