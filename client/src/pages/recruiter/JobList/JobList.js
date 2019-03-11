import React from 'react';
import './JobList.css';    
import Overlay from '../../../components/Overlay/Overlay';
import Loader from '../../../components/Loader/Loader';
import ApiCalls from '../../../ApiCalls';  
import { NavLink, Redirect } from 'react-router-dom';
import debounce from 'lodash/debounce';

import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';
import Pagination from "react-js-pagination";
import '../../../constants/AnimateHROverlay';  

class JobList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
            showOverlay: false,
            index:0,
            postId: '',
            overlayConfig: {direction: "l-r", swipeLocation: "r"},
            jobList: null, 
            page: 1,
            pageCount: 1,
            candidateId: props.match.params.candidateId,
            candidateData: null,
            enterSlide:"page-enter"
        };
    }

    componentWillMount = () => {
        this.setState({ HROverlay: sessionStorage.getItem("HROverlay") });
        sessionStorage.removeItem('HROverlay');
        this.getJobList();
    }

    componentWillUnmount = () => {
        this.setState({enterSlide:"page-exit"})
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
        //this.setState({ showOverlay : !this.state.showOverlay })
        //this.setState({ postId : postId })
        
        return <Redirect to={"/recruiter/jobList/"+this.state.postId+"/"+this.state.candidateData.candidate_id} />
    }


    getJobList = (searchString) => {
        (this.state.candidateId?
            ApiCalls.get('/api/jobs/listForCandidate/'+this.state.candidateId+'/'+this.state.page+(searchString?`/${searchString}`:'')):
            ApiCalls.get('/api/jobs/list/'+this.state.page+(searchString?`/${searchString}`:'')))
        .then((res)=>{
            if(res.data.success){
                const jobList = res.data.jobList;
                const candidateData = res.data.candidate;
                this.setState({
                    jobList: jobList,
                    candidateData: candidateData,
                    pageCount: jobList.length>0?parseInt(jobList[0].page_count, 10):1 }) 
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }

    onSearchChange = (event) => { 
        this.queryForNames(event.target.value);
    }

    queryForNames = debounce((searchString) => {
        searchString = searchString.trim()
        if(searchString.length > 1){
            this.getJobList(searchString)
        }else{
            this.getJobList()
        }
    }, 250)

    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getJobList();
        });
    };

    /* FOR CHANGING TABS */
    changeTab = (event, value) => {
        this.setState({index: value});
    };
    handleChangeIndexTab = index => {
        this.setState({index:index, page:1});
    };
    /* end FOR CHANGING TABS */
    
    render(){ 
        return (
            <React.Fragment>
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <div className='jobListClassContainer'> 
                   <div className="pageHeading">
                        Active Jobs Postings 
                        <button className="addBtn addFilter"></button>
                        {this.state.candidateData ? <NavLink to={"/recruiter/candidate/"+this.state.candidateData.candidate_id}><div className="candidateSearched">For: {this.state.candidateData.first_name + " " + this.state.candidateData.last_name}</div></NavLink> : ""}
                   </div>
                    {
                        this.state.jobList ?
                            <React.Fragment>

                                <Tabs value={this.state.index} onChange={this.changeTab}>
                                    <Tab label="Job List" />
                                    <Tab label="Sponsered" />
                                    <Tab label="Favourite" />
                                </Tabs>
                                
                                <input
                                    className="searchJobList"
                                    name="searchTerm"
                                    type="text"
                                    placeholder="Search"
                                    onChange={this.onSearchChange}
                                /> 
 
                                <div className={"jobListContainer "+this.state.enterSlide}>
                                    <SwipeableViews enableMouseEvents index={this.state.index} onChangeIndex={this.handleChangeIndexTab}> 
                                        <React.Fragment> 
                                            {
                                                this.state.jobList.map((item, i) => {
                                                    return <div className="jobListItem" key={i} onClick={() => this.callOverlay(i)}> 
                                                        <div className="jobInfo"> 
                                                            <b>{item.company_name}</b>  
                                                            <div className="jobShortDesc">{item.title}</div> 
                                                            {
                                                                item.tag_score &&
                                                                    <span className="score" style={{width:parseInt(item.tag_score, 10)+"%"}}>
                                                                        {parseInt(item.tag_score, 10)+"%"}
                                                                    </span>
                                                            }
                                                            <div className="jobInfo"><span className="createdTime">{item.posted}</span></div>
                                                        </div> 
                                                    </div> 
                                                })
                                            }
                                        </React.Fragment>
                                        <React.Fragment> 
                                            {
                                                this.state.jobList.map((item, i) => {
                                                    return <div className="jobListItem" key={i} onClick={() => this.callOverlay(i)}> 
                                                        <div className="jobInfo"> 
                                                            <b>{item.company_name}</b>  
                                                            <div className="jobShortDesc">{item.title}</div> 
                                                            {
                                                                item.tag_score &&
                                                                    <span className="score" style={{width:parseInt(item.tag_score, 10)+"%"}}>
                                                                        {parseInt(item.tag_score, 10)+"%"}
                                                                    </span>
                                                            }
                                                            <div className="jobInfo"><span className="createdTime">{item.posted}</span></div>
                                                        </div> 
                                                    </div> 
                                                })
                                            }
                                        </React.Fragment>
                                        
                                        <React.Fragment> 
                                            {
                                                this.state.jobList.map((item, i) => {
                                                    return <div className="jobListItem" key={i} onClick={() => this.callOverlay(i)}> 
                                                        <div className="jobInfo"> 
                                                            <b>{item.company_name}</b>  
                                                            <div className="jobShortDesc">{item.title}</div> 
                                                            {
                                                                item.tag_score &&
                                                                    <span className="score" style={{width:parseInt(item.tag_score, 10)+"%"}}>
                                                                        {parseInt(item.tag_score, 10)+"%"}
                                                                    </span>
                                                            }
                                                            <div className="jobInfo"><span className="createdTime">{item.posted}</span></div>
                                                        </div> 
                                                    </div> 
                                                })
                                            }
                                        </React.Fragment>
                                    </SwipeableViews>
                                    <div className="paginationContainer"> 
                                        <Pagination
                                            activeClass={'active'}
                                            innerClass={'pagination'}
                                            onChange={this.handlePageClick}
                                            pageRangeDisplayed={10}
                                            totalItemsCount={this.state.pageCount*10}
                                            marginPagesDisplayed={0}
                                            activePage={this.state.page}
                                            lastPageText={'Last'}
                                            firstPageText={'First'}
                                            nextPageText={'Next'}
                                            prevPageText={'Back'}
                                        />
                                    </div>
                                </div> 
                                {this.state.showOverlay && <Overlay
                                                                html={<BuildActiveJobs jobData={this.state.jobList[this.state.postId]} candidateData={this.state.candidateData} />}  
                                                                handleClose={this.callOverlay} 
                                                                config={this.state.overlayConfig}
                                                            />}
                            </React.Fragment>
                        :
                        <div className="loaderContainer"><Loader /></div>
                    } 
                </div>
            </React.Fragment>
        );
    }
};

export default JobList;
