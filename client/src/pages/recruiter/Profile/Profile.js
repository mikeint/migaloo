import React from 'react';
import './Profile.css';  
import AuthFunctions from '../../../AuthFunctions';  
import NavBar from '../../../components/recruiter/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import profileImg from '../../../files/images/profileImg2.png'

class Profile extends React.Component{

    constructor(){
        super();
        this.state={ 
            logout: false, 
            searchTerm: '', 
            user: '',
            profile: '',
            profileInfo: {},
        }
        this.Auth = new AuthFunctions();
    } 

    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() });
        this.setState({ profile: this.Auth.getProfile() });
        this.getProfileInfo();
    }
    handleLogout = () => {
        this.Auth.logout();
        this.setState({logout: true}) 
    }
    getProfileInfo = () => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        axios.get('/api/recruiter/getProfile', config)
        .then((res)=>{    
            this.setState({ profileInfo: res.data }) 
            console.log(res.data)
        }).catch(errors => 
            console.log(errors.response.data)
        )
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
                        <div className="profileType">Recruiter</div>
                        <div className="profileName">{this.state.profileInfo.first_name} {this.state.profileInfo.last_name}</div>
                        <div className="profileEmail">{this.state.user.email} {this.state.profileInfo.phone_number}</div>
                        <div className="numberCircle"><span className="number">{this.state.profileInfo.coins}</span></div>
                    </div>
                    <div className='profileBottom'>
                        <div className="profileItem">Recruiter info</div>
                        <div className="profileItem">Account info</div>
                        <div className="profileItem" onClick={this.handleLogout}>Log Out</div>
                    </div> 
                </div> 
            </React.Fragment>
        );
    }
};

export default Profile;
