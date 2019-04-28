import React, { Component } from 'react'
import { Link } from 'react-router-dom'
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
                    <Link to="/"><div className="whaleClick"><Whale {...whaleOptions}/></div></Link>
                    {this.props.page}
                </div>

                <div id="navBarMobile"> 
                    <Link to="/"><div className="whaleClick mobileWhaleContainer"><Whale {...whaleOptions}/></div></Link>
                    <div id="nav-icon3" className={this.state.menuOpen ? "open" : ""} onClick={this.callAddOverlay}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div> 
                </div>

                <SwipeableDrawer
                    anchor="left" 
                    open={this.state.showOverlay}
                    onClose={()=>this.setState({"showOverlay":false, menuOpen: !this.state.menuOpen})}
                    onOpen={()=>this.setState({"showOverlay":true,  menuOpen: !this.state.menuOpen})}
                >  
                    <div className="side-menu">
                        some nav items here     
                    </div>
                </SwipeableDrawer> 
            </div> 
        ) 
  	}
}

export default NavBar;