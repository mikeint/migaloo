import React, { Component } from 'react'; 
import { Link } from 'react-router-dom';
import './NavBar.css';

import Whale from '../../../components/Whale/Whale';

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

class NavBar extends Component {
   
    constructor(props) {
        super(props);
		this.state = {
            smallHeader: false,
            menuOpen: false,
            showOverlay:false, 
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    } 
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }
    handleScroll = () => {  
        this.setState({ smallHeader: window.pageYOffset > 0 });
    }  
 
    callAddOverlay = () => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ menuOpen: !this.state.menuOpen }); 
    }

	render() {
        const whaleOptions={whaleImg:'whaleWs.png', sprayColor:'#546f82'};

		return (
			<React.Fragment>
                <div id="header" className={this.state.smallHeader ? "smallHeader" : ""}>

                <div id="navBar">
                    {this.props.page==="home" ?
                        <React.Fragment>  
                            {/* <a href="#landingSection2"><li className="navBarA">Overview</li></a> */}
                            <a href="#landingSection3"><li className="navBarA">How it Works</li></a>
                            {/* <a href="#contactSection"><li className="navBarA">Contact us</li></a>  */}
                            <Link to='/about'><li className="navBarA">About</li></Link>
                            <a href="#landingSection4"><li className="navBarA">Sign Up</li></a>
                        </React.Fragment> 
                    : 
                        <Link to='/' onClick={this.callAddOverlay}><li>Home</li></Link> 
                    }
                </div>

                <div id="navBarMobile" onClick={this.callAddOverlay}>
                    <div id="nav-icon1" className={this.state.menuOpen ? "open" : ""}>
                        <span className="hmbSpanA"></span>
                        <span className="hmbSpanA"></span>
                        <span className="hmbSpanA"></span> 
                    </div> 
                </div>


                <SwipeableDrawer
                    anchor="left" 
                    open={this.state.showOverlay}
                    onClose={()=>this.setState({"showOverlay":false, menuOpen: !this.state.menuOpen})}
                    onOpen={()=>this.setState({"showOverlay":true,  menuOpen: !this.state.menuOpen})}
                >  
                    <div className="side-menu">
                        {this.props.page==="home" ?
                            <React.Fragment>
                                {/* <a href="#landingSection2" onClick={this.callAddOverlay}><li>Overview</li></a> */}
                                <a href="#landingSection3" onClick={this.callAddOverlay}><li>How it Works</li></a>
                                {/* <a href="#contactSection" onClick={this.callAddOverlay}><li>Contact Us</li></a>  */}
                                <Link to='/about' onClick={this.callAddOverlay}><li>About</li></Link>
                                <a href="#landingSection4" onClick={this.callAddOverlay}><li>Sign Up</li></a>
                            </React.Fragment>
                            : 
                            <React.Fragment>
                                <Link to='/' onClick={this.callAddOverlay}><li>Home</li></Link> 
                            </React.Fragment>
                        }
                        </div>
                </SwipeableDrawer>


                <Link to='/'><Whale {...whaleOptions}/></Link>
            </div>
        </React.Fragment>
        ) 
  	}
}

export default NavBar;