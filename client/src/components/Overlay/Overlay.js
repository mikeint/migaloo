import React, { Component } from "react"; 
import "./Overlay.css";    

class Overlay extends Component {

    componentDidMount = () => { 
        //console.log("overlay loaded");
        //console.log(document.querySelector(".menu"))
        setTimeout(() => {
            this.toggleClassMenu();
        }, 100); 
    }

    toggleClassMenu() {
        //console.log(document.querySelector(".menu"))
        document.querySelector(".menu").classList.add("menu--animatable");	
        if(!document.querySelector(".menu").classList.contains("menu--visible")) {		
            document.querySelector(".menu").classList.add("menu--visible"); 
        } else {
            document.querySelector(".menu").classList.remove('menu--visible');
            setTimeout(() => { 
                this.props.callOverlay(); 
            }, 150);
        } 
    } 

    render() {
 
        const { config } = this.props;

        return (
            <React.Fragment>
                <div className="menu">
                    <div className={"app-menu "  + config.direction}>
                        <div className={"back " + config.backButtonLocation} onClick={this.toggleClassMenu.bind(this)}>x</div>  
                        {this.props.html} 
                    </div> 
                </div>
            </React.Fragment>
        );
    }
}
 
export default Overlay;