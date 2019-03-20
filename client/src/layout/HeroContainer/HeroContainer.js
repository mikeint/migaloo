import React, { Component } from "react";  
import './HeroContainer.css'; 


let lastScrollY = 0;
class HeroContainer extends Component { 
 
    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleScroll);
    }
    
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleScroll);
    }

    handleScroll = () => {
        lastScrollY = window.scrollY;
        if (lastScrollY >= 0 && lastScrollY <= 500 && window.innerWidth > 1024) {
            document.getElementById("heroLayer1").style.backgroundPositionY = (lastScrollY*0.85+100)+"px";
            document.getElementById("heroLayer2").style.backgroundPositionY = (lastScrollY*0.65+260)+"px";
            document.getElementById("heroLayer3").style.backgroundPositionY = (lastScrollY*0.5+100)+"px";
        }   
        else if (lastScrollY >= 0 && lastScrollY <= 500) {
            document.getElementById("heroLayer1").style.backgroundPositionY = (lastScrollY*0.85+260)+"px";
            document.getElementById("heroLayer2").style.backgroundPositionY = (lastScrollY*0.65+270)+"px";
            document.getElementById("heroLayer3").style.backgroundPositionY = (lastScrollY*0.5+260)+"px";
        }
    } 

    render() {   
 
  

        return (
            <div className="heroContainer">   
                  <div id="heroLayer0" className="heroLayer"></div>
                  <div id="heroLayer1" className="heroLayer"></div>
                  <div id="heroLayer2" className="heroLayer"></div>
                  <div id="heroLayer3" className="heroLayer"></div> 
            </div>
        );
    }
}

export default HeroContainer;