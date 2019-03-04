import React from 'react';
import './ExpandableRow.css'; 
import UploadResume from '../UploadResume/UploadResume';
import ApiCalls from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import Redirect from 'react-router-dom/Redirect';
import Overlay from '../../../../components/Overlay/Overlay';
import PostCandidateToJob from '../../../PostCandidateToJob/PostCandidateToJob';

class ExpandableRow extends React.Component{

    constructor() {
        super();
        // Initial state
        this.state = { 
            open: false,
            showUpload: false,
            resumeId: null,
            files: [],
            redirectCandidate: false,
            showPostJob: false,
            overlayConfig: {direction: "b-t", swipeLocation: "t"}
        };
        this.Auth = new AuthFunctions();
    }
    
    toggle() {
        this.setState({
            open: !this.state.open,
        });
    }
    handleClose = (err, d) => {
        this.setState({showUpload:false})
    }
    showUpload = () => {
        this.setState({showUpload:true})
    }
    searchJobsForCandidates = () => {
        this.setState({redirectCandidate:true})
    }
    getResumeURL = () => {
        ApiCalls.get('/api/resume/view/'+this.props.candidateData.candidate_id)
        .then((res)=>{
            if(res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    postToJob = () =>{
        this.setState({showPostJob: true})
    }
    render(){ 

        const rowObj = this.props.candidateData;
        console.log(rowObj)
        return (
            <div className="expandableRow">
                {this.state.redirectCandidate && <Redirect to={'/recruiter/jobList/'+this.props.candidateData.candidate_id}/>}
                <div className="candidateListItem" onClick={this.toggle.bind(this)}>  
                    <div className="nameContainer">{rowObj.first_name} {rowObj.last_name} 
                        {rowObj.coins_spent > 0 && <div className="coinContainer"><span className="coinAmount">{rowObj.coins_spent}</span></div> }
                    </div>
                    {rowObj.new_accepted_count > 0 ? <div className="acceptedCount" title={rowObj.new_accepted_count+" New Postings Accepted"}>{/* rowObj.new_accepted_count */}</div> : ""}
                    {rowObj.new_not_accepted_count > 0 ? <div className="notAcceptedCount" title={rowObj.new_not_accepted_count+" New Postings Not Accepted"}>{/* rowObj.new_not_accepted_count */}</div> : ""}
                    
                    
                    {rowObj.tag_score?<span className="score" style={{width: parseInt(rowObj.tag_score, 10)+"%"}}>{parseInt(rowObj.tag_score, 10)+"%"}</span>:''}
                    
                </div>
                <div className={"collapse" + (this.state.open ? ' in' : '')}>



                    <div className="flex">
                        <div className="flexColumn">
                            <div className="flex-item">
                                <div className="info-container">
                                    <p className="email_icon"><span className="heading">Email:</span> {rowObj.email}</p>
                                    <p className="experience_icon"><span className="heading">Created:</span> {rowObj.created}</p>
                                    <p className="tags_icon"><span className="heading">Experience:</span> {rowObj.experience_type_name}</p>
                                    <p className="tags_icon">{rowObj.tag_names && <div className="rowMargin"><span className="heading">Tags:</span> {rowObj.tag_names.join(", ")}</div>}</p>
                                    <p className="posted_icon"><span className="heading">Posted to Job:</span> {rowObj.posted_count} time(s)</p>
                                </div>
                                <img className="candidate_image" src="http://placehold.it/100x100" alt="" />
                            </div> 
                              
                            <div className="rowButton" onClick={this.searchJobsForCandidates}>Search Jobs</div>
                        </div>
                        <div className="flexColumn">
                            <div className="flex-item"> 
                                    <p><span className="heading">Accepted by Postings:</span> {rowObj.accepted_count} time(s)</p>
                                    <p><span className="heading">Not Accepted by Postings:</span> {rowObj.not_accepted_count} time(s)</p> 

                                    <div className="resumeButtons">
                                        {rowObj.resume_id != null && <div className="rowButton" onClick={this.getResumeURL}>View Resume</div>}
                                        <div className="rowButton" onClick={this.showUpload}>Upload Resume</div>
                                    </div>
                                    {this.props.postData && <div className="resumeButtons"><div className="rowButton" onClick={this.postToJob}>Post Candidate to Job</div></div>}
                                    {this.state.showPostJob && <Overlay
                                                                    html={<PostCandidateToJob candidate={this.props.candidateData} job={this.props.postData} handleClose={()=>this.setState({showPostJob:false})} />}  
                                                                    handleClose={()=>this.setState({showPostJob:false})} 
                                                                    config={this.state.overlayConfig}
                                                                />}
                                    
                                    {this.state.showUpload && <UploadResume id={rowObj.candidate_id} handleClose={this.handleClose} />}
                                </div> 
                        </div>
                    </div>




                </div> 
            </div> 
        )
    }
}
 

export default ExpandableRow;