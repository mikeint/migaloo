import React from 'react';
import './Profile.css';  
import AuthFunctions from '../../AuthFunctions';
import { Redirect } from 'react-router-dom';
//import axios from 'axios';
import NavBar from '../../components/NavBar/NavBar';

class Profile extends React.Component{

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
                <div className='mainContainer'>
                    profile
                </div> 
            </React.Fragment>
        );
    }
};

export default Profile;
