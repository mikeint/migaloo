import React from 'react';
import './JobList.css';    
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions'; 
import NavBar from '../../../components/recruiter/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';
import Overlay from '../../../components/Overlay/Overlay';
import Loader from '../../../components/Loader/Loader';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';
import '../../../constants/AnimateOverlay'; 

class JobList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
            showOverlay: false,
            postId: '',
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
    callOverlay = (postId) => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ postId : postId })
    }


    getJobList = () => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        axios.get('/api/jobs/list', config)
        .then((res)=>{    
            this.setState({ jobList: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }


    render(){ 
        const html = <BuildActiveJobs obj={this.state.jobList[this.state.postId]} />

        return (
            <React.Fragment>  
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <NavBar />
                <TopBar />
               
                <div className='jobListClassContainer'>
                    <div className="pageHeading">Active Jobs Postings</div> 
                    {
                        this.state.jobList ?
                            <div className="jobListContainer">
                                  {this.state.jobList.map((item, i) => {
                                    return <div className="addButton jobListItem" key={i} onClick={() => this.callOverlay(i)}>
                                        {item.title}
                                        <span className="createdTime">{item.posted}</span>
                                    </div>
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

export default JobList;
