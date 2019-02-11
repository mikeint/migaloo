import React from 'react';
import './NavBar.css';  
import { Link } from 'react-router-dom'; 

import active_icon from '../../files/images/active_icon.svg';
import post_icon from '../../files/images/post_icon.svg';
import profile_icon from '../../files/images/profile_icon.svg';


class NavBar extends React.Component{
 
    render(){
        return (
            <React.Fragment> 

                <div id="navBar_admin"> 
                    <Link to="/activeJobs">
                    <div className="navBtn">
                            <img src={active_icon} alt="" />
                            <div className="navText">Active Jobs</div>
                        </div>
                    </Link>
                    <Link to="/postAJob">
                        <div className="navBtn">
                            <img src={post_icon} alt="" />
                            <div className="navText">Post a Job</div>
                        </div>
                    </Link>
                    <Link to="/profile">
                        <div className="navBtn">
                            <img src={profile_icon} alt="" />
                            <div className="navText">Profile</div>
                        </div>
                    </Link>


                </div>  
            </React.Fragment>
        );
    }
};

export default NavBar;
