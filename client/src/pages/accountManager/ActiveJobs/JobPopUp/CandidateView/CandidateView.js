import React from 'react';
import {get, post} from '../../../../../ApiCalls';  
import AuthFunctions from '../../../../../AuthFunctions'; 
import {Redirect} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import FiberNew from '@material-ui/icons/FiberNew';
import Chat from '@material-ui/icons/Chat';
import ThumbDown from '@material-ui/icons/ThumbDown';
import ThumbUp from '@material-ui/icons/ThumbUp';
import Interview from '@material-ui/icons/RecordVoiceOver';
import NoInterview from '@material-ui/icons/VoiceOverOff';
import Work from '@material-ui/icons/Work';
import NoWork from '@material-ui/icons/WorkOff';

import { withStyles } from '@material-ui/core/styles';  
import DenialReason from '../../../../../components/DenialReason/DenialReason';
import { TextField } from '@material-ui/core';
  

const styles = theme => ({
    newIndicator:{
        marginLeft:"20px"
    },
    selected:{
        color:"lightgreen"
    },
    notselected:{
        color:"grey"
    },
    marginRight:{
        marginRight:"10px"
    },
    flex:{
        padding: "10px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        fontSize:"14px",
        background: "#8891b652",
        color: "#263c54"
    },
    flexColumn:{
        flex: "1 0",
        marginTop: 5,
        marginBottom: 5
    },
    rowMargin:{
        margin: "5px 0px"
    },
    a:{ 
        color: "#263c54"
    },
    rowData:{
        whiteSpace: "nowrap"
    }
});
class CandidateView extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            jobObj: props.job,
            candidate: props.obj,
            getReason: false,
            openChat: false,
            missingSalary: false,
            salary: null
        };
        this.Auth = new AuthFunctions();
    }
    
    handleRead = () => {
        if(!this.state.candidate.hasSeenPost){
            var newRowObj = {};
            Object.assign(newRowObj, this.state.candidate);
            newRowObj.hasSeenPost = true;
            this.setState({candidate:newRowObj});
            post(`/api/employerPostings/setRead/${this.props.job.postId}/${this.props.obj.candidateId}/${this.props.obj.recruiterId}`, {})
            .then((res)=>{

            }).catch(errors => 
                console.log(errors)
            )
        }
    }
    getResumeURL = () => {
        get('/api/resume/view/'+this.props.obj.candidateId)
        .then((res)=>{
            if(res && res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors)
        )
    }
    handleReasonClose = (event, value) => {
        if(event === 1){
            this.postResponse(this.state.type, this.state.accepted, value.denialReasonId)
        }
        this.setState({getReason: false, type:null, accepted:null});
    }
    handleResponse = (type, accepted) => {
        if(!accepted){
            this.setState({getReason: true, type:type, accepted:accepted});
        }else{
            this.postResponse(type, accepted, null);
        }
    }
    postResponse = (type, accepted, denialReasonId) => {
        if(type === 'job' && accepted === true && this.state.salary == null){
            this.setState({missingSalary: true})
            return
        }
        post(`/api/employerPostings/setAccepted/${type}/${this.state.jobObj.postId}/${this.state.candidate.candidateId}/${this.state.candidate.recruiterId}`,
            {accepted:accepted, denialReasonId: denialReasonId, salary:this.state.salary})
        .then((res)=>{
            if(res == null) return
            var newRowObj = {};
            Object.assign(newRowObj, this.state.candidate);
            newRowObj[type+'Accepted'] = accepted;
            this.setState({candidate:newRowObj});
        }).catch(errors => 
            console.log(errors)
        )
    }
    handleSalaryChange = (e) => {
        this.setState({salary:e.target.value, missingSalary:false})
    }
    trueFalseNull(value, classTrue, classFalse, classNull){
        if(value === true)
            return classTrue;
        else if (value === false)
            return classFalse;
        else
            return classNull;
    }
    render(){ 

        const { classes } = this.props; 
        if(this.state.openChat){
            return <Redirect push to={`/accountManager/chat/${this.props.job.postId}/${this.props.obj.candidateId}`}/>
        }
        return (
            <ExpansionPanel onClick={this.handleRead.bind(this)}>
                <ExpansionPanelSummary>
                    <span>{this.state.candidate.candidateFirstName}</span>
                    {this.state.candidate.hasSeenPost ? '' : <FiberNew className={classes.newIndicator} />}
                    {/* <span className="coins">{this.state.candidate.coins} coins(s)</span> */}
                    <div></div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div className={classes.flex}>
                        <div className={classes.flexColumn}>
                            {this.state.candidate.resumeId != null && 
                                <Button
                                    variant="contained" 
                                    color="primary"
                                    onClick={this.getResumeURL}>View Resume</Button>}
                            <div className={classes.rowMargin}>Posted: <span className={classes.rowData}>
                                {this.state.candidate.posted}
                            </span></div>
                        </div>
                        <div className={classes.flexColumn}>
                            <div className={classes.rowMargin}>Recruiter: <span className={classes.rowData}>
                                {this.state.candidate.firstName} {this.state.candidate.lastName}
                            </span></div>
                            <div className={classes.rowMargin}>Phone Number: <span className={classes.rowData}>
                                <a className={classes.a} href={"tel:"+this.state.candidate.phoneNumber}>{this.state.candidate.phoneNumber}</a>
                            </span></div>
                            <div className={classes.rowMargin}>Email: <span className={classes.rowData}>
                                <a className={classes.a} href={"mailto:"+this.state.candidate.email}>{this.state.candidate.email}</a>
                            </span></div>
                        </div>
                        <div className={classes.flexColumn}>
                            <Button
                                variant="contained" 
                                color="primary"
                                onClick={()=>this.setState({openChat:true})}>
                            <Chat/>&nbsp;Open Chat
                            </Button>
                        </div>
                        <div className={classes.flexColumn}>
                            <Button
                                variant="contained" 
                                color="primary"
                                onClick={()=>this.handleResponse('migaloo', true)}
                                className={classes.marginRight}>
                                <ThumbUp className={this.trueFalseNull(this.state.candidate.migalooAccepted, classes.selected, classes.notselected, '')}/>&nbsp;Migaloo Accepts
                            </Button>
                            <Button
                                variant="contained" 
                                color="primary"
                                onClick={()=>this.handleResponse('migaloo', false)}
                                className={classes.marginRight}>
                                <ThumbDown className={this.trueFalseNull(this.state.candidate.migalooAccepted, classes.notselected, classes.selected, '')}/>&nbsp;Reject
                            </Button>
                        </div>
                        {this.state.candidate.migalooAccepted === true && 
                            <React.Fragment>
                                <div className={classes.flexColumn}>
                                    <Button
                                        variant="contained" 
                                        color="primary"
                                        onClick={()=>this.handleResponse('employer', true)}
                                        className={classes.marginRight}>
                                        <Interview className={this.trueFalseNull(this.state.candidate.employerAccepted, classes.selected, classes.notselected, '')}/>&nbsp;Employer Accepts
                                    </Button>
                                    <Button
                                        variant="contained" 
                                        color="primary"
                                        onClick={()=>this.handleResponse('employer', false)}
                                        className={classes.marginRight}>
                                        <NoInterview className={this.trueFalseNull(this.state.candidate.employerAccepted, classes.notselected, classes.selected, '')}/>&nbsp;Rejects
                                    </Button>
                                </div>
                                {this.state.candidate.employerAccepted === true && 
                                    <React.Fragment>
                                        <div className={classes.flexColumn}>
                                            <TextField
                                                type="number"
                                                label="Agreed Salary"
                                                inputProps={{ min:"0", step:"any" }}
                                                onChange={this.handleSalaryChange}
                                                {...(this.state.missingSalary ? {error: true, helperText: "Please enter a salary before showing the job as accepted"} : {})}/>
                                        </div>
                                        <div className={classes.flexColumn}>
                                            <Button
                                                variant="contained" 
                                                color="primary"
                                                onClick={()=>this.handleResponse('job', true)}
                                                className={classes.marginRight}>
                                                <Work className={this.trueFalseNull(this.state.candidate.jobAccepted, classes.selected, classes.notselected, '')}/>&nbsp;Got the Job
                                            </Button>
                                            <Button
                                                variant="contained" 
                                                color="primary"
                                                onClick={()=>this.handleResponse('job', false)}
                                                className={classes.marginRight}>
                                                <NoWork className={this.trueFalseNull(this.state.candidate.jobAccepted, classes.notselected, classes.selected, '')}/>&nbsp;Rejected
                                            </Button>
                                        </div>
                                    </React.Fragment>
                                }
                            </React.Fragment>
                        }
                    </div>
                </ExpansionPanelDetails>
                <DenialReason 
                    open={this.state.getReason}
                    onClose={this.handleReasonClose} 
                />
            </ExpansionPanel>
        )
    }
}
 

export default withStyles(styles)(CandidateView);
