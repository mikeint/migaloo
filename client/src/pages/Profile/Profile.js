import React from 'react';
import './Profile.css';  
import AuthFunctions from '../../AuthFunctions';  
import NavBar from '../../components/NavBar/NavBar';
import TopBar from '../../components/TopBar/TopBar';
import { Redirect } from 'react-router-dom';

import profileImg from '../../files/images/profileImg.png'

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
    handleLogout = () => {
        this.Auth.logout();
        this.setState({logout: true}) 
    }
  
    render(){
        
        if (this.state.logout) {
            return <Redirect to='/login' />
        }
        console.log(this.state.user)

        return (
            <React.Fragment>
                <NavBar /> 
                <TopBar /> 
                <div className='mainContainer'>  

                    <div className='profileImage'>
                        <img src={profileImg} alt="" />
                        <div className="profileName">{this.state.user.name}</div>
                        <div className="profileType">{this.state.user.userType}</div>
                        <div className="profileEmail">{this.state.user.email}</div>
                    </div>
                    <div className='profileBottom'>
                        
                        <div className="profileItem"><a target="_blank">Preferences</a></div>
                        <div className="profileItem"><a target="_blank">Account Settings</a></div>
                        <div className="profileItem"><a target="_blank">Preferences</a></div>
                        <div className="profileItem"><a target="_blank">Account Settings</a></div>
                        <div className="profileItem"><a target="_blank">Preferences</a></div>
                        <div className="profileItem"><a target="_blank">Account Settings</a></div>
                        <div className="profileItem" onClick={this.handleLogout}><a target="_blank">Log Out</a></div>
                    </div>

                </div> 
            </React.Fragment>
        );
    }
};

export default Profile;
