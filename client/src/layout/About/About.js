import React, { Component } from 'react';
import './About.css';
import { Parallax } from 'react-parallax';

import dellHero from '../../../public/images/hero3.jpg';


class About extends Component {
    render() {
        return (
            <React.Fragment>
                 <Parallax bgImage={dellHero} bgImageAlt="dellhero" strength={400}>  
                    {/* <div id="heroText" className="heroTextImage"></div> 
                    <div className="heroTextB"></div>  */}
                    <div style={{ height: '600px' }} />
                </Parallax> 

                
                <div className="aboutContainer">
                    <div className="aboutHeader">About Us</div>
                    <div className="carImage"></div>
                    <div className="aboutText">
                        We have been in business for many years and take pride in serving the Greater Toronto Area as well as the rest of Canada. 
                        Each of our employees understand that taking time to find the perfect car is essential. 
                        Every person needs to take into consideration many needs before finally making that large purchasing decision. Our employees are patient, <i>kind</i>, and <i>considerate</i>, and <i>motivated</i> to find you the car that best suits you! 
                        Dell Fine Cars is a proud member of the <b>UCDA</b> (Used Car Dealers Association of Ontario).<br/><br/>
                        All of our staff members are <b>OMVIC</b> (Ontario Motor Vehicle Industry Council) trained and certified.
                        Our customers can buy with confidence, knowing that we are an Ontario Registered Dealer.
                    </div>
                    <div className="aboutRating">
                        <div className="linkButton">
                            <a href="http://www.dealerrater.ca/dealer/Dell-Fine-Cars-review-104999/" target="_blank">Ratings</a>
                        </div>
                    </div>
                </div> 
        
            </React.Fragment>
        );
    }
}

export default About;