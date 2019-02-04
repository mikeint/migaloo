import React from 'react';
import './PostAJob.css';  
import AuthFunctions from '../../AuthFunctions';
import { Redirect } from 'react-router-dom';
//import axios from 'axios';
import NavBar from '../../components/NavBar/NavBar';

class PostAJob extends React.Component{

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

        return (
            <React.Fragment>
                <NavBar />
                <div className="userInfo">
                    <div className="userInfo_name">Name: {this.state.user.name}</div>
                    <div className="userInfo_email">Email:{this.state.user.email}</div>
                    <div className="userInfo_email">Type:{this.state.profile.type}</div> 
                </div> 
                <div className='mainContainer'>
                    post a job
                </div> 
            </React.Fragment>
        );
    }
};

export default PostAJob;
