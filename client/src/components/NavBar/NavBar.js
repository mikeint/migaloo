import React from 'react';
import './NavBar.css';  
import { NavLink } from 'react-router-dom';  
import active_icon from '../../files/images/navImages/active_icon_30.png';
import post_icon from '../../files/images/navImages/post_icon_30.png';
import chat_icon from '../../files/images/navImages/chat_icon_30.png';
import profile_icon from '../../files/images/navImages/profile_icon_30.png';
import AuthFunctions from '../../AuthFunctions'; 
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Notifications from '../Notifications/Notifications';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    navBtn:{
        padding: "10px",
        marginRight: "10px"
    }
})
class NavBar extends React.Component{
    constructor(){
        super();
        this.state={
            user: {}
        }
        this.Auth = new AuthFunctions();
        this.navMappings = {
            1:[ // Recruiter
                {
                    icon:active_icon,
                    link:"/recruiter/jobList",
                    name:"Job Search"
                },
                {
                    icon:post_icon,
                    link:"/recruiter/candidateList",
                    name:"Candidate List"
                },
                {
                    icon:chat_icon,
                    link:"/recruiter/chat",
                    name:"Chat"
                }
            ],
            2:[ // Employer
                {
                    icon:active_icon,
                    link:"/employer/activeJobs",
                    name:"Active Jobs"
                },
                {
                    icon:post_icon,
                    link:"/employer/postAJob",
                    name:"Post a Job"
                },
                {
                    icon:chat_icon,
                    link:"/employer/chat",
                    name:"Chat"
                }
            ]
        }
        this.profileMapping = {
            1: // Recruiter
            {
                icon:profile_icon,
                link:"/recruiter/profile",
                name:"Profile"
            }
            ,
            2: // Employer
            {
                icon:profile_icon,
                link:"/employer/profile",
                name:"Profile"
            }
            
        }
    } 

    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() });
    }
    render(){
        const { classes } = this.props;
        return (
            <React.Fragment> 
                <AppBar position="static" color="primary">
                    <Toolbar>
                        {
                            this.navMappings[this.state.user.userType].map((d, i)=>{
                                return <Button className={classes.navBtn} key={i} component={NavLink} to={d.link} color="inherit">{d.name}</Button>
                            })
                        }
                        <div style={{flexGrow: 1}}></div>
                        <Notifications/>
                        <IconButton component={NavLink} to={this.profileMapping[this.state.user.userType].link} color="inherit">
                            <AccountCircle />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(NavBar);