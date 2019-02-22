import React from 'react';
import './Profile.css';  
import AuthFunctions from '../../../AuthFunctions';  
import NavBar from '../../../components/employer/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import UploadImage from '../../utils/UploadImage/UploadImage'; 

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
        this.getProfileInfo();
        this.getImage();
    }
    handleLogout = () => {
        this.Auth.logout();
        this.setState({logout: true}) 
    }

    getProfileInfo = () => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        axios.get('/api/employer/getProfile', config)
        .then((res)=>{    
            this.setState({ profileInfo: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    handleClose = (err, d) => {
        this.setState({showUpload:false});
        this.getImage();
    }
    getImage = () => {
        axios.get('/api/profileImage/view/medium', this.axiosConfig)
        .then((res)=>{
            if(res.data.success){
                this.setState({ profileImage: res.data.url }) 
            }else{
                this.setState({ profileImage: '' })
            }
        }).catch(errors => {
            this.setState({ profileImage: '' })
        })
    }
    showUpload = () => {
        this.setState({showUpload:true})
    }

    render(){
        
        if (this.state.logout) {
            return <Redirect to='/login' />
        }

        return (
            <React.Fragment>
                <NavBar /> 
                <TopBar /> 
                <div className='mainContainer'>
                    <div className="profileContainer_employer">
                        <div className='profileImageContainer'>
                            <img  className='profileImage' src={this.state.profileImage} alt="" onClick={this.showUpload}/>
                            <div className="profileType">Employer</div>
                            <div className="profileName">{this.state.profileInfo.contact_first_name} {this.state.profileInfo.contact_last_name}</div>
                            <div className="profileEmail">{this.state.user.email} {this.state.profileInfo.contact_phone_number}</div>
                            <div className="profileName">{this.state.profileInfo.company_name}</div>
                        </div>
                        <div className='profileBottom'>
                            <div className="profileItem">Employer info</div>
                            <div className="profileItem">Account info</div>
                            <div className="profileItem" onClick={this.handleLogout}>Log Out</div>
                        </div> 
                        {this.state.showUpload?<UploadImage 
                                                    baseUrl={"/api/employer/"}
                                                    uploadUrl={"uploadImage/"}
                                                    handleClose={this.handleClose} />:''}                    </div> 
                </div>
            </React.Fragment>
        );
    }
};

export default Profile;
