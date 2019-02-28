import React from 'react';
import './ExpandableRow.css'; 
import UploadResume from '../UploadResume/UploadResume';
import axios from 'axios';
import AuthFunctions from '../../../../AuthFunctions'; 
import Redirect from 'react-router-dom/Redirect';

class ExpandableRow extends React.Component{

    constructor() {
        super();
        // Initial state
        this.state = { 
            open: false,
            showUpload: false,
            resumeId: null,
            files: [],
            redirectCandidate: false
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
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        axios.get('/api/resume/view/'+this.props.obj.candidate_id, config)
        .then((res)=>{
            if(res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    render(){ 

        const rowObj = this.props.obj;
        return (
            <div className="expandableRow">
                {this.state.redirectCandidate ? <Redirect to={'/recruiter/jobList/'+this.props.obj.candidate_id}/> : ''}
                <div className="candidateListItem" onClick={this.toggle.bind(this)}> 
                    {rowObj.coins_spent > 0 ? <div className="coinContainer"><span className="coinAmount">{rowObj.coins_spent}</span></div> : ""}
                    <div className="nameContainer">{rowObj.first_name} {rowObj.last_name}</div>
                    {rowObj.new_accepted_count > 0 ? <div className="acceptedCount" title={rowObj.new_accepted_count+" New Postings Accepted"}>{rowObj.new_accepted_count}</div> : ""}
                    {rowObj.new_not_accepted_count > 0 ? <div className="notAcceptedCount" title={rowObj.new_not_accepted_count+" New Postings Not Accepted"}>{rowObj.new_not_accepted_count}</div> : ""}
                </div>
                <div className={"collapse" + (this.state.open ? ' in' : '')}>
                    <div className="flex">
                        <div className="flexColumn">
                            <div className="rowMargin">Email: {rowObj.email}</div>
                            <div className="rowMargin">Created: {rowObj.created}</div>
                            <div className="rowMargin">Experience: {rowObj.experience_type_name}</div> 
                            {rowObj.tag_names?<div className="rowMargin">Tags: {rowObj.tag_names.join(", ")}</div>:''}
                            {/* <div className="rowMargin">Coins Spent on Candidate: {rowObj.coins_spent} coins(s)</div> */}
                            <div className="rowMargin">Posted to Job: {rowObj.posted_count} time(s)</div>
                            <div className="rowButton" onClick={this.searchJobsForCandidates}>Search Jobs</div>
                        </div>
                        <div className="flexColumn">
                            <div className="rowMargin">Accepted by Postings: {rowObj.accepted_count} time(s)</div>
                            <div className="rowMargin">Not Accepted by Postings: {rowObj.not_accepted_count} time(s)</div>
                            <div className="resumeButtons">
                                {rowObj.resume_id != null ? <div className="rowButton" onClick={this.getResumeURL}>View Resume</div> : ''}
                                <div className="rowButton" onClick={this.showUpload}>Upload Resume</div>
                            </div>
                            
                            {this.state.showUpload?<UploadResume id={rowObj.candidate_id} handleClose={this.handleClose} />:''}
                        </div>
                    </div>
                </div> 
            </div> 
        )
    }
}
 

export default ExpandableRow;