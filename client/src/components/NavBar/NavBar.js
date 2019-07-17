import React from 'react';
import './NavBar.css';  
import { NavLink, withRouter, Redirect } from 'react-router-dom';  
import {getNewAuthToken} from '../../ApiCalls';  
import AuthFunctions from '../../AuthFunctions'; 
import {Toolbar, AppBar, Tab, Menu, MenuItem, Typography, ListItemIcon, Button} 
    from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ListAlt from '@material-ui/icons/ListAlt';
import MoreVert from '@material-ui/icons/MoreVert';
import Search from '@material-ui/icons/Search';
import Chat from '@material-ui/icons/Chat';
import AccountBalance from '@material-ui/icons/AccountBalance';
import LogOut from '@material-ui/icons/ExitToApp';
import Notifications from '../Notifications/Notifications';
import { withStyles } from '@material-ui/core/styles';
//import Tabs from '@material-ui/core/Tabs';


function LinkTab(props) {
    return <Tab component={NavLink} {...props} />;
}
function getByPath(object, path) {
    return path.reduce((t,a)=>t == null || t[a] == null ? null : t[a], object)
};

const styles = theme => ({
    root: {
        height:'100vh', 
        alignItems: 'unset',
        '@media (max-width: 1024px)': { 
            minHeight:'unset',
            height: '60px',
        },
    },
    tabsContainer:{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        '@media (max-width: 1024px)': {
            flexDirection: 'row',
        },
    },
    tabsContainerSecondary: { 
        display: 'flex', 
        flex: '0 0 50%'
    },
    linkButton:{
        flex: '0',
        minWidth: '100%',
        maxWidth: 'unset',
        paddingTop: '0px',
        order: 2, 
        '@media (max-width: 1024px)': {
            flex: '1',
            order: 1,
            minWidth: 'unset',
            minHeight:'unset'
        },
        '&.active': {
            backgroundColor: '#6f90a14d',
        },  
    },   
    linkWrapper: {
        flexDirection: 'row', 
        padding: '10px',
        justifyContent: 'left',
        textAlign: 'left', 

        '@media (max-width: 1024px)': {
            flexDirection: "column",
            display: 'flex',  
            fontSize: "10px", 
            textAlign: 'center', 
            '& span': {
                padding: '0px',
            } ,
        }, 
    },
    secondaryNav: {
        flex: '0',
        display: 'flex',
        order: 1,
        '@media (max-width: 1024px)': {
            flex: '0',
            order: 2,
        },
    },
    secondaryButton:{
        minWidth: 48,
        padding: 15
    }, 
    tabsIndicator: { 
        height: "80px"
    }, 
    menuButton:{
        marginLeft: "auto"
    }
    
}) 
const navMappingsPrimary = {
    1:{'/recruiter':[ // Recruiter
            {
                icon:<Search/>,
                link:'/recruiter/jobList',
                name:'Job Search',
                className: 'linkButton'
            },
            {
                icon:<ListAlt/>,
                link:'/recruiter/candidateList',
                name:'Candidates',
                className: 'linkButton'
            },
            {
                icon:<Chat/>,
                link:'/recruiter/chat',
                name:'Chat',
                className: 'linkButton'
            }, 
        ]
    },
    2:{
        '/accountManager':[ // Employer
            {
                icon:<ListAlt/>,
                link:'/accountManager/activeJobs',
                name:'Active Jobs',
                className: 'linkButton'
            },
            {
                icon:<Search/>,
                link:'/accountManager/postAJob',
                name:'Post a Job',
                className: 'linkButton'
            },
            {
                icon:<Chat/>,
                link:'/accountManager/chat',
                name:'Chat',
                className: 'linkButton'
            }, 
        ]
    }
}
const navMappingsSecondary = {
    1:{'/recruiter':[ // Recruiter 
            {
                icon:<AccountCircle />,
                link:'/recruiter/profile',  
                name:'Profile',
                className: 'menuItem'
            },
            {
                icon:<AccountBalance />,
                link:'/recruiter/account',
                className: 'menuItem', 
                name:'Account',
                showOnState: ['user', 'isPrimary']
            },
            {
                icon:<AccountBalance />,
                link:'#',
                name:'Log Out',
                className: 'menuItem'
            }
        ]
    },
    2:{
        '/accountManager':[ // Employer 
            {
                icon:<AccountCircle />,
                link:'/accountManager/profile',
                name:'Profile',
                className: 'menuItem'
            },
            {
                icon:<AccountBalance />,
                link:'/accountManager/accounts',
                name:'Accounts',
                className: 'menuItem'
            }
        ]
    }
}


