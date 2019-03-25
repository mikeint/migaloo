import React from 'react';
import './NavBar.css';  
import { NavLink } from 'react-router-dom';  
import AuthFunctions from '../../AuthFunctions'; 
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ListAlt from '@material-ui/icons/ListAlt';
import Search from '@material-ui/icons/Search';
import Chat from '@material-ui/icons/Chat';
import Notifications from '../Notifications/Notifications';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

function LinkTab(props) {
    return <Tab component={NavLink} {...props} />;
}
const styles = theme => ({
    tabsContainer:{
        width: "100%"
    },
    linkButton:{
        maxWidth: "200px"
    },
    tabsIndicator: {
      backgroundColor: '#6f90a1'
    },
    profileButton:{
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        padding: 0,
        marginLeft: "auto"
    }
})
const navMappings = {
    1:[ // Recruiter
        {
            icon:<Search/>,
            link:"/recruiter/jobList",
            name:"Job Search"
        },
        {
            icon:<ListAlt/>,
            link:"/recruiter/candidateList",
            name:"Candidate List"
        },
        {
            icon:<Chat/>,
            link:"/recruiter/chat",
            name:"Chat"
        }
    ],
    2:[ // Employer
        {
            icon:<ListAlt/>,
            link:"/employer/activeJobs",
            name:"Active Jobs"
        },
        {
            icon:<Search/>,
            link:"/employer/postAJob",
            name:"Post a Job"
        },
        {
            icon:<Chat/>,
            link:"/employer/chat",
            name:"Chat"
        }
    ]
}
const profileMapping = {
    1: // Recruiter
    {
        icon:<AccountCircle />,
        link:"/recruiter/profile",
        name:"Profile"
    }
    ,
    2: // Employer
    {
        icon:<AccountCircle />,
        link:"/employer/profile",
        name:"Profile"
    }
    
}
class NavBar extends React.Component{
    constructor(props){
        super(props);
        this.Auth = new AuthFunctions();
        const userType = this.Auth.getUser().userType;
        const path = window.location.pathname;
        let page = 0;
        let i = 0
        for(; i < navMappings[userType].length; i++){
            if(navMappings[userType][i].link.startsWith(path)){
                page = i;
                break;
            }
        }
        if(profileMapping[userType].link.startsWith(path)){
            page = i;
        }

        this.state={
            page: page,
            user: {}
        }

    } 
    handleChange = (event, value) => {
        this.setState({ page:value });
    };

    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() });
    }
    render(){
        const { classes } = this.props;
        return (
            <React.Fragment> 
                <AppBar position="static">
                    <Toolbar>
                        <Tabs variant="fullWidth"
                            value={this.state.page}
                            className={classes.tabsContainer}
                            classes={{indicator:classes.tabsIndicator}}
                            onChange={this.handleChange}>
                            {
                                navMappings[this.state.user.userType].map((d, i)=>{
                                    return <LinkTab className={classes.linkButton} label={d.name} icon={d.icon} key={i} to={d.link} />
                                })
                            }
                            <LinkTab className={classes.profileButton} to={profileMapping[this.state.user.userType].link} icon={profileMapping[this.state.user.userType].icon} color="inherit" />
                            <Notifications/>
                        </Tabs>
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(NavBar);