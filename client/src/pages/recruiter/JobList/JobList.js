import React from 'react';
import './JobList.css';    
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions'; 
import Overlay from '../../../components/Overlay/Overlay';
import Loader from '../../../components/Loader/Loader';
import Notifications from '../../../components/Notifications/Notifications';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';
import ReactPaginate from 'react-paginate';
import '../../../constants/AnimateHROverlay'; 

class JobList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
            showOverlay: false,
            postId: '',
            overlayConfig: {direction: "l-r", swipeLocation: "r"},
            jobList: null, 
            page: 1,
            pageCount: 1,
            candidateId: props.match.params.candidateId,
            candidateData: null
        };
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
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
        (this.state.candidateId?
            axios.get('/api/jobs/listForCandidate/'+this.state.candidateId, this.axiosConfig):
            axios.get('/api/jobs/list/'+this.state.page, this.axiosConfig))
        .then((res)=>{
            if(res.data.success){
                const jobList = res.data.jobList;
                const candidateData = res.data.candidate;
                this.setState({
                    jobList: jobList,
                    candidateData: candidateData,
                    pageCount: (res.data&&jobList.length>0)?parseInt(jobList[0].page_count, 10):1 }) 
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }


    handlePageClick = data => {
        let selected = data.selected+1;
    
        this.setState({ page: selected }, () => {
            this.getJobList();
        });
    };
    
    render(){
        return (
            <React.Fragment>
                <Notifications />
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
               
               <div className="mainContainer">
                    <div className='jobListClassContainer'>
                        <div className="pageHeading">Active Jobs Postings {this.state.candidateData?" - For: "+this.state.candidateData.first_name + " " + this.state.candidateData.last_name:''}</div> 
                        {
                            this.state.jobList ?
                                <div className="jobListContainer">
                                    {this.state.jobList.map((item, i) => {
                                        return <div className="jobListItem" key={i} onClick={() => this.callOverlay(i)}>
                                            <div className="jobInfo">{item.title}</div>
                                            <div className="jobInfo"><span className="createdTime">{item.posted}</span></div>
                                            {item.tag_score?<span className="score">{parseInt(item.tag_score, 10)+"%"}</span>:''}
                                        </div>
                                    })}
                                    <div className="paginationContainer">
                                        <ReactPaginate
                                            previousLabel={'Back'}
                                            nextLabel={'Next'}
                                            breakLabel={'...'}
                                            breakClassName={'break-me'}
                                            pageCount={this.state.pageCount}
                                            marginPagesDisplayed={2}
                                            pageRangeDisplayed={10}
                                            onPageChange={this.handlePageClick}
                                            containerClassName={'pagination'}
                                            subContainerClassName={'pages pagination'}
                                            activeClassName={'active'}
                                            />
                                    </div>
                                    {this.state.showOverlay && <Overlay
                                                                    html={<BuildActiveJobs obj={this.state.jobList[this.state.postId]} />}  
                                                                    callOverlay={this.callOverlay} 
                                                                    config={this.state.overlayConfig}
                                                                />}
                                </div>
                            :
                            <Loader />
                        } 
                    </div>
                </div>
            </React.Fragment>
        );
    }
};

export default JobList;
