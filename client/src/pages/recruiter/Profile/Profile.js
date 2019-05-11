import React from 'react';
import AuthFunctions from '../../../AuthFunctions';  
import { Redirect } from 'react-router-dom';
import {get, cancel, getNewAuthToken} from '../../../ApiCalls';  
import defaultProfileImage from '../../../files/images/profile.png'
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Drawer from '@material-ui/core/Drawer';
import EditProfile from './EditProfile/EditProfile';  

const styles = theme => ({
    dataContainer: {
        paddingTop: "20px",
        textAlign: "center",
    },
    profileImage: {
        textAlign: "center",
        display: "inline-block",
        width: "20vh",
        height: "20vh",
        borderRadius: "50%",
        border: "4px solid grey",
        boxShadow: "0px 0px 2px 2px #263c54",
    },
    nameRow: {
        fontSize: "32px",
        fontWeight: "bold", 
        width: "340px",
        margin: "auto", 
    },
    dataRow: {
        fontSize: "20px",
        paddingBottom: "10px",  
    },
    menuItem: {  
        fontWeight: "bold",
        fontSize: "20px", 
        color: "#000",
        borderBottom: "1px solid #5a6592",
    }, 
})
class Profile extends React.Component{

    constructor(props){
        super(props);
        this.Auth = new AuthFunctions();
        this.state={ 
            logout: false, 
            searchTerm: '', 
            user: this.Auth.getUser(),
            profile: '',
            profileInfo: {},
            profileImage: defaultProfileImage,
            openEditProfile: false
        }
    } 

    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount = () => {
        this.getProfileInfo();
        this.getImage();
    }
    handleEditProfileClose(didChange) {
        this.setState({
            openEditProfile: false
        })
        if(didChange){
            this.getProfileInfo();
            this.getImage();
        }
    }
    handleLogout = () => { 
        this.Auth.logout();
        getNewAuthToken();
        this.setState({logout: true})
    }

    getProfileInfo = () => {
        get('/api/recruiter/getProfile')
        .then((res)=>{    
            if(res != null && res.data.success) {
                this.setState({ profileInfo: res.data.profile }) 
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    getImage = () => {
        get('/api/profileImage/view/medium')
        .then((res)=>{
            if(res == null) return
            if(res.data.success){
                this.setState({ profileImage: res.data.url }) 
            }else{
                this.setState({ profileImage: defaultProfileImage })
            }
        }).catch(errors => {
            this.setState({ profileImage: defaultProfileImage })
        })
    }

    render(){
        const { classes } = this.props;
        
        if (this.state.logout) {
            return <Redirect to='/login' />
        }
        
        return (
            <React.Fragment>
                <div>
                    <div className={classes.dataContainer}>
                        <img className={classes.profileImage} src={this.state.profileImage} alt="Profile Image"/>
                        <div className={classes.nameRow}>{this.state.profileInfo.firstName} {this.state.profileInfo.lastName}</div>
                        <div className={classes.dataRow}>{this.state.user.email}</div>
                        <div className={classes.dataRow}>{this.state.profileInfo.phoneNumber}</div>
                        <div className={classes.dataRow}>
                            {[this.state.profileInfo.addressLine1, this.state.profileInfo.addressLine2, this.state.profileInfo.city, this.state.profileInfo.state, this.state.profileInfo.country].filter(d=>d).join(", ")}
                        </div>
                    </div>
                    <MenuItem className={classes.menuItem} onClick={()=>this.setState({openEditProfile: true})}>Edit Account info</MenuItem>
                    <MenuItem className={classes.menuItem}>Edit Notification Settings</MenuItem>
                    <MenuItem className={classes.menuItem} onClick={this.handleLogout}>Log Out</MenuItem>
                </div> 

                <Drawer
                    anchor="bottom"
                    open={this.state.openEditProfile}
                    onClose={this.handleEditProfileClose.bind(this)}
                    >
                    <EditProfile
                        defaultData={this.state.profileInfo}
                        onClose={this.handleEditProfileClose.bind(this)} />
                </Drawer>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Profile);  
