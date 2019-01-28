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
                <header className="navbar">
                    <Link to="/hub"><div className="topTitle" onClick={this.resetCarId}>Hub</div></Link>
                    <ul>
                        <li><div className="admNavBtn" onClick={this.handleLogout}><a target="_blank">Log Out</a></div></li>
                        {this.props.deleteButton ? <li><div className="removeFullCarButton" onClick={this.props.deleteFullCar}>REMOVE CAR</div></li>: ""}
                        {!this.props.deleteButton ? 
                            <li><Link to="/newPage"><div className="admNavBtn">new Page</div></Link></li>
                            : 
                        ""}
                    </ul>
                </header>
            </React.Fragment>
        );
    }
};

export default NavBar;
