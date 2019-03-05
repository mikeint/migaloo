import React, { Component } from "react"; 
import "./Overlay.css";
import Swipe from 'react-easy-swipe';
import {isMobile} from 'react-device-detect';


class Overlay extends Component {

    constructor() {
        super();
        this.state = {
            screenWidth: 0,
            open: false
        }
    }

    componentDidMount = () => {  
        this.setState({screenWidth:window.innerWidth})
        setTimeout(() => {
            this.toggleClassMenu();
        }, 100); 
    }

    componentWillMount() {
        if(!document.getElementById("root").classList.contains("fixedRoot"))
            document.getElementById("root").classList.add("fixedRoot");  
    }
    componentWillUnmount() {
        if(document.getElementById("root").classList.contains("fixedRoot"))
            document.getElementById("root").classList.remove("fixedRoot");  
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
        // document.querySelector(".menu").classList.add("menu--animatable");	
        if(!this.state.open) {
            this.setState({open: true})
            // document.querySelector(".menu").classList.add("menu--visible");
            // document.getElementById("root").classList.add("fixedRoot"); 
        } else {
            // document.querySelector(".menu").classList.remove('menu--visible');
            this.setState({open: false}, () => {
                setTimeout(()=>{
                    if(this.props.handleClose)
                        this.props.handleClose();
                }, 150)
            })
            // , 150);
            // document.getElementById("root").classList.remove("fixedRoot");  
        } 
    } 

    render() {
 
        const { config } = this.props;

        return (
            <React.Fragment>
                <div className={this.state.open?"menu menu--animatable menu--visible":"menu menu--animatable"}> 
                    <div className={"app-menu app-menu_"+config.direction}> 

                        {isMobile ?
                            <Swipe className={"swiper swiper_"+config.swipeLocation} onSwipeEnd={this.toggleClassMenu.bind(this)}></Swipe> 
                        :
                            <Swipe className={"swiper swiper_"+config.swipeLocation} onSwipeEnd={this.toggleClassMenu.bind(this)} onClick={this.toggleClassMenu.bind(this)}></Swipe> 
                        } 

                        {this.props.html}
                    </div> 
                </div>
            </React.Fragment>
        );
    }
}
 
export default Overlay;