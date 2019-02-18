import React from 'react';
import './ActiveJobs.css';    
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions'; 
import NavBar from '../../../components/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';
import Overlay from '../../../components/Overlay/Overlay';
import Loader from '../../../components/Loader/Loader';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';
import '../../../constants/AnimateOverlay'; 

class ActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
            showOverlay: false,
            jobId: '',
            overlayConfig: {direction: "app-menu_l-r", backButtonLocation: "back_t-r"},
            jobList: '', 
        };
        this.Auth = new AuthFunctions();
    }

    componentWillMount = () => {
        this.setState({ HROverlay: sessionStorage.getItem("HROverlay") });
        sessionStorage.removeItem('HROverlay');
        this.getJobList();
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

    getJobList = () => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        } 
        var data = {
            user: this.Auth.getUser()
        }

        axios.get('/api/jobs/listJobs', data, config)
        .then((res)=>{    
            this.setState({ jobList: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }


    render(){ 
        const html = <BuildActiveJobs obj={this.state.jobList[this.state.jobId]} />

        return (
            <React.Fragment>  
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <NavBar />
                <TopBar />
               
                <div className='mainContainer'>
                    <div className="pageHeading">Active Jobs<NavLink to="/postAJob"><div className="postJobButton"></div></NavLink></div> 
                    {
                        this.state.jobList ?
                            <div className="jobListContainer">
                                  {this.state.jobList.map((item, i) => {
                                    return <div className="addButton jobListItem" key={i} onClick={() => this.callOverlay(i)}>{item.title}</div>
                                })}
                                {this.state.showOverlay && <Overlay
                                                                html={html}  
                                                                callOverlay={this.callOverlay} 
                                                                config={this.state.overlayConfig}
                                                            />}
                            </div>
                        :
                        <Loader />
                    } 
                </div> 
            </React.Fragment>
        );
    }
};

export default ActiveJobs;
