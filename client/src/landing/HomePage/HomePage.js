import React, { Component } from "react";  
import './HomePage.css';
import Whale from '../../components/Whale/Whale'
 
class HomePage extends Component {  
    render() {
        const whaleOptions={whaleImg:'whaleBs.png', sprayColor:'#fff'};

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
                            <div className="hiText">Hi, im</div>
                            <div className="heroContentWhale"><Whale {...whaleOptions}/></div>
                        </div>
                        <div className="flex">
                            <p className="heroP paddingTop">An app connecting employers to passive&nbsp;talent.</p>
                        </div>
                        <div className="flex">
                            <p className="heroP">Lets get to know each&nbsp;other...</p>
                        </div> 
                        <div className="flex">
                            <p className="selectBtnContainer" onClick={() => this.props.selectPage("recruiter")}>Recruiter</p>
                            <p className="selectBtnContainer" onClick={() => this.props.selectPage("employer")}>Employer</p>
                        </div> 
                    </div>
                    
                </div> 
            </div>
        );
    }
}

export default HomePage;