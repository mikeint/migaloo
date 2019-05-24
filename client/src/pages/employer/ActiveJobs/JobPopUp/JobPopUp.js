import React from 'react';
import {get, post} from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions';  
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import CandidateView from './CandidateView/CandidateView';
import RecruiterView from './RecruiterView/RecruiterView';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import red from '@material-ui/core/colors/red';
import classNames from 'classnames';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import AddRecruiter from './AddRecruiter/AddRecruiter';
import { NavLink } from 'react-router-dom';

const styles = theme => ({
    button:{ 
        width: "40%",
    },
    itemLabel:{
        fontWeight: "bold"
    },
    requirementsIndent:{
        marginLeft: 20
    },
    redButton: {
      color: theme.palette.getContrastText(red[500]),
      backgroundColor: red[500],
      '&:hover': {
        backgroundColor: red[700],
      },
    },
    buttonContainer:{
        display:"flex",
        placeContent:"space-evenly",
        marginTop:"10px",
        marginBottom:"10px"
    },
    alertClose: {
        position: "absolute",
        right: "10px"
    },
    alertTitle: {
        width: "100%",
        height: "50px",
        backgroundColor: "#263c54",
        textAlign: "center",
        color: "#fff",
        lineHeight: "50px",
        fontSize: "24px",
        fontWeight: "bold", 
        position: "relative"
    },
    jobPostingContainer:{
        padding: "0px 10px 0px 10px"
    },
    activeJobContainer:{
        overflow: "auto"
    },
    needsReview:{
        marginTop:20,
        marginBottom:20,
        textAlign:"center",
        fontSize: "2em"
    }
});
class JobPopUp extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            postId: props.obj.post_id,
            onClose: props.onClose,
            candidateList: [],
            tabValue: 0
        };
        this.Auth = new AuthFunctions();
    }
    componentDidMount = () => {
        this.getJobList();
    } 
    getJobList = () => {
        get('/api/employerPostings/listCandidates/'+this.state.postId)
        .then((res)=>{
            if(res && res.data.success){
                this.setState({ candidateList: res.data.candidateList });
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    removeJob = () => {
        this.state.onClose();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this job.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) { 
                post('/api/employerPostings/remove', {postId:this.state.postId})
                .then((res)=>{
                    if(res && res.data.success){
                        if(this.props.removedCallback != null){
                            this.props.removedCallback();
                        }
                        Swal.fire(
                            'Deleted!',
                            'Your job file has been deleted.',
                            'success'
                        )
                    }
                }).catch(errors => 
                    console.log(errors.response.data)
                )  
            } 
          })
    }
    hideJob = () => {
        this.state.onClose();
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will stop all future candidate postings.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, hide it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) { 
                post('/api/employerPostings/hide', {postId:this.state.postId})
                .then((res)=>{
                    if(res && res.data.success){
                        if(this.props.removedCallback != null){
                            this.props.removedCallback();
                        }
                        Swal.fire(
                            'Delisted!',
                            'Your job file has been delisted.',
                            'success'
                        )
                    }
                }).catch(errors => 
                    console.log(errors.response.data)
                )  
            } 
          })
    }
    handleTabChange = (event, tabValue) => {
        this.setState({ tabValue });
    };
    render(){ 

        const { classes } = this.props; 

        const jobObj = this.props.obj; 
        return ( 
            <div className={classes.activeJobContainer}> 
                <div className={classes.alertTitle} color="primary">
                    <span>{`${jobObj.title} - ${jobObj.company_name}`}</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={this.state.onClose}>
                        <Close />
                    </IconButton>
                </div>
                <div className={classes.jobPostingContainer}>
                    <p><span className={classes.itemLabel}>Requirements:</span></p>
                    <p className={classes.requirementsIndent}>{jobObj.requirements}</p>
                    <p><span className={classes.itemLabel}>Job Type:</span> {jobObj.job_type_name}</p> 
                    <p><span className={classes.itemLabel}>Experience:</span> {jobObj.experience}+ years</p> 
                    <p><span className={classes.itemLabel}>Salary:</span> {jobObj.salary}k</p> 
                    <p><span className={classes.itemLabel}>Open Positions:</span> {jobObj.open_positions}</p> 
                    <p><span className={classes.itemLabel}>Required Number of Interviewees:</span> {jobObj.interview_count}</p> 
                    {jobObj.opening_reason_id != null ?
                        <p><span className={classes.itemLabel}>Opening Reason:</span> {jobObj.opening_reason_name}</p>
                        :
                        <p><span className={classes.itemLabel}>Opening Reason Comment:</span> {jobObj.opening_reason_comment}</p> 
                    }
                    {jobObj.tag_names?<p><span>Tags:</span> {jobObj.tag_names.join(", ")}</p>:''}
                    <p><span className={classes.itemLabel}>Created:</span> {jobObj.created}</p>
                    <NavLink to={`/employer/postAJob/${jobObj.post_id}`}>
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                        >{jobObj.preliminary?'Edit and Post':'Edit'}</Button>
                    </NavLink>
                </div> 
                {!jobObj.preliminary?
                    <React.Fragment>
                        <Tabs variant="fullWidth" value={this.state.tabValue} onChange={this.handleTabChange}>
                            <Tab label="Candidates" />
                            <Tab label="Recruiters" />
                            <Tab label="Add Recruiter" />
                        </Tabs>
                        {this.state.tabValue === 0 && <Typography component="div" style={{ padding: 24 }}>
                            {
                                this.state.candidateList.map((d, i)=>{
                                    return <CandidateView obj={d} job={jobObj} key={i}/>
                                })
                            }
                        </Typography>}
                        {this.state.tabValue === 1 && <Typography component="div" style={{ padding: 24 }}>
                            <RecruiterView job={jobObj} />
                        </Typography>}
                        {this.state.tabValue === 2 && <Typography component="div" style={{ padding: 24 }}>
                            <AddRecruiter job={jobObj} />
                        </Typography>}
                        <div className={classes.buttonContainer}>
                            <Button
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                onClick={this.hideJob.bind(this)}>Delist Job Posting</Button>
                            <Button
                                variant="contained"
                                color="primary"
                                className={classNames(classes.button, classes.redButton)}
                                onClick={this.removeJob.bind(this)}>Delete Job Posting</Button>
                        </div>
                    </React.Fragment>
                    :
                    <div className={classes.needsReview}>This post requires review and is not yet posted</div>
                }
            </div> 
        )
    }
}
 

export default withStyles(styles)(JobPopUp);
