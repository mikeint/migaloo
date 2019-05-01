import React from 'react';
import ApiCalls from '../../../../../ApiCalls';  
import AuthFunctions from '../../../../../AuthFunctions'; 
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
import { NavLink } from 'react-router-dom';  

import { withStyles } from '@material-ui/core/styles';  
import DenialReason from '../../../../../components/DenialReason/DenialReason';
  

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
            rowObj: props.obj,
            getReason: false
        };
        this.Auth = new AuthFunctions();
    }
    
    handleRead = () => {
        if(!this.state.rowObj.has_seen_post){
            var newRowObj = {};
            Object.assign(newRowObj, this.state.rowObj);
            newRowObj.has_seen_post = true;
            this.setState({rowObj:newRowObj});
            ApiCalls.post(`/api/employerPostings/setRead/${this.props.job.post_id}/${this.props.obj.candidate_id}`, {})
            .then((res)=>{

            }).catch(errors => 
                console.log(errors.response.data)
            )
        }
    }
    getResumeURL = () => {
        ApiCalls.get('/api/resume/view/'+this.props.obj.candidate_id)
        .then((res)=>{
            if(res && res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors.response.data)
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
        ApiCalls.post(`/api/employerPostings/setAccepted/${type}/${this.state.jobObj.post_id}/${this.state.rowObj.candidate_id}/${this.state.rowObj.recruiter_id}`,
            {accepted:accepted, denialReasonId: denialReasonId})
        .then((res)=>{
            if(res == null) return
            var newRowObj = {};
            Object.assign(newRowObj, this.state.rowObj);
            newRowObj[type+'_accepted'] = accepted;
            this.setState({rowObj:newRowObj});
        }).catch(errors => 
            console.log(errors.response.data)
        )
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
        return (
            <ExpansionPanel onClick={this.handleRead.bind(this)}>
                <ExpansionPanelSummary>
                    <span>{this.state.rowObj.candidate_first_name}</span>
                    {this.state.rowObj.has_seen_post ? '' : <FiberNew className={classes.newIndicator} />}
                    {/* <span className="coins">{this.state.rowObj.coins} coins(s)</span> */}
                    <div></div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div className={classes.flex}>
                        <div className={classes.flexColumn}>
                            {this.state.rowObj.resume_id != null && 
                                <Button
                                    variant="contained" 
                                    color="primary"
                                    onClick={this.getResumeURL}>View Resume</Button>}
                            <div className={classes.rowMargin}>Posted: <span className={classes.rowData}>
                                {this.state.rowObj.posted}
                            </span></div>
                        </div>
                        <div className={classes.flexColumn}>
                            <div className={classes.rowMargin}>Recruiter: <span className={classes.rowData}>
                                {this.state.rowObj.first_name} {this.state.rowObj.last_name}
                            </span></div>
                            <div className={classes.rowMargin}>Phone Number: <span className={classes.rowData}>
                                <a className={classes.a} href={"tel:"+this.state.rowObj.phone_number}>{this.state.rowObj.phone_number}</a>
                            </span></div>
                            <div className={classes.rowMargin}>Email: <span className={classes.rowData}>
                                <a className={classes.a} href={"mailto:"+this.state.rowObj.email}>{this.state.rowObj.email}</a>
                            </span></div>
                        </div>
                        <div className={classes.flexColumn}>
                            <Button
                                variant="contained" 
                                color="primary"
                                onClick={()=>this.handleResponse('migaloo', true)}
                                className={classes.marginRight}>
                                <ThumbUp className={this.trueFalseNull(this.state.rowObj.migaloo_accepted, classes.selected, classes.notselected, '')}/>&nbsp;Migaloo Accepts
                            </Button>
                            <Button
                                variant="contained" 
                                color="primary"
                                onClick={()=>this.handleResponse('migaloo', false)}
                                className={classes.marginRight}>
                                <ThumbDown className={this.trueFalseNull(this.state.rowObj.migaloo_accepted, classes.notselected, classes.selected, '')}/>&nbsp;Reject
                            </Button>
                        </div>
                        {this.state.rowObj.migaloo_accepted === true && 
                            <React.Fragment>
                                <NavLink to={`/employer/chat/${this.props.job.post_id}/${this.props.obj.candidate_id}`}>
                                    <Button
                                    variant="contained" 
                                    color="primary">
                                    <Chat/>&nbsp;Open Chat
                                    </Button>
                                </NavLink>
                                <div className={classes.flexColumn}>
                                    <Button
                                        variant="contained" 
                                        color="primary"
                                        onClick={()=>this.handleResponse('employer', true)}
                                        className={classes.marginRight}>
                                        <Interview className={this.trueFalseNull(this.state.rowObj.employer_accepted, classes.selected, classes.notselected, '')}/>&nbsp;Employer Accepts
                                    </Button>
                                    <Button
                                        variant="contained" 
                                        color="primary"
                                        onClick={()=>this.handleResponse('employer', false)}
                                        className={classes.marginRight}>
                                        <NoInterview className={this.trueFalseNull(this.state.rowObj.employer_accepted, classes.notselected, classes.selected, '')}/>&nbsp;Rejects
                                    </Button>
                                </div>
                                {this.state.rowObj.employer_accepted === true && 
                                    <div className={classes.flexColumn}>
                                        <Button
                                            variant="contained" 
                                            color="primary"
                                            onClick={()=>this.handleResponse('job', true)}
                                            className={classes.marginRight}>
                                            <Work className={this.trueFalseNull(this.state.rowObj.job_accepted, classes.selected, classes.notselected, '')}/>&nbsp;Got the Job
                                        </Button>
                                        <Button
                                            variant="contained" 
                                            color="primary"
                                            onClick={()=>this.handleResponse('job', false)}
                                            className={classes.marginRight}>
                                            <NoWork className={this.trueFalseNull(this.state.rowObj.job_accepted, classes.notselected, classes.selected, '')}/>&nbsp;Rejected
                                        </Button>
                                    </div>
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
