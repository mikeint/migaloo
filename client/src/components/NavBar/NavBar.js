import React from 'react';
import './NavBar.css';  
import { NavLink, withRouter } from 'react-router-dom';  
import AuthFunctions from '../../AuthFunctions'; 
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ListAlt from '@material-ui/icons/ListAlt';
import Search from '@material-ui/icons/Search';
import Chat from '@material-ui/icons/Chat';
import AccountBalance from '@material-ui/icons/AccountBalance';
import Notifications from '../Notifications/Notifications';
import { withStyles } from '@material-ui/core/styles';
//import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


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
            height: 'initial', 
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
    secondaryNavItems:{ 
        display: 'flex',
        flex: '1',
    },
    linkButton:{
        display: 'flex',
        minWidth: '100%',
        maxWidth: 'unset',
        paddingTop: '0px',
        '@media (max-width: 1024px)': {
            flex: '1',
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
            textAlign: "center",
            fontSize: "10px",
            padding: "0px"
        }, 
    },

    tabsIndicator: { 
      height: "80px"
    }, 

    secondaryNav: {
        display: "flex"
    },
    
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
                name:'Candidate List',
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
                className: 'linkButton'
            },
            {
                icon:<AccountBalance />,
                link:'/recruiter/account',
                className: 'linkButton', 
                showOnState: ['user', 'isPrimary']
            }
        ]
    },
    2:{
        '/accountManager':[ // Employer 
            {
                icon:<AccountBalance />,
                link:'/accountManager/accounts',
                className: 'linkButton'
            },
            {
                icon:<AccountCircle />,
                link:'/accountManager/profile',
                className: 'linkButton'
            }
        ]
    }
}


class NavBar extends React.Component{
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
            user: user
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
        return (
            <React.Fragment> 
                <AppBar position='static'>


                    <div className={classes.secondaryNav}>

                        <div className={classes.secondaryNavItems}>
                            <div variant='fullWidth'
                                value={this.state.page}
                                className={classes.tabsContainerSecondary}
                                classes={{indicator:classes.tabsIndicator}}
                                onChange={this.handleChange}>
                                {
                                    this.getNavMappingsSecondary().filter(d=>d.showOnState == null ||  getByPath(this.state, d.showOnState)).map((d, i)=>{
                                        return <LinkTab classes={{wrapper:classes.linkWrapper}} className={classes[d.className]} label={d.name} icon={d.icon} key={i} to={d.link} />
                                    })
                                }
                            </div>
                        </div>
                        <Notifications/>
                    </div>


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
                        </div>
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        );
    }
};

export default withRouter(withStyles(styles)(NavBar));