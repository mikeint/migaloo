import React from 'react';
import './Profile.css';  
import AuthFunctions from '../../../AuthFunctions';  
import NavBar from '../../../components/recruiter/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import UploadImage from './UploadImage/UploadImage'; 

import profileImg from '../../../files/images/profileImg2.png'

class Profile extends React.Component{

    constructor(){
        super();
        this.state={ 
            logout: false, 
            searchTerm: '', 
            user: {},
            profile: '',
            profileInfo: {},
            showUpload:false,
            profileImage: ''
        }
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
    } 

    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() });
        this.setState({ profile: this.Auth.getProfile() });
        console.log("here", this.Auth.getUser())
        this.getProfileInfo();
        this.getImage();
    }
    handleLogout = () => {
        this.Auth.logout();
        this.setState({logout: true}) 
    }
    getProfileInfo = () => {
        axios.get('/api/recruiter/getProfile', this.axiosConfig)
        .then((res)=>{    
            this.setState({ profileInfo: res.data }) 
            console.log(res.data)
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    getImage = () => {
        console.log(this.state.user.id)
        axios.get('/api/profileImage/view/medium', this.axiosConfig)
        .then((res)=>{
            if(res.data.success){
                console.log(res.data.url)
                this.setState({ profileImage: res.data.url }) 
                console.log(res.data)
            }else{
                this.setState({ profileImage: profileImg })
            }
        }).catch(errors => {
            console.log(errors.response.data)
            this.setState({ profileImage: profileImg })
        })
    }
    handleClose = (err, d) => {
        this.setState({showUpload:false});
        this.getImage();
    }
    showUpload = () => {
        this.setState({showUpload:true})
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
                <div className='profileContainer'>
                    <div className='profileImageContainer'>
                        <img className="profileImage" src={this.state.profileImage} alt="" onClick={this.showUpload}/>
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
                    {this.state.showUpload?<UploadImage id={this.state.user.id} handleClose={this.handleClose} />:''}
                </div> 
            </React.Fragment>
        );
    }
};

export default Profile;
