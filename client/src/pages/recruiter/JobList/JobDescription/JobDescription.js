import React from 'react';
import './JobDescription.css'; 
import {get} from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import {Redirect} from 'react-router-dom';
import PostCandidateToJob from '../../PostCandidateToJob/PostCandidateToJob';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Chat from '@material-ui/icons/Chat';
import Close from '@material-ui/icons/Close';
import ThumbUp from '@material-ui/icons/ThumbUp';
import ThumbDown from '@material-ui/icons/ThumbDown';
import Info from '@material-ui/icons/Info';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Conversation from '../../../../components/Conversation/Conversation';

import whaleHead from '../../../../files/images/landingPage/whaleHead.png';

const styles = theme => ({
    drawer:{ 
        minWidth: "300px",
        position: "relative"
    },
    rightBtn:{
        float: "right",
    },
    searchBtn:{ 
        flex: "1 100%",
        margin: 20,
    },
    feedbackBtnContainer:{
        display: "flex",
        flexWrap: "wrap",
        padding: "20px",
        background: '#546f8226',
    },
    feedbackBtn:{
        flex: "1 1", 
        margin: "10px 5px",
        maxWidth: "300px",

    },
    rightIcon: {
      marginLeft: theme.spacing.unit,
    },
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
    profileImage: {
        float: "right",
        margin: "20px",
        width: "200px"
    },
     
    openChatText: {
        '@media (max-width: 1024px)': {
            display:"none"
        }, 
    },



    summaryContainer: {
        padding: "0px 20px", 
    },
    summaryItem: {
        padding: "5px"
    },
    jobTitle: {
        fontWeight: "bold"
    }, 
    jobPostingHeader: {
        background: "#546f82",
        color: "#fff",
        padding: "20px",
        fontSize: "22px"
    },
    jobPostingContent: {    
        fontSize: "16px", 
    },
    jobRequirements: {
        padding: "20px",
        overflow: "hidden"
    },
    pageEnter:{
        animation: "slideInRight 0.4s forwards"
    },
    pageExit: {
        animation: "slideOutLeft 0.4s forwards"
    },
    toolTipText:{
        fontSize: "18px"
    },
    toolTip:{
        marginLeft: "15px"
    }
});
class CandidateRow extends React.Component{

    constructor(props){
        super(props);
        this.state={
            showChat:props.showChat,
            candidate: props.candidate
        }
    }
    render(){
        const { classes, i } = this.props;
        const { candidate } = this.state;
        return <TableRow key={i} className={classes.tableRow}>
            <TableCell className={classes.tableCell}>{candidate.firstName}</TableCell>
            <TableCell className={classes.tableCell}>{candidate.lastName}</TableCell>
            <TableCell className={classes.tableCell}>{candidate.created}</TableCell>
            <TableCell className={classes.tableCell}>
                {
                    (candidate.migalooAccepted === false || candidate.employerAccepted === false || candidate.jobAccepted === false)?
                        "Denied" :
                        (
                            candidate.migalooAccepted === null ? "Pending Migaloo Acceptance" :
                            (
                                candidate.employerAccepted === null ? "Pending Employer Acceptance" :
                                (
                                    candidate.jobAccepted === null ? "Pending Job Acceptance" :
                                        "Accepted By Employer"
                                )
                            )
                        )
                }
                {(candidate.migalooAccepted === false || candidate.employerAccepted === false || candidate.jobAccepted === false) &&
                    <Tooltip classes={{tooltip: classes.toolTipText}}
                    data-html="true"
                    title={<div>{candidate.denialReasonText+'.'}<br/>{candidate.denialComment}</div>}
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
                        messageSubjectId={candidate.messageSubjectId}
                        loadByMessageSubjectId={true}
                        open={this.state.showChat}
                        onClose={()=>this.setState({showChat: false})}/>
                }
            </TableCell>
        </TableRow>
    }
}
CandidateRow = withStyles(styles)(CandidateRow)
class JobDescription extends React.Component{

    constructor(props){
        super(props);
        this.Auth = new AuthFunctions();
        this.state={ 
            user: this.Auth.getUser(),
            profileImage: '',
            candidateId: props.match.params.candidateId,
            jobId: props.match.params.jobId,
            jobObj: {},
            redirectJob: false,
            showPostJob: false,
            enterSlide:props.classes.pageEnter,
            openJobPageState: false,
            candidateList:[]
        }
    } 
    componentDidMount = () => {
        this.getJobData();
        this.listCandidates();
    }
    componentWillUnmount = () => {
        this.setState({enterSlide:this.props.classes.pageExit})
    }
    getJobData = () => {
        (this.state.candidateId?
            get('/api/recruiterJobs/getCandidateForJob/'+this.state.candidateId+'/'+this.state.jobId):
            get('/api/recruiterJobs/get/'+this.state.jobId))
        .then((res)=>{
            if(res && res.data.success){
                this.getImage();
                const jobList = res.data.jobList;
                const candidateData = res.data.candidate;
                this.setState({
                    jobObj: jobList[0],
                    candidateData: candidateData }) 
            }
        }).catch(errors => {
            console.log(errors)
        })
    }
    listCandidates = () => {
        get('/api/recruiterJobs/listPostedCandidates/'+this.state.jobId)
        .then((res)=>{
            if(res && res.data.success){
                this.setState({candidateList: res.data.candidates }) 
            }
        }).catch(errors => {
            console.log(errors)
        })
    }

