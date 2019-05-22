import React, { Component } from 'react'
import { NavLink, withRouter } from 'react-router-dom';  
import './NavBar.scss' 
 
import Whale from '../../../components/Whale/Whale'
import Social from '../../components/Social/Social'
import tail from '../../../files/images/landingPage/tail.png' 
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
 
const navMappings = 
[  
    { 
        link:"/landing/employerPage/howItWorks_employer",
        title:"How It Works - Employers"
    },
    { 
        link:"/landing/recruiterPage/howItWorks_recruiter",
        title:"How It Works - Recruiters"
    },
    {
        link:"/landing/employerPage",
        title:"For Employers"
    },
    { 
        link:"/landing/recruiterPage",
        title:"For Recruiters"
    },
    { 
        link:"/landing/contact",
        title: "Contact Us"
    },
    { 
        link:"/landing/about",
        title: "About Us"
    },
    { 
        link:"/team",
        title: "The Whales"
    }
]


class NavBar extends Component {
   
    constructor(props) {
        super(props);
        const path = window.location.pathname; 
        const page = navMappings.findIndex(d=>path.startsWith(d.link));  
        console.log(page) 
		this.state = { 
            menuOpen: false,
            showOverlay:false,  
            page:page,
            title:"test"
        };
        const { history } = this.props;
        history.listen((location, action) => {
            const page = this.state.page;
            const path = location.pathname;
            const newPage = this.getNewPage(path) 
            console.log(navMappings[[newPage]].title)
             if(newPage !== page){
                this.setState({title: navMappings[[newPage]].title})
            }
        }); 
    }
 
    getNewPage(path){ 
        const page = navMappings.findIndex(d=>path.startsWith(d.link)) 
        if(page === -1)
            return 0
        return page;
    }
    getBasePath(path){
        const i = path.indexOf('/', 1);
        if(i === 0)
            return path;
        return path.slice(0, i);
    }   


    
    callAddOverlay = () => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ menuOpen: !this.state.menuOpen }); 
    }

	render() {
        const whaleOptions={whaleImg:'whaleWs.png', sprayColor:'#fff'};

		return ( 
            <div className="lp2_navBar">
                <div className="fywText" data-aos="zoom-out-down">{this.state.title}</div> 
            
                <div id="navBar">
                    <div className="topNavContainer">
                        <NavLink to="/"><Whale {...whaleOptions}/></NavLink>
                        <NavLink to="/landing/employerPage" className="topSubItem">For Employers</NavLink>
                        <div className="subNavBox"> 
                            <NavLink to="/landing/employerPage/howItWorks_employer">How it works</NavLink>
                            {/* <NavLink to="/employerPage/pricing_employer">Pricing</NavLink> */}
                        </div>
                        <NavLink to="/landing/recruiterPage" className="topSubItem">For Recruiters</NavLink>
                        <div className="subNavBox"> 
                            <NavLink to="/landing/recruiterPage/howItWorks_recruiter">How it works</NavLink>
                            {/* <NavLink to="/recruiterPage/pricing_recruiter">Pricing</NavLink> */}
                        </div>
                        <NavLink to="/landing/contact" className="topSubItem">Contact</NavLink>
                        <NavLink to="/landing/about" className="topSubItem">About</NavLink>
                        <NavLink to="/landing/team" className="topSubItem">Team</NavLink> 
                    </div>
                    <div className="bottomNavContainer">
                        <Social/>
                    </div>
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
                        <div className="topNavContainer">
                            <NavLink to="/landing/employerPage" onClick={this.callAddOverlay}>For Employers</NavLink>
                            <div className="subNavBox" onClick={this.callAddOverlay}> 
                                <NavLink to="/landing/employerPage/howItWorks_employer">How it works</NavLink>
                                {/* <NavLink to="/employerPage/pricing_employer">Pricing</NavLink> */}
                            </div>
                            <NavLink to="/landing/recruiterPage" onClick={this.callAddOverlay}>For Recruiters</NavLink>
                            <div className="subNavBox" onClick={this.callAddOverlay}> 
                                <NavLink to="/landing/recruiterPage/howItWorks_recruiter">How it works</NavLink>
                                {/* <NavLink to="/recruiterPage/pricing_recruiter">Pricing</NavLink> */}
                            </div>
                            
                            <NavLink to="/landing/contact" onClick={this.callAddOverlay}>Contact</NavLink>
                            <NavLink to="/landing/about" onClick={this.callAddOverlay}>About</NavLink>
                            <NavLink to="/landing/team" onClick={this.callAddOverlay}>Team</NavLink>
                        </div>

                        <div className="bottomNavContainer">
                            <Social/>
                        </div>
                    </div>
                </SwipeableDrawer> 

            </div> 
        ) 
  	}
} 

export default withRouter((NavBar));