import React from 'react';
import './NavBar.css'; 
import { Redirect} from "react-router-dom";
import AuthFunctions from '../../AuthFunctions';
import { Link } from 'react-router-dom';
//import axios from 'axios';

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
    resetCarId = () => {
        localStorage.removeItem('car_id');
    }
    /* ...NAV BAR functions... */


    render(){
        if(this.state.logout){
            return <Redirect to='/login'/>
        }
        return (
            <React.Fragment> 
                <div id="navBar_admin">
                    <li><Link to="/newPage1"><div className="admNavBtn">Page1</div></Link></li>
                    <li><Link to="/newPage2"><div className="admNavBtn">Page2</div></Link></li>
                    <li><Link to="/newPage3"><div className="admNavBtn">Page3</div></Link></li> 
                    <li><div className="admNavBtn" onClick={this.handleLogout}><a target="_blank">Log Out</a></div></li>
                </div>  
            </React.Fragment>
        );
    }
};

export default NavBar;
