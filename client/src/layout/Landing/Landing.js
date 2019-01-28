import React, { Component } from 'react'; 
import { Route, NavLink, BrowserRouter } from 'react-router-dom';

import './Landing.css';
import Footer from '../Footer/Footer'; 

import CarSaleSlider from '../CarSaleSlider/CarSaleSlider';
import CarSoldSlider from '../CarSoldSlider/CarSoldSlider';
import About from '../About/About'; 
import Contact from '../ContactPage/ContactPage'; 


class Landing extends Component {

	toggleMobileMenu = () => { 
		document.getElementById("nav-icon1").classList.remove("open");
		document.getElementById("side-menu").classList.remove("active-side-menu");
		window.scrollTo(0,0);
	}

	render() {
		return (
			<React.Fragment> 
				<div className="navbarContainer">
					<BrowserRouter>
						<div> 
							<div id="header">
								<NavLink to="/"><div id="logo"></div></NavLink>
								<div id="navBar">
									<li className="navBarA"><NavLink exact to="/">Home</NavLink></li>
									<li className="navBarA"><NavLink exact to="/carSoldSlider">Sold</NavLink></li>
									<li className="navBarA"><NavLink exact to="/about">About</NavLink></li>
									<li className="navBarA"><NavLink exact to="/contact">Contact</NavLink></li>
								</div>

								<div id="navBarMobile">
									<div id="nav-icon1">
										<span className="hmbSpanA"></span>
										<span className="hmbSpanA"></span>
										<span className="hmbSpanA"></span> 
									</div>
									<div className="side-menu" id="side-menu">
										<li><NavLink exact to="/" onClick={this.toggleMobileMenu}>Home</NavLink></li> 
										<li><NavLink exact to="/carSoldSlider" onClick={this.toggleMobileMenu}>Sold</NavLink></li>
										<li><NavLink exact to="/about" onClick={this.toggleMobileMenu}>About</NavLink></li>
										<li><NavLink exact to="/contact" onClick={this.toggleMobileMenu}>Contact</NavLink></li>
									</div>
								</div>
							</div>

							<div className="mainContent">  
								<Route exact path="/" component={CarSaleSlider} />
								<Route exact path="/carSoldSlider" component={CarSoldSlider} />
								<Route exact path="/about" component={About} />  
								<Route exact path="/contact" component={Contact} />  
							</div>
						</div>
					</BrowserRouter>
				</div> 
				<Footer />
				
			</React.Fragment>
		);
  	}
}

export default Landing;
