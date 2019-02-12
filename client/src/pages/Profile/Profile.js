import React from 'react';
import './Profile.css';  
import AuthFunctions from '../../AuthFunctions';  
import NavBar from '../../components/NavBar/NavBar';
import TopBar from '../../components/TopBar/TopBar';

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

        return (
            <React.Fragment>
                <NavBar /> 
                <TopBar /> 
                <div className='mainContainer'>  

                    <div className='profileImage'>
                        <img src={profileImg} alt="" />
                        <div className="profileName">{this.state.user.name}</div>
                        <div className="profileEmail">{this.state.user.email}</div>
                    </div>
                    <div className='profileBottom'>
                        
                        <div className="profileItem"><a target="_blank"><div className="">Preferences</div></a></div>
                        <div className="profileItem"><a target="_blank"><div className="">Account Settings</div></a></div>
                        <div className="profileItem" onClick={this.handleLogout}><a target="_blank"><div className="">Log Out</div></a></div>
                    </div>

                </div> 
            </React.Fragment>
        );
    }
};

export default Profile;
