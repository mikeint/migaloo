import React from 'react';
import './Profile.css';  
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import AuthFunctions from '../../../AuthFunctions';  
import { Redirect } from 'react-router-dom';
import Overlay from '../../../components/Overlay/Overlay';
import ApiCalls from '../../../ApiCalls';  
import UploadImage from '../../../components/UploadImage/UploadImage'; 
import defaultProfileImage from '../../../files/images/profile.png'

class Profile extends React.Component{

    constructor(){
        super();
        this.state={ 
            logout: false, 
            showOverlay: false,
            overlayConfig: {direction: "r-l", swipeLocation: "l"},
            searchTerm: '', 
            user: {},
            profile: '',
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
    callOverlay = () => {
        this.setState({ showOverlay : !this.state.showOverlay }) 
    }

    getProfileInfo = () => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        ApiCalls.get('/api/employer/getProfile', config)
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
    showUpload = () => {
        this.setState({showUpload:true})
    }

    render(){
        
        if (this.state.logout) {
            return <Redirect to='/login' />
        }
        
        const html = "HELLO"
        return (
            <React.Fragment>
                <div className='mainContainerProfile'>
                    <div className="profileContainer_employer">
                        <div className='profileImageContainer'>
                            <img  className='profileImage' src={this.state.profileImage} alt="" onClick={this.showUpload}/>
                            <div className="profileType">Employer</div>
                            <div className="profileName">{this.state.profileInfo.contact_first_name} {this.state.profileInfo.contact_last_name}</div>
                            <div className="profileEmail">{this.state.user.email} {this.state.profileInfo.contact_phone_number}</div>
                            <div className="profileName">{this.state.profileInfo.company_name}</div>
                        </div>
                        <div className='profileBottom'>
                            <div className="profileItem" onClick={() => this.callOverlay()}>Employer info</div>
                            <div className="profileItem" onClick={() => this.callOverlay()}>Account info</div>
                            <div className="profileItem" onClick={this.handleLogout}>Log Out</div>
                        </div> 
                        {this.state.showUpload?<UploadImage 
                                                    baseUrl={"/api/employer/"}
                                                    uploadUrl={"uploadImage/"}
                                                    handleClose={this.handleClose} />:''}                    
                        </div> 

                        {this.state.showOverlay && <Overlay
                                                        html={html}  
                                                        handleClose={this.callOverlay} 
                                                        config={this.state.overlayConfig}
                                                    />}
                </div>
            </React.Fragment>
        );
    }
};

export default Profile;
