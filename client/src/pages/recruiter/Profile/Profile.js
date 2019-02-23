import React from 'react';
import './Profile.css';  
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import AuthFunctions from '../../../AuthFunctions';  
import NavBar from '../../../components/recruiter/NavBar/NavBar';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import UploadImage from '../../utils/UploadImage/UploadImage'; 
import coin from '../../../files/images/coin.png'

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
        Swal.fire({
            title: 'Are you sure?', 
            showCancelButton: true,
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.Auth.logout();
                this.setState({logout: true})
            } 
        }) 
    }
    getProfileInfo = () => {
        axios.get('/api/recruiter/getProfile', this.axiosConfig)
        .then((res)=>{    
            this.setState({ profileInfo: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
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
                <div className="mainContainerProfile">
                    <div className='profileContainer'>
                        <div className='profileImageContainer'>
                            <img className="profileImage" src={this.state.profileImage} alt="" onClick={this.showUpload}/>
                            <div className="profileType">Recruiter</div>
                            <div className="profileName">{this.state.profileInfo.first_name} {this.state.profileInfo.last_name}</div>
                            <div className="profileEmail">{this.state.user.email} {this.state.profileInfo.phone_number}</div>
                            <div className="numberCircle">
                                <img className="numberCoin" src={coin} alt=""/>
                                <span className="number">{this.state.profileInfo.coins}</span>
                            </div>
                        </div>
                        <div className='profileBottom'>
                            <div className="profileItem">Recruiter info</div>
                            <div className="profileItem">Account info</div>
                            <div className="profileItem" onClick={this.handleLogout}>Log Out</div>
                        </div> 
                        {this.state.showUpload?<UploadImage 
                                                    baseUrl={"/api/recruiter/"}
                                                    uploadUrl={"uploadImage/"}
                                                    handleClose={this.handleClose} />:''}
                    </div>
                </div>
            </React.Fragment>
        );
    }
};

export default Profile;
