import React, { Component } from "react"; 
import "./Overlay.css";
import Swipe from 'react-easy-swipe';

class Overlay extends Component {

    constructor() {
        super();
        this.state = {
            screenWidth: 0,
        }
    }

    componentDidMount = () => {  
        this.setState({screenWidth:window.innerWidth})
        setTimeout(() => {
            this.toggleClassMenu();
        }, 100); 
    }

    onSwipeStart(event) {
        console.log('Start swiping...', event);
    }
    
    onSwipeMove(position, event) {
        console.log(`Moved ${position.x} pixels horizontally`, event);
        console.log(`Moved ${position.y} pixels vertically`, event);
    }
    
    onSwipeEnd(event) {
        console.log('End swiping...', event);
    }

    toggleClassMenu() {
        //console.log(document.querySelector(".menu"))
        document.querySelector(".menu").classList.add("menu--animatable");	
        if(!document.querySelector(".menu").classList.contains("menu--visible")) {
            document.querySelector(".menu").classList.add("menu--visible");
            document.getElementById("root").classList.add("fixedRoot");
        } else {
            document.querySelector(".menu").classList.remove('menu--visible');
            setTimeout(() => {
                this.props.callOverlay();
            }, 150);
            document.getElementById("root").classList.remove("fixedRoot"); 
        } 
    } 

    render() {
 
        const { config } = this.props;

        return (
            <React.Fragment>
                <div className="menu"> 
                    <div className={"app-menu app-menu_"+config.direction}> 
                        {this.state.screenWidth > 1024 ?
                            <Swipe className={"swiper swiper_"+config.swipeLocation} onSwipeEnd={this.toggleClassMenu.bind(this)} onClick={this.toggleClassMenu.bind(this)}></Swipe> 
                        :
                            <Swipe className={"swiper swiper_"+config.swipeLocation} onSwipeEnd={this.toggleClassMenu.bind(this)}></Swipe> 
                        } 

                        {this.props.html}
                    </div> 
                </div>
            </React.Fragment>
        );
    }
}
 
export default Overlay;