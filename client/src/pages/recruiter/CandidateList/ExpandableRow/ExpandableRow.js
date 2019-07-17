import React from 'react';
import './ExpandableRow.scss'; 
import UploadResumeModal from '../UploadResumeModal/UploadResumeModal';
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
import classNames from 'classnames';

import Tooltip from '@material-ui/core/Tooltip';
import Info from '@material-ui/icons/Info';
import Chat from '@material-ui/icons/Chat';
import Conversation from '../../../../components/Conversation/Conversation';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

 
// import ResumeImage from '@material-ui/icons/CloudUpload'; 
import GetApp from '@material-ui/icons/GetApp'; 
import EmailImage from '@material-ui/icons/MailOutline'; 
import TagsImage from '@material-ui/icons/Label'; 
import Edit from '@material-ui/icons/Edit'; 
import ExperienceImage from '@material-ui/icons/Computer'; 
import PostImage from '@material-ui/icons/OpenInNew';
import ThumbDown from '@material-ui/icons/ThumbDown';
import ThumbUp from '@material-ui/icons/ThumbUp';
import Delete from '@material-ui/icons/Delete';
import whaleImage from '../../../../files/images/landingPage/tail.png' 

const styles = theme => ({
    root: {
        boxShadow: 'none !important',
    },
    dropDown: {
        background: '#263c540d',
        boxShadow:' inset 2px 0px 2px 0px #546f82',
        padding: '0px',
    },
    
    drawer:{ 
        minWidth: "300px",
        position: "relative",
    },
    button: {
        margin:'10px',
        minWidth: '130px',
        maxHeight:'70px',
        padding: '10px 10px', 
        '@media (max-width: 1024px)': {
            padding: '10px 2px;'
        },
    },
    redButton: theme.redButton,
 
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
    
    openChatText: {
        '@media (max-width: 1024px)': {
            display:"none"
        }, 
    },

});




class JobPostedToRow extends React.Component{ 
    constructor(props){
        super(props);
        this.state={
            showChat:props.showChat,
            job: props.job
        }
    }
    render(){
        const { classes, i } = this.props;
        const { job } = this.state;
        return <TableRow key={i} className={classes.tableRow}>
            <TableCell className={classes.tableCell}>{job.title}</TableCell>
            <TableCell className={classes.tableCell}>{job.companyName}</TableCell>
            <TableCell className={classes.tableCell}>
                {
                    (job.migalooAccepted === false || job.employerAccepted === false || job.jobAccepted === false)?
                        "Denied" :
                        (
                            job.migalooAccepted === null ? "Pending Migaloo Acceptance" :
                            (
                                job.employerAccepted === null ? "Pending Employer Acceptance" :
                                (
                                    job.jobAccepted === null ? "Pending Job Acceptance" :
                                        "Accepted By Employer"
                                )
                            )
                        )
                }
                {(job.migalooAccepted === false || job.employerAccepted === false || job.jobAccepted === false) &&
                    <Tooltip classes={{tooltip: classes.toolTipText}}
                    data-html="true"
                    title={<div>{job.denialReasonText+'.'}<br/>{job.denialComment}</div>}
                    aria-label="Denial Reason">
                        <Info className={classes.toolTip}/>
                    </Tooltip>
                }
            </TableCell>
            <TableCell className={classes.tableCell}>
                <Button
                    variant="contained" 
                    color="primary"
                    onClick={()=>this.setState({showChat:true})}>
                    <Chat/>&nbsp;<span className={classes.openChatText}>Open Chat</span>
                </Button>
                {this.state.showChat && 
                    <Conversation
                        messageSubjectId={job.messageSubjectId}
                        loadByMessageSubjectId={true}
                        open={this.state.showChat}
                        onClose={()=>this.setState({showChat: false})}/>
                }
            </TableCell>
        </TableRow>
    }
}
JobPostedToRow = withStyles(styles)(JobPostedToRow)





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
            onEdit: props.onEdit,
            currentJobList: [],
            onDelete: props.onDelete
        };
        this.Auth = new AuthFunctions();
    }
    
