import React from 'react';
import './Profile.css';  
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions';  
import { Redirect } from 'react-router-dom';
import UploadImage from '../../../components/UploadImage/UploadImage'; 
import coin from '../../../files/images/coin.png'
import defaultProfileImage from '../../../files/images/profile.png'

class Profile extends React.Component{

    constructor(){
        super();
        this.state={ 
            logout: false, 
            searchTerm: '', 
            user: {},
            profileInfo: {},
            showUpload:false,
            profileImage: defaultProfileImage
        }
        this.Auth = new AuthFunctions();
    } 

    componentWillMount = () => {
        this.setState({logout: false})
        this.setState({ user: this.Auth.getUser() });
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
        ApiCalls.get('/api/recruiter/getProfile')
        .then((res)=>{    
            this.setState({ profileInfo: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    getImage = () => {
        ApiCalls.get('/api/profileImage/view/medium')
        .then((res)=>{
            if(res.data.success){
                this.setState({ profileImage: res.data.url }) 
            }else{
                this.setState({ profileImage: defaultProfileImage })
            }
        }).catch(errors => {
            this.setState({ profileImage: defaultProfileImage })
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
