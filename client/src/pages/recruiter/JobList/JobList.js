import React from 'react';
import './JobList.css';    
import Loader from '../../../components/Loader/Loader';
import Filters from '../../../components/Filters/Filters';
import {getWithParams, cancel} from '../../../ApiCalls';  
import { NavLink, Redirect } from 'react-router-dom';
import debounce from 'lodash/debounce';

import Pagination from "react-js-pagination";
import { withStyles } from '@material-ui/core/styles'; 
import Button from '@material-ui/core/Button';
import FilterList from '@material-ui/icons/FilterList';
import '../../../constants/AnimateMigalooOverlay';

import whale from '../../../files/images/logo.png'

const styles = theme => ({
    button: {
      float: 'right', 
    },
    noJobs: {
      padding: '20px', 
    }
});


class JobList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            migalooOverlay: false, 
            showFilterOverlay: false,
            index:0,
            postId: null,
            overlayConfig: {direction: "l-r", swipeLocation: "r"},
            jobList: null, 
            page: 1,
            pageCount: 1,
            openJob: false,
            candidateId: props.match.params.candidateId,
            candidateData: null,
            enterSlide:"page-enter",
            filterOpen: false,
            filters: {}
        };
    }
    handleDrawerToggle = () => {
        this.setState({ filterOpen: !this.state.filterOpen });
    };
    handleDrawerClose = (filters) => {
        this.setState({ filterOpen: false , filters:filters }, this.getJobList());
    };

    componentWillMount = () => {
        this.setState({ migalooOverlay: sessionStorage.getItem("migalooOverlay") });
        sessionStorage.removeItem('migalooOverlay');
    }

    componentWillUnmount = () => {
        cancel()
        this.setState({enterSlide:"page-exit"})
    }

    
    componentDidMount = () => {
        this.getJobList();
        if(this.state.migalooOverlay) {
            window.FX.fadeOut(document.getElementById('fadeOutOverlay'), {
                duration: 1500, complete: function() {  
                    document.getElementById("fadeOutOverlay").style.display = "none";
                }
            })
        }
    }
    handleFilterChange = (filters) =>{
        this.setState({filters:filters}, ()=>this.getJobList())
    }
    callNewJobPage = (postId) => {
        this.setState({postId : postId, openJob:true}) 
    }


    getJobList = (searchString) => {
        (this.state.candidateId?
            getWithParams('/api/recruiterJobs/listForCandidate/'+this.state.candidateId+'/'+this.state.page+(searchString?`/${searchString}`:''), this.state.filters):
            getWithParams('/api/recruiterJobs/list/'+this.state.page+(searchString?`/${searchString}`:''), this.state.filters))
        .then((res)=>{
            if(res && res.data.success){
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
        const { classes } = this.props; 
        return (
            <React.Fragment>
                { this.state.openJob && <Redirect to={"/recruiter/jobList/job/"+this.state.postId+(this.state.candidateId?"/"+this.state.candidateData.candidate_id:'')} />}
                { this.state.migalooOverlay ? <div id="fadeOutOverlay" className="migalooOverlay"><div className="middleOverlay"><img src={whale} alt="whale" /></div></div>:"" }
                <Filters 
                    onChange={this.handleFilterChange}
                    onClose={this.handleDrawerClose}
                    open={this.state.filterOpen}
                    filterOptions={['salary', 'location', 'experience', 'tags']} />
                <div className='jobListClassContainer'> 
                   <div className="pageHeading">
                        Active Jobs Postings  
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="secondary" 
                            onClick={()=>this.handleDrawerToggle()}>
                            <FilterList/>
                        </Button>

                        {this.state.candidateData ? <NavLink to={"/recruiter/candidate/"+this.state.candidateData.candidate_id}><div className="candidateSearched">For: {this.state.candidateData.first_name + " " + this.state.candidateData.last_name}</div></NavLink> : ""}
                    </div>
                    {
                        this.state.jobList ?
                            <React.Fragment>

                                <input
                                    className="searchJobList"
                                    name="searchTerm"
                                    type="text"
                                    placeholder="Search"
                                    onChange={this.onSearchChange}
                                /> 
 
                                <div className={"jobListContainer"}>
                                    {
                                        this.state.jobList.length === 0 ?
                                            <div className={classes.noJobs}>
                                            There are no jobs available at the moment.<br/>
                                            We have plenty of job postings but to ensure fairness we post jobs to a limited number of recruiters<br/>
                                            Please ensure you fill out your profile and add some candidates so we can assign you the best job postings to work on.
                                            </div>
                                        :
                                        this.state.jobList.map((item, i) => {
                                            return <div className="jobListItem" key={i} onClick={() => this.callNewJobPage(item.post_id)}> 
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
                            </React.Fragment>
                        :
                        <div className="loaderContainer"><Loader /></div>
                    } 
                </div>
            </React.Fragment>
        );
    }
};
 
export default withStyles(styles)(JobList);