import React from 'react';
import './ExpandableRow.css'; 
import UploadResume from '../UploadResume/UploadResume';
import axios from 'axios';
import AuthFunctions from '../../../../AuthFunctions'; 

class ExpandableRow extends React.Component{

    constructor() {
        super();
        // Initial state
        this.state = { 
            open: false,
            showUpload: false,
            resumeId: null,
            files: []
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
                <div className="candidateListItem" onClick={this.toggle.bind(this)}> 
                        {rowObj.first_name} {rowObj.last_name}
                        {rowObj.new_accepted_count > 0 ? <span className="acceptedCount" title={rowObj.new_accepted_count+" New Postings Accepted"}>{rowObj.new_accepted_count}</span> : ""}
                        {rowObj.new_not_accepted_count > 0 ? <span className="notAcceptedCount" title={rowObj.new_not_accepted_count+" New Postings Not Accepted"}>{rowObj.new_not_accepted_count}</span> : ""}
                </div>
                <div className={"collapse" + (this.state.open ? ' in' : '')}>
                    <div className="flex">
                        <div className="flexColumn">
                            <div className="rowMargin">Email: {rowObj.email}</div>
                            <div className="rowMargin">Created: {rowObj.created}</div>
                            <div className="rowMargin">Coins Spent on Candidate: {rowObj.coins_spent} coins(s)</div>
                            <div className="rowMargin">Posted to Job: {rowObj.posted_count} time(s)</div>
                        </div>
                        <div className="flexColumn">
                            <div className="rowMargin">Accepted by Postings: {rowObj.accepted_count} time(s)</div>
                            <div className="rowMargin">Not Accepted by Postings: {rowObj.not_accepted_count} time(s)</div>
                            {rowObj.resume_id != null ? <div className="rowButton" onClick={this.getResumeURL}>View Resume</div> : ''}
                            <div className="rowButton" onClick={this.showUpload}>Upload Resume</div>
                            
                            {this.state.showUpload?<UploadResume id={rowObj.candidate_id} handleClose={this.handleClose} />:''}
                        </div>
                    </div>
                </div> 
            </div> 
        )
    }
}
 

export default ExpandableRow;