import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import './NavBar.css' 

import Whale from '../../../components/Whale/Whale'
import tail from '../../../files/images/landingPage/tail.png' 
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'

class NavBar extends Component {
   
    constructor(props) {
        super(props);
		this.state = { 
            menuOpen: false,
            showOverlay:false, 
        };
    }

    callAddOverlay = () => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ menuOpen: !this.state.menuOpen }); 
    }

	render() {
        const whaleOptions={whaleImg:'whaleWs.png', sprayColor:'#fff'};

		return ( 
            <div className="lp2_navBar"> 
            
                <div id="navBar">
                    <NavLink to="/"><Whale {...whaleOptions}/></NavLink> 
 
                    <NavLink to="/employerPage" className="topSubItem">For Employers</NavLink>
                    <div className="subNavBox"> 
                        <NavLink to="/employerPage/howItWorks_employer">How it works</NavLink>
                        <NavLink to="/employerPage/pricing_employer">Pricing</NavLink>
                    </div>

                    <NavLink to="/recruiterPage" className="topSubItem">For Recruiters</NavLink>
                    <div className="subNavBox"> 
                        <NavLink to="/recruiterPage/howItWorks_recruiter">How it works</NavLink>
                        <NavLink to="/recruiterPage/pricing_recruiter">Pricing</NavLink>
                    </div>

                    <NavLink to="/landing/contact" className="topSubItem">Contact</NavLink>
                    <NavLink to="/landing/about" className="topSubItem">About</NavLink>
                    <NavLink to="/landing/team" className="topSubItem">Team</NavLink> 



                </div>

                <div id="navBarMobile"> 
                    <NavLink to="/"><div className="mobileWhaleContainer"><img src={tail} alt="tail" /></div></NavLink>
                    <div id="nav-icon3" className={this.state.menuOpen ? "open" : ""} onClick={this.callAddOverlay}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div> 
                </div>

                <SwipeableDrawer
                    anchor="left" 
                    className="navBarMobileItem"
                    open={this.state.showOverlay}
                    onClose={()=>this.setState({"showOverlay":false, menuOpen: !this.state.menuOpen})}
                    onOpen={()=>this.setState({"showOverlay":true,  menuOpen: !this.state.menuOpen})}
                >  
                    <div className="side-menu">
                        <NavLink to="/employerPage" onClick={this.callAddOverlay}>For Employers</NavLink>
                        <div className="subNavBox" onClick={this.callAddOverlay}> 
                            <NavLink to="/employerPage/howItWorks_employer">How it works</NavLink>
                            <NavLink to="/employerPage/pricing_employer">Pricing</NavLink>
                        </div>
                        <NavLink to="/recruiterPage" onClick={this.callAddOverlay}>For Recruiters</NavLink>
                        <div className="subNavBox" onClick={this.callAddOverlay}> 
                            <NavLink to="/recruiterPage/howItWorks_recruiter">How it works</NavLink>
                            <NavLink to="/recruiterPage/pricing_recruiter">Pricing</NavLink>
                        </div>
                        
                        <NavLink to="/landing/contact" onClick={this.callAddOverlay}>Contact</NavLink>
                        <NavLink to="/landing/about" onClick={this.callAddOverlay}>About</NavLink>
                        <NavLink to="/landing/team" onClick={this.callAddOverlay}>Team</NavLink>  
                    </div>
                </SwipeableDrawer> 
            </div> 
        ) 
  	}
}

export default NavBar;