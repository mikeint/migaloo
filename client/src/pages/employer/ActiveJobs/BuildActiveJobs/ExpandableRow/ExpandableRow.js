import React from 'react';
import './ExpandableRow.css'; 
import ApiCalls from '../../../../../ApiCalls';  
import AuthFunctions from '../../../../../AuthFunctions'; 
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ThumbDown from '@material-ui/icons/ThumbDown';
import ThumbUp from '@material-ui/icons/ThumbUp';
import FiberNew from '@material-ui/icons/FiberNew';
import Chat from '@material-ui/icons/Chat';
import { NavLink } from 'react-router-dom';  

import { withStyles } from '@material-ui/core/styles';  
  

const styles = theme => ({
    newIndicator:{
        marginLeft:"20px"
    },
    selected:{
        color:"#263c54"
    },
    notselected:{
        color:"grey"
    }
});
class ExpandableRow extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            jobObj: props.job,
            rowObj: props.obj,
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
    handleResponse = (accepted) => {
        ApiCalls.post(`/api/employerPostings/setAcceptedState/${this.state.jobObj.post_id}/${this.state.rowObj.candidate_id}/${this.state.rowObj.recruiter_id}`, {accepted:accepted})
        .then((res)=>{
            if(res == null) return
            var newRowObj = {};
            Object.assign(newRowObj, this.state.rowObj);
            newRowObj.accepted = accepted;
            newRowObj.not_accepted = !accepted;
            this.setState({rowObj:newRowObj});
        }).catch(errors => 
            console.log(errors.response.data)
        )
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
                    <div className="flex">
                        <div className="flexColumn">
                            {this.state.rowObj.resume_id != null ? <div className="rowButton" onClick={this.getResumeURL}>View Resume</div> : ''}
                            <div className="rowMargin">Posted: <span className="rowData">{this.state.rowObj.posted}</span></div>
                        </div>
                        <div className="flexColumn">
                            <div className="rowMargin">Recruiter: <span className="rowData">{this.state.rowObj.first_name} {this.state.rowObj.last_name}</span></div>
                            <div className="rowMargin">Phone Number: <span className="rowData"><a href={"tel:"+this.state.rowObj.phone_number}>{this.state.rowObj.phone_number}</a></span></div>
                            <div className="rowMargin">Email: <span className="rowData"><a href={"mailto:"+this.state.rowObj.email}>{this.state.rowObj.email}</a></span></div>
                        </div>
                        <div className="flexColumn">
                            <Button onClick={()=>this.handleResponse(true)}>
                                <ThumbUp className={(this.state.rowObj.accepted?classes.selected:(this.state.rowObj.not_accepted?classes.notselected:""))}/>
                            </Button>
                            <Button onClick={()=>this.handleResponse(false)}>
                                <ThumbDown className={(this.state.rowObj.not_accepted?classes.selected:(this.state.rowObj.accepted?classes.notselected:""))}/>
                            </Button>
                        </div>
                        {this.state.rowObj.accepted && 
                            <NavLink to={`/employer/chat/${this.props.job.post_id}/${this.props.obj.candidate_id}`}>
                                <Button
                                variant="contained" 
                                color="primary">
                                    <Chat/>&nbsp;
                                    Open Chat
                                </Button>
                            </NavLink>
                        }
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }
}
 

export default withStyles(styles)(ExpandableRow);
