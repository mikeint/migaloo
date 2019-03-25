import React from 'react';
import './ExpandableRow.css'; 
import UploadResume from '../UploadResume/UploadResume';
import ApiCalls from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import Redirect from 'react-router-dom/Redirect';
import Overlay from '../../../../components/Overlay/Overlay';
import PostCandidateToJob from '../../../PostCandidateToJob/PostCandidateToJob';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import Button from '@material-ui/core/Button';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class ExpandableRow extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            open: props.candidateId === props.candidateData.candidate_id,
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
        return (
            <div className="expandableRow">
                {this.state.redirectCandidate && <Redirect to={'/recruiter/jobList/'+this.props.candidateData.candidate_id}/>}
                
                <ExpansionPanel>
                    <ExpansionPanelSummary>
                        {rowObj.coins_spent > 0 && <div className="coinContainer"><span className="coinAmount">{rowObj.coins_spent}</span></div> }
                        <div className="nameContainer">{rowObj.first_name}&nbsp;{rowObj.last_name}</div>
                        {rowObj.new_accepted_count > 0 ? <div className="acceptedCount" title={rowObj.new_accepted_count+" New Postings Accepted"}>{/* rowObj.new_accepted_count */}</div> : ""}
                        {rowObj.new_not_accepted_count > 0 ? <div className="notAcceptedCount" title={rowObj.new_not_accepted_count+" New Postings Not Accepted"}>{/* rowObj.new_not_accepted_count */}</div> : ""}
                        {rowObj.tag_score?<span className="score" style={{width: parseInt(rowObj.tag_score, 10)+"%"}}>{parseInt(rowObj.tag_score, 10)+"%"}</span>:''}
                        <div></div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <div className="flex">
                            <div className="flexColumn">
                                <div className="flex-item">
                                    <div>
                                        <div className="created-info-item"> 
                                            <span className="heading">Created: </span> 
                                            <span className="headingInfo">{rowObj.created}</span>
                                        </div>
                                    </div>
                                    <div className="info-container"> 
                                        <div>
                                            <span className="email_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="heading">Email: </span> 
                                                <span className="headingInfo">{rowObj.email}</span>
                                            </div>
                                        </div> 
                                        <div>
                                            <span className="experience_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="heading">Experience: </span> 
                                                <span className="headingInfo">{rowObj.experience_type_name}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="tags_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="headingInfo">
                                                    {rowObj.tag_names && <span className="rowMargin">
                                                    <span className="heading">Tags: </span> {rowObj.tag_names.join(", ")}</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="posted_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="heading">Posted to Job: </span> 
                                                <span className="headingInfo">{rowObj.posted_count} time(s)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
 
                                <Button variant="contained" color="primary" onClick={this.searchJobsForCandidates}>Search Jobs</Button>
                            </div>
                            <div className="flexColumn">
                                <div className="flex-item"> 
                                    <img className="candidate_image" src="http://placehold.it/100x100" alt="" />
                                    <p><span className="accepted_icon"></span><span className="heading">Accepted by Postings: </span> {rowObj.accepted_count} time(s)</p>
                                    <p><span className="not_accepted_icon"></span><span className="heading">Not Accepted by Postings: </span> {rowObj.not_accepted_count} time(s)</p> 

                                    <div className="resumeButtons">
                                        {rowObj.resume_id != null && <Button variant="contained" color="primary" onClick={this.getResumeURL}>View Resume</Button>}
                                        <Button variant="contained" color="primary" onClick={this.showUpload}>Upload Resume</Button>
                                    </div>
                                    {this.props.postData && <div className="resumeButtons">
                                        <Button variant="contained" color="primary" onClick={this.postToJob}>Post Candidate to Job</Button>
                                    </div>}
                                    {this.state.showPostJob && <Overlay
                                                                    html={<PostCandidateToJob candidate={this.props.candidateData} job={this.props.postData} handleClose={()=>this.setState({showPostJob:false})} />}  
                                                                    handleClose={()=>this.setState({showPostJob:false})} 
                                                                    config={this.state.overlayConfig}
                                                                />}
                                    
                                    {this.state.showUpload && <UploadResume id={rowObj.candidate_id} handleClose={this.handleClose} />}
                                </div> 
                            </div>
                        </div>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div> 
        )
    }
}
 

export default ExpandableRow;