/*     componentDidMount = () => {
        this.getPostedJobs();
    } */
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
    getJobsPostedTo = (candidateId) => {
        get('/api/candidate/listJobs/'+candidateId)
        .then((res)=>{
            if(res && res.data.success)
                this.setState({currentJobList:res.data.jobList})
        }).catch(errors => 
            console.log(errors)
        )
    }

    render(){ 
        const { classes, candidateData, postData } = this.props;
        return (
            <div className="expandableRow">
                {this.state.redirectCandidate && <Redirect to={`/recruiter/jobList/${this.props.candidateData.candidateId}`}/>}
                
                {/* CANDIDATE ACCORDION */}
                <ExpansionPanel square={true} className={classes.root}>
                    
                    {/* HEADER CONTAINER */}
                    <ExpansionPanelSummary onClick={() => this.getJobsPostedTo(this.props.candidateData.candidateId)}>
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
                            
                            {/* CANDIDATE INFORMATION LIST*/}
                            <div className="infoRowContainer">
                                <div className="infoRow">
                                    <div className="icon"><TagsImage/></div>
                                    <div className="title"><b>Tags: </b></div>
                                    <div className="item">{(candidateData.tagNames||[]).join(", ")}</div>
                                </div>
                                <div className="infoRow">
                                    <div className="icon"><ExperienceImage/></div>
                                    <div className="title"><b>Experience: </b></div>
                                    <div className="item">{candidateData.experience} years</div>
                                </div>
                                <div className="infoRow">
                                    <div className="icon"><EmailImage/></div>
                                    <div className="title"><b>Email: </b></div>
                                    <div className="item">{candidateData.email}</div>
                                </div>
                            </div>

                            <div className="splitter"></div> 

                            {/* CANDIDATE ACCEPTED/NOT ACCPETED ROW*/}
                            <div className="a_container">
                                <div className="acceptedContainer">
                                    <div className="icon"><ThumbUp/></div>
                                    <div className="heading"><b>Accepted</b> {candidateData.acceptedCount} time{candidateData.acceptedCount > 1 ? 's' : ''}</div>
                                </div>
                                <div className="declinedContainer">
                                    <div className="heading"><b>Not Accepted</b> {candidateData.notAcceptedCount} time{candidateData.notAcceptedCount > 1 ? 's' : ''}</div>
                                    <div className="icon"><ThumbDown/></div>
                                </div>
                            </div>
                              
                            {/* CANDIDATE POSTED TO JOBS TABLE */}
                            <Table className={classes.tableBody}>
                                <TableHead className={classes.tableHeading}>
                                    <TableRow className={classes.tableHeaderContainer}>
                                        <TableCell className={classes.tableCellHeader}>Title</TableCell>
                                        <TableCell className={classes.tableCellHeader}>Company</TableCell> 
                                        <TableCell className={classes.tableCellHeader}>Status</TableCell>
                                        <TableCell className={classes.tableCellHeader}>Chat</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        this.state.currentJobList.length === 0 ? 
                                        <TableRow className={classes.tableRow}>
                                            <TableCell colSpan={5} className={classes.tableCellHeader}>No jobs posted to</TableCell>
                                        </TableRow> :
                                        this.state.currentJobList.map((d, i)=>
                                            <JobPostedToRow key={i} job={d}/>
                                        )
                                    }
                                </TableBody>
                            </Table>


                            {/* CANDIDATE BUTTONS ROW */}
                            <div className="candidateButtonsContainer">
                                <Button className={classes.button} variant="contained" color="primary" onClick={this.state.onEdit}>
                                    <div className="buttonsContainer">
                                        <div className="image"><Edit/></div> 
                                        <div className="text">Edit</div>
                                    </div> 
                                </Button>  

                                <Button className={classes.button} variant="contained" color="primary" onClick={this.searchJobsForCandidates}>
                                    <div className="buttonsContainer">
                                        <div className="image"><img className="img1" src={whaleImage} alt="whaleTail" /></div>
                                        <div className="text">SEARCH JOBS</div>
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
                                <Button className={classes.button}
                                variant="contained" color="primary"
                                className={classNames(classes.button, classes.redButton)}
                                onClick={this.props.onDelete}>
                                    <div className="buttonsContainer">
                                        <div className="image"><Delete/></div> 
                                        <div className="text">Delete</div>
                                    </div>
                                </Button>
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
                            {this.state.showUpload && <UploadResumeModal id={candidateData.candidateId} onClose={this.handleClose} />}
                        
                        </div> 
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div> 
        )
    }
}
 
export default withStyles(styles)(ExpandableRow);
