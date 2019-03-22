import React, { Component } from 'react'; 
import { Link } from 'react-router-dom';
import './NavBar.css';

import WhaleSpray from '../../../components/Loader/Loader';

class NavBar extends Component {
   
    constructor(props) {
        super(props);
		this.state = {
            smallHeader: false,
            menuOpen: false,
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
    toggleMobileMenu = () => {
        this.setState({ menuOpen: !this.state.menuOpen }); 
        window.scrollTo(0,0);
    }
    toggleLandingMenu = () => { 
        this.setState({ menuOpen: !this.state.menuOpen }); 
    }

	render() {
		return (
			<React.Fragment>
                <div id="header" className={this.state.smallHeader ? "smallHeader" : ""}>

                <div id="navBar">
                    {this.props.page==="home" ?
                        <React.Fragment>  
                            <a href="#landingSection2"><li className="navBarA">Overview</li></a>
                            <a href="#landingSection3"><li className="navBarA">How it Works</li></a>
                            <a href="#contactSection"><li className="navBarA">Contact</li></a> 
                            <Link to='/about'><li className="navBarA">About</li></Link>
                        </React.Fragment> 
                    : 
                        <Link to='/' onClick={this.toggleMobileMenu}><li>Home</li></Link> 
                    }
                </div>

                <div id="navBarMobile">
                    <div id="nav-icon1" onClick={this.toggleLandingMenu} className={this.state.menuOpen ? "open" : ""}>
                        <span className="hmbSpanA"></span>
                        <span className="hmbSpanA"></span>
                        <span className="hmbSpanA"></span> 
                    </div>
                    <div id="side-menu" className={this.state.menuOpen ? "side-menu active-side-menu" : "side-menu"}> 
                        {this.props.page==="home" ?
                            <React.Fragment> 
                                <a href="#landingSection2" onClick={this.toggleMobileMenu}><li>Overview</li></a>
                                <a href="#landingSection3" onClick={this.toggleMobileMenu}><li>How it Works</li></a>
                                <a href="#contactSection" onClick={this.toggleMobileMenu}><li>Contact Us</li></a> 
                                <Link to='/about' onClick={this.toggleMobileMenu}><li>About</li></Link>
                            </React.Fragment> 
                        : 
                            <Link to='/' onClick={this.toggleMobileMenu}><li>Home</li></Link> 
                        }
                    </div>
                </div>
                
                <Link to='/'><div className="whaleContainer"><span className="migalooLogoText">Migaloo</span></div><span className="whaleSprayNavBar"><WhaleSpray/></span></Link>
            </div>
        </React.Fragment>
        ) 
  	}
}

export default NavBar;