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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

function LinkTab(props) {
    return <Tab component={NavLink} {...props} />;
}
function getByPath(object, path) {
    return path.reduce((t,a)=>t == null || t[a] == null ? null : t[a], object)
};
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
    leftButton:{
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        padding: 0,
        marginLeft: "auto"
    },
    smallButton:{
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        padding: 0
    }
})
const navMappings = {
    1:{'/recruiter':[ // Recruiter
            {
                icon:<Search/>,
                link:"/recruiter/jobList",
                name:"Job Search",
                className: 'linkButton'
            },
            {
                icon:<ListAlt/>,
                link:"/recruiter/candidateList",
                name:"Candidate List",
                className: 'linkButton'
            },
            {
                icon:<Chat/>,
                link:"/recruiter/chat",
                name:"Chat",
                className: 'linkButton'
            },
            {
                icon:<AccountCircle />,
                link:"/recruiter/profile",
                className: 'leftButton'
            },
            {
                icon:<AccountBalance />,
                link:"/recruiter/account",
                className: 'smallButton',
                showOnState: ['user', 'isPrimary']
            }
        ]
    },
    2:{
        '/employer':[ // Employer
            {
                icon:<ListAlt/>,
                link:"/employer/activeJobs",
                name:"Active Jobs",
                className: 'linkButton'
            },
            {
                icon:<Search/>,
                link:"/employer/postAJob",
                name:"Post a Job",
                className: 'linkButton'
            },
            {
                icon:<Chat/>,
                link:"/employer/chat",
                name:"Chat",
                className: 'linkButton'
            },
            {
                icon:<AccountBalance />,
                link:"/employer/accounts",
                className: 'leftButton'
            },
            {
                icon:<AccountCircle />,
                link:"/employer/profile",
                className: 'smallButton'
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
        const page = this.getNavMappings().findIndex(d=>path.startsWith(d.link))
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
        const page = navMappings[userType][basePath].findIndex(d=>path.startsWith(d.link));
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
    getNavMappings(){
        return navMappings[this.state.user.userType][this.state.basePath]
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
                                this.getNavMappings().filter(d=>d.showOnState == null ||  getByPath(this.state, d.showOnState)).map((d, i)=>{
                                    return <LinkTab className={classes[d.className]} label={d.name} icon={d.icon} key={i} to={d.link} />
                                })
                            }
                            <Notifications/>
                        </Tabs>
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        );
    }
};

export default withRouter(withStyles(styles)(NavBar));