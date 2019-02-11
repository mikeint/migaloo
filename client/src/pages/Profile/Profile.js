import React from 'react';
import './Profile.css';  
import AuthFunctions from '../../AuthFunctions';  
import NavBar from '../../components/NavBar/NavBar';
import TopBar from '../../components/TopBar/TopBar';

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
        var listItem = "empty";  

        return (
            <React.Fragment>
                <NavBar /> 
                <TopBar /> 
                <div className='mainContainer'>
                   Profile
                    {listItem === "notEmpty" ? "" : <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>}
                    <div className="button" onClick={this.handleLogout}><a target="_blank"><div className="">Log Out</div></a></div>
                </div> 
            </React.Fragment>
        );
    }
};

export default Profile;
