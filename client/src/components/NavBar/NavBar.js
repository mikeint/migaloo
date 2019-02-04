import React from 'react';
import './NavBar.css'; 
import { Redirect} from "react-router-dom";
import AuthFunctions from '../../AuthFunctions';
import { Link } from 'react-router-dom';
//import axios from 'axios';

import active_icon from '../../files/images/active_icon.svg';
import post_icon from '../../files/images/post_icon.svg';
import profile_icon from '../../files/images/profile_icon.svg';


class NavBar extends React.Component{

    constructor(props){
        super(props);
        this.state={
            logout: false, 
        }
        this.Auth = new AuthFunctions();
    }


    /* ...NAV BAR functions... */
    addTempCar = () => {
        console.log("newpage")
        /* var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }; 
        
        if (localStorage.getItem('car_id') === null) {
            axios.post('/api/cars/addCar_temp', "", config).then((res)=>{
                    console.log("temp car added to db and local: ", res.data);
                    localStorage.setItem('car_id', res.data._id);
            });
        } else {
            console.log("car_id already set"); 
        } */
    }

    handleLogout = () => {
        this.Auth.logout();
        this.setState({logout: true})
    } 
    /* ...NAV BAR functions... */


    render(){
        if(this.state.logout){
            return <Redirect to='/login'/>
        }
        return (
            <React.Fragment> 
                <div id="navBar_admin">
                    <li><Link to="/activeJobs"><div className="navBtn"><img src={active_icon} alt="" /><div className="navText">Active Jobs</div></div></Link></li>
                    <li><Link to="/postAJob"><div className="navBtn"><img src={post_icon} alt="" /><div className="navText">Post a Job</div></div></Link></li> 
                    <li><Link to="/profile"><div className="navBtn"><img src={profile_icon} alt="" /><div className="navText">Profile</div></div></Link></li> 
                    <li><div className="navBtn" onClick={this.handleLogout}><a target="_blank"><img src={profile_icon} alt="" /><div className="navText">Log Out</div></a></div></li>
                </div>  
            </React.Fragment>
        );
    }
};

export default NavBar;
