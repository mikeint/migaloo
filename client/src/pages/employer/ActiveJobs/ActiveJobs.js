import React from 'react';
import './ActiveJobs.css';    
import { NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import Loader from '../../../components/Loader/Loader';
import Add from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import Filters from '../../../components/Filters/Filters';

import JobPopUp from './JobPopUp/JobPopUp';
import Pagination from "react-js-pagination";
import '../../../constants/AnimateMigalooOverlay';
import Button from '@material-ui/core/Button';
import FilterList from '@material-ui/icons/FilterList';

import whale from '../../../files/images/logo.png'

const styles = theme => ({
    drawer:{ 
        minWidth: "300px",
        position: "relative"
    },
    rbutton: {
      float: 'right', 
    }
});

class ActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            migalooOverlay: false, 
            showOverlay: false,
            postId: '',
            jobList: null, 
            page: 1,
            pageCount: 1,
            filters: {}
        };
        this.Auth = new AuthFunctions();
    }

    componentWillUnmount = () => {
        ApiCalls.cancel();
    }
    
    componentWillMount = () => {
        this.setState({ migalooOverlay: sessionStorage.getItem("migalooOverlay") });
        sessionStorage.removeItem('migalooOverlay');
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
    callOverlay = (postId) => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ postId : postId })
    }

    handleFilterChange = (filters) =>{
        console.log(filters)
        this.setState({filters:filters}, ()=>this.getJobList())
    }
    getJobList = () => {
        ApiCalls.getWithParams('/api/employerPostings/list/'+this.state.page, this.state.filters)
        .then((res)=>{
            if(res == null) return
            this.setState({ jobList: res.data, pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 })
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    jobRemoved = () => {
        this.setState({ showOverlay : false })
        this.getJobList();
    }

    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getJobList();
        });
    };
    handleDrawerToggle = () => {
        this.setState({ filterOpen: !this.state.filterOpen });
    };
    handleDrawerClose = (filters) => {
        this.setState({ filterOpen: false , filters:filters }, this.getJobList());
    };


    render(){ 

        const { classes } = this.props; 
        return (
            <React.Fragment>
                { this.state.migalooOverlay ? <div id="fadeOutOverlay" className="migalooOverlay"><div className="middleOverlay"><img src={whale} alt="whale" /></div></div>:"" }
                <Filters
                onChange={this.handleFilterChange}
                onClose={this.handleDrawerClose}
                open={this.state.filterOpen}
                filterOptions={['employer', 'contactType']} />

                <div className='activeJobContainer'>
                    <div className="pageHeading">Active Jobs
                    <NavLink to="/employer/postAJob"><IconButton><Add/></IconButton></NavLink>
                    
                    <Button
                        className={classes.rbutton}
                        variant="contained"
                        color="secondary" 
                        onClick={()=>this.handleDrawerToggle()}>
                        <FilterList/>
                    </Button>
                    </div> 
                    {
                        this.state.jobList ?
                            <div className="jobListContainer">
                                {
                                    this.state.jobList.map((item, i) => {
                                        return <div className="jobListItem" key={i} onClick={() => this.callOverlay(i)}>
                                            {item.title}
                                            {item.new_posts_cnt > 0 ? <span className="newPostingCount" title={item.new_posts_cnt+" New Candidate Postings"}>{item.new_posts_cnt}</span> : ""}
                                            <span className="createdTime">{item.created}</span>
                                        </div>
                                    })
                                }
                                <div className="paginationContainer">
                                    <Pagination
                                        prevPageText={'Back'}
                                        nextPageText={'Next'}
                                        firstPageText={'First'}
                                        lastPageText={'Last'}
                                        activePage={this.state.page}
                                        totalItemsCount={this.state.pageCount*10}
                                        marginPagesDisplayed={0}
                                        pageRangeDisplayed={10}
                                        onChange={this.handlePageClick}
                                        innerClass={'pagination'}
                                        activeClass={'active'}
                                        />
                                </div>
                                    
                                <Drawer
                                    anchor="bottom"
                                    className={classes.drawer}
                                    open={this.state.showOverlay}
                                    onClose={()=>this.setState({"showOverlay":false})}
                                    // onOpen={()=>this.setState({"showOverlay":true})}
                                > 
                                    <JobPopUp
                                        obj={this.state.jobList[this.state.postId]}
                                        removedCallback={this.jobRemoved.bind(this)} 
                                        onClose={()=>this.setState({"showOverlay":false})}
                                         />
                                </Drawer>
                            </div>
                        :
                        <Loader />
                    } 
                </div> 
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(ActiveJobs);
