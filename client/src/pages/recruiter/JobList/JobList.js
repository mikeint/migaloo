import React from 'react';
import './JobList.css';    
import Overlay from '../../../components/Overlay/Overlay';
import Loader from '../../../components/Loader/Loader';
import ApiCalls from '../../../ApiCalls';  
import { NavLink } from 'react-router-dom';
import debounce from 'lodash/debounce';

import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';
import ReactPaginate from 'react-paginate';
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
            candidateData: null
        };
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
                    pageCount: (res.data&&jobList.length>0)?parseInt(jobList[0].page_count, 10):1 }) 
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

    handlePageClick = data => {
        let selected = data.selected+1;
    
        this.setState({ page: selected }, () => {
            this.getJobList();
        });
    };

    /* FOR CHANGING TABS */
    changeTab = (event, value) => {
        this.setState({index: value});
    };
    handleChangeIndexTab = index => {
        this.setState({index});
    };
    /* end FOR CHANGING TABS */
    
    render(){ 
        return (
            <React.Fragment>
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <div className='jobListClassContainer'> 
                   <div className="pageHeading">Active Jobs Postings {this.state.candidateData? <NavLink to={"/recruiter/candidate/"+this.state.candidateData.candidate_id}><div className="candidateSearched">For: {this.state.candidateData.first_name + " " + this.state.candidateData.last_name}</div></NavLink> : ""}</div>
                    {
                        this.state.jobList ?
                            <React.Fragment>

                                <Tabs value={this.state.index} onChange={this.changeTab}>
                                    <Tab label="Job List" />
                                    <Tab label="New Posts" />
                                    <Tab label="Favourite" />
                                </Tabs>
                                
                                <input
                                    className="searchJobList"
                                    name="searchTerm"
                                    type="text"
                                    placeholder="Search"
                                    onChange={this.onSearchChange}
                                /> 
                                <div className="jobListContainer">

                                    <SwipeableViews enableMouseEvents index={this.state.index} onChangeIndex={this.handleChangeIndexTab}>
                                        <React.Fragment>
                                            {this.state.jobList.map((item, i) => {
                                                return <div className="jobListItem" key={i} onClick={() => this.callOverlay(i)}>
                                                    <div className="jobInfo">
                                                        <b>{item.company_name}</b> 
                                                        <div className="jobShortDesc">{item.title}</div>
                                                    </div>
                                                    <div className="jobInfo"><span className="createdTime">{item.posted}</span></div>
                                                    {item.tag_score?<span className="score" style={{width:parseInt(item.tag_score, 10)+"%"}}>{parseInt(item.tag_score, 10)+"%"}</span>:''}
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
                                        </React.Fragment>

                                        <div style={Object.assign({})}>slide n°2</div>
                                        <div style={Object.assign({})}>slide n°3</div>
                                    </SwipeableViews>


                                    {this.state.showOverlay && <Overlay
                                                                    html={<BuildActiveJobs jobData={this.state.jobList[this.state.postId]} candidateData={this.state.candidateData} />}  
                                                                    handleClose={this.callOverlay} 
                                                                    config={this.state.overlayConfig}
                                                                />}
                                </div>
                            </React.Fragment>
                        :
                        <Loader />
                    } 
                </div>
            </React.Fragment>
        );
    }
};

export default JobList;
