import React from 'react';
import './ActiveJobs.css';    
import { NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import Overlay from '../../../components/Overlay/Overlay';
import Loader from '../../../components/Loader/Loader';

import BuildActiveJobs from './BuildActiveJobs/BuildActiveJobs';
import ReactPaginate from 'react-paginate';
import '../../../constants/AnimateHROverlay'; 

class ActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
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
        document.querySelector(".addBtn").addEventListener('click', this.animateButton, false); 
    } 
    callOverlay = (postId) => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ postId : postId })
    }


    getJobList = () => {
        ApiCalls.get('/api/postings/list/'+this.state.page)
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

    handlePageClick = data => {
        let selected = data.selected+1;
    
        this.setState({ page: selected }, () => {
            this.getJobList();
        });
    };

    render(){ 
        const html = <BuildActiveJobs obj={this.state.jobList[this.state.postId]} removedCallback={this.jobRemoved.bind(this)} />

        return (
            <React.Fragment>
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
               
                <div className='mainContainer activeJobContainer'>
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
