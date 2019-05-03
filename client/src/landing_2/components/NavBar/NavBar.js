import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import './NavBar.css'

import Whale from '../../../components/Whale/Whale'
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
                    <NavLink to="/" className="whaleClick"><Whale {...whaleOptions}/></NavLink> 
 
                    <NavLink to="/employerPage" className="topSubItem">For Employers</NavLink>
                    <div className="subNavBox"> 
                        <NavLink to="/howItWorks_employer">How it works</NavLink>
                        <NavLink to="/pricing_employer">Pricing</NavLink>
                    </div>

                    <NavLink to="/recruiterPage" className="topSubItem">For Recruiters</NavLink>
                    <div className="subNavBox"> 
                        <NavLink to="/howItWorks_recruiter">How it works</NavLink>
                        <NavLink to="/pricing_recruiter">Pricing</NavLink>
                    </div>

                    <NavLink to="/contact" className="topSubItem">Contact</NavLink>
                    <NavLink to="/about" className="topSubItem">About</NavLink>
                    <NavLink to="/team" className="topSubItem">Team</NavLink> 



                </div>

                <div id="navBarMobile"> 
                    <NavLink to="/"><div className="whaleClick mobileWhaleContainer"><Whale {...whaleOptions}/></div></NavLink>
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
                        <NavLink to="/employerPage">For Employers</NavLink>
                        <NavLink to="/recruiterPage">For Recruiters</NavLink>
                        <NavLink to="/howItWorks">How it works</NavLink>
                        <NavLink to="/pricing">Pricing</NavLink>
                        <NavLink to="/contact">Contact</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/team">Team</NavLink>  
                    </div>
                </SwipeableDrawer> 
            </div> 
        ) 
  	}
}

export default NavBar;