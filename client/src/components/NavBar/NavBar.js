import React from 'react';
import './NavBar.css';  
import { NavLink } from 'react-router-dom';  
import active_icon from '../../files/images/active_icon.png';
import post_icon from '../../files/images/post_icon.png';
import profile_icon from '../../files/images/profile_icon.png';
import AuthFunctions from '../../AuthFunctions'; 


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
                    icon:post_icon,
                    link:"/recruiter/chat",
                    name:"Chat"
                },
                {
                    icon:profile_icon,
                    link:"/recruiter/profile",
                    name:"Profile"
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
                    icon:post_icon,
                    link:"/employer/chat",
                    name:"Chat"
                },
                {
                    icon:profile_icon,
                    link:"/employer/profile",
                    name:"Profile"
                }
            ]
        }
    } 

    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() });
    }
    render(){
        return (
            <React.Fragment> 

                <div id="navBar_admin"> 
                    <div className="navbar_employer"> 
                        {
                            this.navMappings[this.state.user.userType].map((d, i)=>{
                                return <NavLink key={i} to={d.link}>
                                    <div className="navBtn">
                                        <img src={d.icon} alt="" />
                                        <div className="navText">{d.name}</div>
                                    </div>
                                </NavLink> 

                            })
                        }
                    </div>
                </div>  
            </React.Fragment>
        );
    }
};

export default NavBar;
