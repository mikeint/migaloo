import React from 'react';
import './ExpandableRow.scss'; 
import UploadResume from '../UploadResume/UploadResume';
import {get} from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import Redirect from 'react-router-dom/Redirect';
import PostCandidateToJob from '../../PostCandidateToJob/PostCandidateToJob';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import Button from '@material-ui/core/Button';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Drawer from '@material-ui/core/Drawer'; 

 
import ResumeImage from '@material-ui/icons/CloudUpload'; 
import GetApp from '@material-ui/icons/GetApp'; 
import EmailImage from '@material-ui/icons/MailOutline'; 
import TagsImage from '@material-ui/icons/Label'; 
import ExperienceImage from '@material-ui/icons/Computer'; 
import PostImage from '@material-ui/icons/OpenInNew';
import whaleImage from '../../../../files/images/landingPage/tail.png' 
  


const styles = theme => ({
    root: {
        boxShadow: 'none !important',
    },
    dropDown: {
        background: '#263c540d',
        boxShadow:' inset 2px 0px 2px 0px #546f82',

        '@media (max-width: 1024px)': { 
            padding: '8px 8px 8px',
        },
    },
    drawer:{ 
        minWidth: "300px",
        position: "relative",
    },
    button: {
        margin:'10px',
        width: '120px',
        padding: '10px 10px',
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
        console.log(candidateData)
        return (
            <div className="expandableRow">
                {this.state.redirectCandidate && <Redirect to={`/recruiter/jobList/${this.props.candidateData.candidateId}`}/>}
                
                {/* CANDIDATE ACCORDION */}
                <ExpansionPanel square={true} className={classes.root}>
                    
                    {/* HEADER CONTAINER */}
                    <ExpansionPanelSummary>
                        <div className="rowInfoContainer"> 
                            <div className="nameContainer">{candidateData.firstName}&nbsp;{candidateData.lastName}
                                {candidateData.newAcceptedCount > 0 ? <div className="acceptedCount" title={candidateData.newAcceptedCount+" New Postings Accepted"}>{/* candidateData.newAcceptedCount */}</div> : ""}
                                {candidateData.newNotAcceptedCount > 0 ? <div className="notAcceptedCount" title={candidateData.newNotAcceptedCount+" New Postings Not Accepted"}>{/* candidateData.newNotAcceptedCount */}</div> : ""}
                            </div> 
                            {candidateData.postedCount > 0 ?
                                <div className="posted">
                                    <span><b>Posted</b></span> 
                                    <span>{candidateData.postedCount} time{candidateData.postedCount > 1 ? 's' : ''}</span>
                                </div>
                            :''}
                        </div> 
                    </ExpansionPanelSummary>

                    {/* DROPDOWN CONTAINER */}
                    <ExpansionPanelDetails className={classes.dropDown}>
                        <div className="dropDownContainer">
                            <div className="a_container">
                                <div className="acceptedContainer">
                                    <div className="icon"></div>
                                    <div className="heading"><b>Accepted</b> {candidateData.acceptedCount} time{candidateData.acceptedCount > 1 ? 's' : ''}</div>
                                </div>
                                <div className="declinedContainer">
                                    <div className="icon"></div>
                                    <div className="heading"><b>Not Accepted</b> {candidateData.notAcceptedCount} time{candidateData.notAcceptedCount > 1 ? 's' : ''}</div>
                                </div>
                            </div>

                            <div className="splitter"></div> 

                            <div className="infoRowContainer">
                                <div className="infoRow">
                                    <div className="icon"><TagsImage/></div>
                                    <div className="title"><b>Tags: </b></div>
                                    <div className="item">{candidateData.tagNames.join(", ")}</div>
                                </div>
                                <div className="infoRow">
                                    <div className="icon"><ExperienceImage/></div>
                                    <div className="title"><b>Experience: </b></div>
                                    <div className="item">{candidateData.experience}</div>
                                </div>
                                <div className="infoRow">
                                    <div className="icon"><EmailImage/></div>
                                    <div className="title"><b>Email: </b></div>
                                    <div className="item">{candidateData.email}</div>
                                </div>
                            </div>

                            <div className="splitter"></div> 

                            <div className="candidateButtonsContainer">
                                <Button className={classes.button} variant="contained" color="primary" onClick={this.searchJobsForCandidates}>
                                    <div className="buttonsContainer">
                                        <div className="image"><img className="img1" src={whaleImage} alt="whaleTail" /></div>
                                        <div className="text">SEARCH JOBS</div>
                                    </div>
                                </Button> 

                                <Button className={classes.button} variant="contained" color="primary" onClick={this.showUpload}>
                                    <div className="buttonsContainer">
                                        <div className="image"><ResumeImage/></div> 
                                        <div className="text">Upload Resume</div>
                                    </div> 
                                </Button>  

                                {candidateData.resumeId != null &&
                                    <Button className={classes.button} variant="contained" color="primary" onClick={this.getResumeURL}>
                                        <div className="buttonsContainer">
                                            <div className="image"><GetApp/></div> 
                                            <div className="text">View Resume</div>
                                        </div>
                                    </Button>
                                }
 
                                {postData &&
                                    <Button className={classes.button} variant="contained" color="primary" onClick={this.postToJob}> 
                                        <div className="buttonsContainer">
                                            <div className="image"><PostImage/></div> 
                                            <div className="text">Post to Job</div>
                                        </div>
                                    </Button>
                                } 
                            </div> 
 
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
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div> 
        )
    }
}
 
export default withStyles(styles)(ExpandableRow);