class NavBar extends React.Component{
    handleLogout = () => { 
        this.Auth.logout();
        this.setState({menuOpen: false, logout: true})
    }
    getBasePath(path){
        const i = path.indexOf('/', 1);
        if(i === 0)
            return path;
        return path.slice(0, i);
    }
    getNewPage(path){
        const page = this.getNavMappingsPrimary().findIndex(d=>path.startsWith(d.link))
        if(page === -1)
            return 0
        return page;
    }
    constructor(props){
        super(props);
        this.Auth = new AuthFunctions();
        const user = this.Auth.getUser();
        const userType = user.userType;
        const path = window.location.pathname;
        const basePath = this.getBasePath(path);
        const page = navMappingsPrimary[userType][basePath].findIndex(d=>path.startsWith(d.link));
        this.state={
            page: page,
            userType: userType,
            basePath: basePath,
            user: user,
            menuOpen: false,
            logout: false
        }
        const { history } = this.props;
        history.listen((location, action) => {
            const page = this.state.page;
            const path = location.pathname;
            const newPage = this.getNewPage(path)
            if(newPage !== page){
                this.setState({page: newPage, basePath:this.getBasePath(path)})
            }
        });
    } 
    handleChange = (event, value) => {
        this.setState({ page:value });
    };

    componentDidMount = () => {
        this.setState({ user: this.Auth.getUser() });
    }
    getNavMappingsPrimary(){
        return navMappingsPrimary[this.state.user.userType][this.state.basePath]
    }

    getNavMappingsSecondary(){
        return navMappingsSecondary[this.state.user.userType][this.state.basePath]
    }
    
    render(){
        const { classes } = this.props;
        if (this.state.logout) {
            return <Redirect to='/login' />
        }
        return (
            <React.Fragment> 
                <AppBar position='static'>
                    <Toolbar
                        disableGutters={true}
                        className={classes.root} 
                    >
                        <div variant='fullWidth'
                            value={this.state.page}
                            className={classes.tabsContainer}
                            classes={{indicator:classes.tabsIndicator}}
                            onChange={this.handleChange}>
                            {
                                this.getNavMappingsPrimary().filter(d=>d.showOnState == null ||  getByPath(this.state, d.showOnState)).map((d, i)=>{
                                    return <LinkTab classes={{wrapper:classes.linkWrapper}} className={classes[d.className]} label={d.name} icon={d.icon} key={i} to={d.link} />
                                })
                            }
                            <div className={classes.secondaryNav}>
                                <Notifications classes={{root: classes.secondaryButton}}/>
                                
                                <Button classes={{root: classes.secondaryButton}}
                                    className={classes.menuButton}
                                    color="inherit"
                                    aria-controls="secondary-menu"
                                    aria-haspopup="true"
                                    onClick={(e)=>this.setState({menuOpen: true, menuRef: e.currentTarget})}
                                    >
                                    <MoreVert/>
                                </Button>

                                <Menu
                                    id="secondary-menu"
                                    keepMounted
                                    anchorEl={this.state.menuRef}
                                    open={this.state.menuOpen}
                                    onClose={()=>this.setState({menuOpen: false})}
                                >
                                    {
                                        this.getNavMappingsSecondary().filter(d=>d.showOnState == null ||  getByPath(this.state, d.showOnState)).map((d, i)=>{
                                            return <MenuItem onClick={()=>this.setState({menuOpen: false})} component={NavLink} className={classes[d.className]} key={i} to={d.link} >
                                                    <ListItemIcon>
                                                        {d.icon}
                                                    </ListItemIcon>
                                                    <Typography variant="inherit">{d.name}</Typography>
                                                </MenuItem>
                                        })
                                    }
                                    <MenuItem onClick={this.handleLogout} className={classes['menuItem']} >
                                        <ListItemIcon>
                                            <LogOut/>
                                        </ListItemIcon>
                                        <Typography variant="inherit">Log Out</Typography>
                                    </MenuItem>
                                </Menu>
                            </div>
                        </div>
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        );
    }
};

export default withRouter(withStyles(styles)(NavBar));