import React from 'react';
import './ExpandableRow.css'; 
import UploadResume from '../UploadResume/UploadResume';
import {get} from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import Redirect from 'react-router-dom/Redirect';
import PostCandidateToJob from '../../../PostCandidateToJob/PostCandidateToJob';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import Button from '@material-ui/core/Button';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Drawer from '@material-ui/core/Drawer';

const styles = theme => ({
    drawer:{ 
        minWidth: "300px",
        position: "relative"
    }
});
class ExpandableRow extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            open: props.candidateId === props.candidateData.candidateId,
            showUpload: false,
            resumeId: null,
            files: [],
            redirectCandidate: false,
            showPostJob: false,
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
        get('/api/resume/view/'+this.props.candidateData.candidateId)
        .then((res)=>{
            if(res && res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors)
        )
    }
    postToJob = () =>{
        this.setState({showPostJob: true})
    }
    render(){ 
        const { classes, candidateData, postData } = this.props;
        return (
            <div className="expandableRow">
                {this.state.redirectCandidate && <Redirect to={`/recruiter/jobList/${this.props.candidateData.candidateId}`}/>}
                
                <ExpansionPanel>
                    <ExpansionPanelSummary>
                        <div className="nameContainer">{candidateData.firstName}&nbsp;{candidateData.lastName}</div>
                        {candidateData.newAcceptedCount > 0 ? <div className="acceptedCount" title={candidateData.newAcceptedCount+" New Postings Accepted"}>{/* candidateData.newAcceptedCount */}</div> : ""}
                        {candidateData.newNotAcceptedCount > 0 ? <div className="notAcceptedCount" title={candidateData.newNotAcceptedCount+" New Postings Not Accepted"}>{/* candidateData.newNotAcceptedCount */}</div> : ""}
                        {candidateData.score > 0?<span className="score" style={{width: parseInt(candidateData.score, 10)+"%"}}>{parseInt(candidateData.score, 10)+"%"}</span>:''}
                        <div></div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <div className="flex">
                            <div className="flexColumn">
                                <div className="flex-item">
                                    <div>
                                        <div className="created-info-item"> 
                                            <span className="heading">Created: </span> 
                                            <span className="headingInfo">{candidateData.created}</span>
                                        </div>
                                    </div>
                                    <div className="info-container"> 
                                        <div>
                                            <span className="email_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="heading">Email: </span> 
                                                <span className="headingInfo">{candidateData.email}</span>
                                            </div>
                                        </div> 
                                        <div>
                                            <span className="experience_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="heading">Experience: </span> 
                                                <span className="headingInfo">{candidateData.experience}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="tags_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="headingInfo">
                                                    {candidateData.tagNames && <span className="rowMargin">
                                                    <span className="heading">Tags: </span> {candidateData.tagNames.join(", ")}</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="posted_icon"></span>
                                            <div className="candidate-info-item">
                                                <span className="heading">Posted to Job: </span> 
                                                <span className="headingInfo">{candidateData.postedCount} time(s)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
 
                                <Button variant="contained" color="primary" onClick={this.searchJobsForCandidates}>Search Jobs</Button>
                            </div>
                            <div className="flexColumn">
                                <div className="flex-item"> 
                                    <img className="candidate_image" src="http://placehold.it/100x100" alt="" />
                                    <p><span className="accepted_icon"></span><span className="heading">Accepted by Postings: </span> {candidateData.acceptedCount} time(s)</p>
                                    <p><span className="notAccepted_icon"></span><span className="heading">Not Accepted by Postings: </span> {candidateData.notAcceptedCount} time(s)</p> 

                                    <div className="resumeButtons">
                                        {candidateData.resumeId != null && <Button variant="contained" color="primary" onClick={this.getResumeURL}>View Resume</Button>}
                                        <Button variant="contained" color="primary" onClick={this.showUpload}>Upload Resume</Button>
                                    </div>
                                    {postData && <div className="resumeButtons">
                                        <Button variant="contained" color="primary" onClick={this.postToJob}>Post Candidate to Job</Button>
                                    </div>}
                                    
                                    <Drawer
                                        anchor="bottom"
                                        className={classes.drawer}
                                        open={this.state.showPostJob}
                                        onClose={()=>this.setState({"showPostJob":false})}
                                        // onOpen={()=>this.setState({"showPostJob":true})}
                                    > 
                                        <PostCandidateToJob candidate={candidateData}
                                                                    job={postData}
                                                                    handleClose={()=>this.setState({showPostJob:false})} />
                                    </Drawer>
                                    
                                    {this.state.showUpload && <UploadResume id={candidateData.candidateId} handleClose={this.handleClose} />}
                                </div> 
                            </div>
                        </div>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div> 
        )
    }
}
 
export default withStyles(styles)(ExpandableRow);
