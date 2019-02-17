import React from 'react';
import './ActiveJobs.css';    
import { NavLink } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import TopBar from '../../components/TopBar/TopBar';
import Overlay from '../../components/Overlay/Overlay';
//import Loader from '../../components/Loader/Loader';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';


import '../../constants/AnimateOverlay';
 
const obj = [
    {
        "title": "Front end web Developer",
        "paragraph": "Our client located in Mississauga is looking for a Full stack .NET Developer with at least 2 years of work experience.",
        "location": "Guelph, ON"
    },
    {
        "title": "Huge scalable app",
        "paragraph": "VIZIYA, a software company that provides Global 1000 customers in manufacturing and energy with ERP software solutions, has engaged my company to manage their recruitment. VIZIYA has been establishing its brand over the last ten years; with a global expansion and a new cloud strategy in place they are adding to their teams. To that end, as part of the internal recruitment team, I am looking for a creative, innovative and disciplined Front End Developer to join a new team. It’s an opportunity to work on new applications, leverage CI/CD processes, and set the standards for the team to follow and maintain. If you have deep hands-on experience in a range of front end and cloud technologies including Javascript, Angular and React, this is the opportunity to step up to the challenge of building something new for enterprise clients around the world.",
        "location": "Mississauga, ON"
    }, 
    {
        "title": "Sr Front-End Developer",
        "paragraph": "We are looking for a Front-End Web Developer who is motivated to combine the art of design with the art of programming. Responsibilities will include translation and creation of the UI/UX design wireframes to actual code that will produce visual elements of the application. You will work with Business Analysts and UI/UX designers to bridge the gap between graphical design and technical implementation, taking an active role on both sides and defining how the ",
        "location": "Toronto, ON"
    },
]
 
class ActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false,
            jobList: false,
            showOverlay: false,
            jobId: '',
            overlayConfig: {direction: "app-menu_r-l", backButtonLocation: "back_t-l"}
        };
    }

    componentWillMount = () => {
        this.setState({ HROverlay: sessionStorage.getItem("HROverlay") });
        sessionStorage.removeItem('HROverlay');
    }

    componentDidMount = () => {
        if(this.state.HROverlay) {
            window.FX.fadeOut(document.getElementById('fadeOutOverlay'), {
                duration: 1500, complete: function() {  
                    document.getElementById("fadeOutOverlay").style.display = "none";
                }
            })
        }
    } 
    callOverlay = (jobId) => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ jobId : jobId })
    }

    render(){ 
        const html = <BuildActiveJobs obj={obj[this.state.jobId]} />

        return (
            <React.Fragment>  
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <NavBar />
                <TopBar />
               
                <div className='mainContainer'>
                    <div className="pageHeading">Active Jobs<NavLink to="/postAJob"><div className="postJobButton"></div></NavLink></div> 
                    {
                        !this.state.jobList ?
                            <div className="jobListContainer">
                                  {obj.map((item, i) => {
                                    return <div className="addButton jobListItem" key={i} onClick={() => this.callOverlay(i)}>{item.title}</div>
                                })}
                                {this.state.showOverlay && <Overlay
                                                                html={html}  
                                                                callOverlay={this.callOverlay} 
                                                                config={this.state.overlayConfig}
                                                            />}
                            </div>
                        :
                            <React.Fragment>
                                <NavLink to="/postAJob"><div className="addJobButton">+</div></NavLink>
                                <div className="noJobsText">No jobs listed</div>
                            </React.Fragment>
                    }
                    

                    {/* listfromsql ? "" : <Loader /> */}
                </div> 
            </React.Fragment>
        );
    }
};

export default ActiveJobs;
