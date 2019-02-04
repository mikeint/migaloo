import React from 'react';
import './ActiveJobs.css';  
import AuthFunctions from '../../AuthFunctions';
import { Redirect } from 'react-router-dom';
//import axios from 'axios';
import NavBar from '../../components/NavBar/NavBar';

class ActiveJobs extends React.Component{

    constructor(){
        super();
        this.state={ 
            logout: false, 
            searchTerm: '', 
            user: '',
            profile: '',
        }
        this.Auth = new AuthFunctions();
    } 

    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() });
        this.setState({ profile: this.Auth.getProfile() });
    }
  
    render(){ 
        if(this.state.logout){ 
            return <Redirect to='/login'/>
        }

        var listItem = "empty"; 

        return (
            <React.Fragment>
                <NavBar />
                <div className="userInfo">
                    <div className="userInfo_name">Name: {this.state.user.name}</div>
                    <div className="userInfo_email">Email:{this.state.user.email}</div>
                    <div className="userInfo_email">Type:{this.state.profile.type}</div> 
                </div> 
                <div className='mainContainer'>
                    Active Jobs
                    {listItem === "notEmpty" ? "" : <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>}
                </div> 
            </React.Fragment>
        );
    }
};

export default ActiveJobs;
