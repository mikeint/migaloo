import React from 'react';
import './NavBar.css';  
import { NavLink } from 'react-router-dom';  
import active_icon from '../../../files/images/active_icon.png';
import post_icon from '../../../files/images/post_icon.png';
import profile_icon from '../../../files/images/profile_icon.png';


class NavBar extends React.Component{
    
    render(){
        return (
            <React.Fragment> 

                <div id="navBar_admin"> 
                    <div className="navbar_employer"> 
                        <NavLink to="/employer/activeJobs">
                            <div className="navBtn">
                                <img src={active_icon} alt="" />
                                <div className="navText">Active Jobs</div>
                            </div>
                        </NavLink>  
                        <NavLink to="/employer/postAJob">
                            <div className="navBtn">
                                <img src={post_icon} alt="" />
                                <div className="navText">Post a Job</div>
                            </div>
                        </NavLink>  
                        <NavLink to="/employer/profile">
                            <div className="navBtn">
                                <img src={profile_icon} alt="" />
                                <div className="navText">Profile</div>
                            </div>
                        </NavLink>
                    </div>

                </div>  
            </React.Fragment>
        );
    }
};

export default NavBar;
