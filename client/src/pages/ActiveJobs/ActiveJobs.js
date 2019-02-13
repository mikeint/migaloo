import React from 'react';
import './ActiveJobs.css';    
import { NavLink } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import TopBar from '../../components/TopBar/TopBar';
import Overlay from '../../components/Overlay/Overlay';
//import Loader from '../../components/Loader/Loader';

import '../../constants/AnimateOverlay';

class ActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            showOverlay: false,
            jobList: false,
        };
    }

    componentWillMount = () => {
        this.setState({ showOverlay: sessionStorage.getItem("showOverlay") });
        sessionStorage.removeItem('showOverlay');
    }

    componentDidMount = () => {
        if(this.state.showOverlay) {
            window.FX.fadeOut(document.getElementById('fadeOutOverlay'), {
                duration: 1500, complete: function() {  
                    document.getElementById("fadeOutOverlay").style.display = "none";
                }
            })
        }
    } 

    render(){
        /* var listItem = "empty";  */ 

        return (
            <React.Fragment> 


                { this.state.showOverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <NavBar />
                <TopBar />
               
                <div className='mainContainer'>
                    <div className="pageHeading">Active Jobs</div>

                    {
                        !this.state.jobList ?
                            <div className="jobListContainer">
                                <Overlay class=".jobListItem" />
                                <div className="jobListItem" onClick={this.showJobInfo}>Front end web dev</div>
                                <div className="jobListItem">Back end web dev</div>
                                <div className="jobListItem">C#.net dev</div>
                                <div className="jobListItem">Unity developer with 3+ years</div> 
                                <div className="jobListItem">Back end web dev</div>
                                <div className="jobListItem">C#.net dev</div>
                                <div className="jobListItem">Unity developer with 3+ years</div>  
                                <div className="jobListItem">Back end web dev</div>
                                <div className="jobListItem">C#.net dev</div>
                                <div className="jobListItem">Unity developer with 3+ years</div>  
                                <div className="jobListItem">Back end web dev</div>
                                <div className="jobListItem">C#.net dev</div>
                                <div className="jobListItem">Unity developer with 3+ years</div>
                                <div className="jobListItem">Back end web dev</div>
                                <div className="jobListItem">C#.net dev</div>
                                <div className="jobListItem">Unity developer with 3+ years</div>
                                <div className="jobListItem">Back end web dev</div>
                                <div className="jobListItem">C#.net dev</div>
                                <div className="jobListItem">Unity developer with 3+ years</div>
                                <div className="jobListItem">Back end web dev</div>
                                <div className="jobListItem">C#.net dev</div>
                                <div className="jobListItem">Unity developer with 3+ years</div>
                            </div>
                        :
                            <React.Fragment>
                                <NavLink to="/postAJob"><div className="addJobButton">+</div></NavLink>
                                <div className="noJobsText">No jobs listed</div>
                            </React.Fragment>
                    }
                    

                    {/* listItem === "notEmpty" ? "" : <Loader /> */}
                </div> 
            </React.Fragment>
        );
    }
};

export default ActiveJobs;
