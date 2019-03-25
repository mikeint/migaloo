import React from 'react';
import './ActiveJobs.css';    
import { NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import Overlay from '../../../components/Overlay/Overlay';
import Loader from '../../../components/Loader/Loader';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';
import Pagination from "react-js-pagination";
import '../../../constants/AnimateMigalooOverlay';

import whale from '../../../files/images/logo.png'

class ActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            migalooOverlay: false, 
            showOverlay: false,
            overlayConfig: {direction: "l-r", swipeLocation: "r"},
            postId: '',
            jobList: '', 
            page: 1,
            pageCount: 1
        };
        this.Auth = new AuthFunctions();
    }

    componentWillMount = () => {
        this.setState({ migalooOverlay: sessionStorage.getItem("migalooOverlay") });
        sessionStorage.removeItem('migalooOverlay');
        this.getJobList();
    }

    componentDidMount = () => {
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


    getJobList = () => {
        ApiCalls.get('/api/employerPostings/list/'+this.state.page)
        .then((res)=>{    
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

    render(){ 
        const html = <BuildActiveJobs obj={this.state.jobList[this.state.postId]} removedCallback={this.jobRemoved.bind(this)} />

        return (
            <React.Fragment>
                { this.state.migalooOverlay ? <div id="fadeOutOverlay" className="migalooOverlay"><div className="middleOverlay"><img src={whale} alt="whale" /></div></div>:"" }
            
                <div className='activeJobContainer'>
                    <div className="pageHeading">Active Jobs<NavLink to="/employer/postAJob"><button className="addBtn addJob"></button></NavLink></div> 
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
                                {this.state.showOverlay && <Overlay
                                                                html={html}  
                                                                handleClose={this.callOverlay} 
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