    getImage = () => {
        if(this.state.jobObj.companyId != null){
            get(`/api/profileImage/view/recruiter/small/${this.state.jobObj.companyId}`)
            .then((res)=>{
                if(res == null) return
                if(res.data.success){
                    this.setState({ profileImage: res.data.url }) 
                }else{
                    this.setState({ profileImage: '' })
                }
            }).catch(errors => {
                this.setState({ profileImage: '' })
            })
        }
    }
    searchJobsForCandidates = () => {
        this.setState({redirectJob:true})
    }
    postToJob = () =>{
        this.setState({showPostJob: true})
    }

    closeJobPage = () => {
        this.setState({openJobPageState: true}) 
    }


    render(){
        const { classes } = this.props;
        if(this.state.jobObj == null){
            return <div>Job can not be found.</div>
        }else


        if (this.state.openJobPageState) return <Redirect to={'/recruiter/jobList'+(this.state.candidateId?`/${this.state.candidateId}`:'')}/>

        return (
            <React.Fragment>
                <div className={this.state.enterSlide}> 
                    <div className={classes.jobPostingHeader}>
                        <IconButton color="inherit"
                            onClick={() => this.closeJobPage()}
                            className={classes.rightBtn}>
                            <Close color="primary"/>
                        </IconButton>
                        {this.state.redirectJob ? <Redirect to={'/recruiter/candidateList/'+this.state.jobObj.postId}/> : ''}
                        {this.state.profileImage !== ''?<img className={classes.profileImage} src={this.state.profileImage} alt="" onClick={this.showUpload}/>:''}
                        <div className={classes.jobTitle}>
                            {this.state.jobObj.title}
                        </div>
                        
                        {/* <div className="backButton" onClick={() => this.closeJobPage()}></div> */}
                        <span className="jobSalary">Salary: {this.state.jobObj.salary}k</span> 
                    </div> 
                    <div className={classes.jobPostingContent}>

                        
                        <div className={classes.jobRequirements}>
                            <h3>Description</h3>
                            {this.state.jobObj.requirements}
                        </div>
                         
                        <div className={classes.summaryContainer}>
                            <div className={classes.summaryItem}><b>Company </b>{this.state.jobObj.companyName}</div>
                            <div className={classes.summaryItem}><b>Address </b> {[this.state.jobObj.addressLine1, this.state.jobObj.addressLine2, this.state.jobObj.city, this.state.jobObj.stateProvince, this.state.jobObj.country].filter(d=>d!=null).join(", ")}</div>
                            <div className={classes.summaryItem}><b>Experience </b>{this.state.jobObj.experience} years</div>
                            <div className={classes.summaryItem}><b>Salary </b>{this.state.jobObj.salary}k</div> 
                            <div className={classes.summaryItem}>{this.state.jobObj.tagNames?<div><b>Tags </b>{this.state.jobObj.tagNames.join(", ")}</div>:''}</div>
                            <div className={classes.summaryItem}><b>Posted </b>{this.state.jobObj.posted}</div>
                        </div>
                        
                        <div className={classes.feedbackBtnContainer}> 
                            {this.state.candidateData && <Button
                                className={classes.searchBtn} 
                                color="primary"
                                variant="contained"
                                onClick={this.postToJob}>Post Candidate to Job</Button>}
                            <Button 
                                className={classes.feedbackBtn}
                                color="primary"
                                variant="contained">Im working on it <ThumbUp className={classes.rightIcon}/></Button>
                            <Button 
                                className={classes.feedbackBtn}
                                color="primary"
                                variant="contained">Not in my wheelhouse <ThumbDown className={classes.rightIcon}/></Button>
                        </div>
                        
                        <Table className={classes.tableBody}>
                            <TableHead className={classes.tableHeading}>
                                <TableRow className={classes.tableHeaderContainer}>
                                    <TableCell align="center" className={classes.tableCellHeader}>First Name</TableCell>
                                    <TableCell align="center" className={classes.tableCellHeader}>Last Name</TableCell>
                                    <TableCell align="center" className={classes.tableCellHeader}>Posted</TableCell>
                                    <TableCell align="center" className={classes.tableCellHeader}>Status</TableCell>
                                    <TableCell align="center" className={classes.tableCellHeader}>Chat</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {
                                this.state.candidateList.length === 0 ? 
                                <TableRow className={classes.tableRow}>
                                    <TableCell colSpan={5} align="center" className={classes.tableCellHeader}>No Candidates Posted</TableCell>
                                </TableRow> :
                                this.state.candidateList.map((d, i)=>
                                    <CandidateRow key={i} candidate={d}/>
                                )
                            }
                            </TableBody>
                        </Table>

                        <Button
                                className={classes.searchBtn} 
                                color="primary"
                                variant="contained"
                                onClick={this.searchJobsForCandidates}>Search For Candidates<img src={whaleHead} alt="" /></Button>
                    </div>
                </div>

 

                <Drawer
                    anchor="bottom"
                    className={classes.drawer}
                    open={this.state.showPostJob}
                    onClose={()=>this.setState({"showPostJob":false})}
                    // onOpen={()=>this.setState({"showPostJob":true})}
                > 
                    <PostCandidateToJob candidate={this.state.candidateData}
                                                job={this.state.jobObj}
                                                handleClose={()=>this.setState({showPostJob:false})} />
                </Drawer>
            </React.Fragment>
        )
    }
}
 
export default withStyles(styles)(JobDescription);