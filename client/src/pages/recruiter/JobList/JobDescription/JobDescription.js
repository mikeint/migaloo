import React from 'react';
import './JobDescription.css'; 
import {get} from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import {Redirect} from 'react-router-dom';
import PostCandidateToJob from '../../../PostCandidateToJob/PostCandidateToJob';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Close from '@material-ui/icons/Close';
import ThumbUp from '@material-ui/icons/ThumbUp';
import ThumbDown from '@material-ui/icons/ThumbDown';
import Info from '@material-ui/icons/Info';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
    drawer:{ 
        minWidth: "300px",
        position: "relative"
    },
    rightBtn:{
        float: "right",
    },
    searchBtn:{
        width: "80%",
        flex: "1 100%",
        margin: 10,
    },
    feedbackBtnContainer:{
        display: "flex",
        flexWrap: "wrap",
    },
    feedbackBtn:{
        flex: "1 1",
        margin: 10,
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
    jobTitle: {
        fontWeight: "bold"
    },
    jobSalary: {
        fontSize: "14px"
    },
    jobPostingHeader: {
        background: "#546f82",
        color: "#fff",
        padding: "20px",
        fontSize: "22px"
    },
    jobPostingContent: {    
        fontSize: "16px",
        margin: "0px 10px"
    },
    jobCaption: {
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
class JobDescription extends React.Component{

    constructor(props){
        super(props);
        this.state={ 
            user: {},
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
        this.Auth = new AuthFunctions();
    } 
    componentDidMount = () => {
        this.setState({ user: this.Auth.getUser() }, ()=>{
            this.getImage();
        });
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
                console.log(res.data)
                const jobList = res.data.jobList;
                const candidateData = res.data.candidate;
                this.setState({
                    jobObj: jobList[0],
                    candidateData: candidateData }) 
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    listCandidates = () => {
        ApiCalls.get('/api/recruiterJobs/listPostedCandidates/'+this.state.jobId)
        .then((res)=>{
            if(res && res.data.success){
                this.setState({candidateList: res.data.candidates }) 
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }

    getImage = () => {
        get(`/api/profileImage/view/2/${this.state.jobObj.company_id}/small`)
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
                        {this.state.redirectJob ? <Redirect to={'/recruiter/candidateList/'+this.state.jobObj.post_id}/> : ''}
                        {this.state.profileImage !== ''?<img className={classes.profileImage} src={this.state.profileImage} alt="" onClick={this.showUpload}/>:''}
                        <div className={classes.jobTitle}>
                            {this.state.jobObj.title}
                        </div>
                        
                        {/* <div className="backButton" onClick={() => this.closeJobPage()}></div> */}
                        <span className="jobSalary">Salary: {this.state.jobObj.salary_type_name}</span> 
                    </div> 
                    <div className={classes.jobPostingContent}>

                        <h3>Description</h3>
                        <div className={classes.jobCaption}>{this.state.jobObj.caption}</div>
                        <h3>{this.state.jobObj.company_name}</h3>
                        <p>
                            {this.state.jobObj.address_line_1}<br/>
                            {this.state.jobObj.address_line_2}<br/>
                            {[this.state.jobObj.city, this.state.jobObj.state, this.state.jobObj.country].filter(d=>d!=null).join(", ")}
                        </p>
                        <h5>Experience: {this.state.jobObj.experience_type_name}</h5>
                        <span className={classes.jobSalary}>Salary: {this.state.jobObj.salary_type_name}</span> 
                        {this.state.jobObj.tag_names?<p>Tags: {this.state.jobObj.tag_names.join(", ")}</p>:''}
                        <p>Posted: {this.state.jobObj.posted}</p>
                        <div className={classes.feedbackBtnContainer}>
                            <Button
                                className={classes.searchBtn} 
                                color="primary"
                                variant="contained"
                                onClick={this.searchJobsForCandidates}>Search For Candidates</Button>
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
                                <TableRow>
                                    <TableCell align="center" className={classes.tableCellHeader}>First Name</TableCell>
                                    <TableCell align="center" className={classes.tableCellHeader}>Last Name</TableCell>
                                    <TableCell align="center" className={classes.tableCellHeader}>Posted</TableCell>
                                    <TableCell align="center" className={classes.tableCellHeader}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {
                                this.state.candidateList.length === 0 ? 
                                <TableRow className={classes.tableRow}>
                                    <TableCell colSpan={4} align="center" className={classes.tableCellHeader}>No Candidates Posted</TableCell>
                                </TableRow> :
                                this.state.candidateList.map((d, i)=>{
                                    return <TableRow key={i} className={classes.tableRow}>
                                        <TableCell className={classes.tableCell}>{d.first_name}</TableCell>
                                        <TableCell className={classes.tableCell}>{d.last_name}</TableCell>
                                        <TableCell className={classes.tableCell}>{d.created}</TableCell>
                                        <TableCell className={classes.tableCell}>
                                            {
                                                (d.migaloo_accepted === false || d.employer_accepted === false || d.job_accepted === false)?
                                                    "Denied" :
                                                    (
                                                        d.migaloo_accepted === null ? "Pending Migaloo Acceptance" :
                                                        (
                                                            d.employer_accepted === null ? "Pending Employer Acceptance" :
                                                            (
                                                                d.job_accepted === null ? "Pending Job Acceptance" :
                                                                    "Accepted By Employer"
                                                            )
                                                        )
                                                    )
                                            }
                                            {(d.migaloo_accepted === false || d.employer_accepted === false || d.job_accepted === false) &&
                                                <Tooltip classes={{tooltip: classes.toolTipText}}
                                                data-html="true"
                                                title={<div>{d.denial_reason_text}<br/>{d.denial_comment}</div>}
                                                aria-label="Denial Reason">
                                                    <Info className={classes.toolTip}/>
                                                </Tooltip>
                                            }
                                        </TableCell>
                                    </TableRow>
                                })
                            }
                            </TableBody>
                        </Table>
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