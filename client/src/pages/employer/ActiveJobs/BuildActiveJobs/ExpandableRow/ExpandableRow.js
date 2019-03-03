import React from 'react';
import './ExpandableRow.css'; 
import ApiCalls from '../../../../../ApiCalls';  
import AuthFunctions from '../../../../../AuthFunctions'; 

import acceptImg from '../../../../../files/images/accept.png';
import rejectImg from '../../../../../files/images/reject.png';

class ExpandableRow extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            open: false,
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
            ApiCalls.post(`/api/postings/setRead/${this.props.job.post_id}/${this.props.obj.candidate_id}`, {})
            .then((res)=>{

            }).catch(errors => 
                console.log(errors.response.data)
            )
        }
    }
    toggle() {
        this.setState({
            open: !this.state.open,
        });
        this.handleRead();
    }
    getResumeURL = () => {
        ApiCalls.get('/api/resume/view/'+this.props.obj.candidate_id)
        .then((res)=>{
            if(res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    handleAccept = () => {
        ApiCalls.post(`/api/postings/setAcceptedState/${this.props.job.post_id}/${this.props.obj.candidate_id}`, {accepted:true})
        .then((res)=>{
            var newRowObj = {};
            Object.assign(newRowObj, this.state.rowObj);
            newRowObj.accepted = true;
            newRowObj.not_accepted = false;
            this.setState({rowObj:newRowObj});
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    handleReject = () => {
        ApiCalls.post(`/api/postings/setAcceptedState/${this.props.job.post_id}/${this.props.obj.candidate_id}`, {accepted:false})
        .then((res)=>{
            var newRowObj = {};
            Object.assign(newRowObj, this.state.rowObj);
            newRowObj.accepted = false;
            newRowObj.not_accepted = true;
            this.setState({rowObj:newRowObj});
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    render(){ 
        return (
            <div className="expandableJobRow">
                <div className="candidateExpand" onClick={this.toggle.bind(this)}>
                    <div>
                        {this.state.rowObj.candidate_first_name} {this.state.rowObj.has_seen_post ? '' : <span className="newPost">New</span>}<span className="coins">{this.state.rowObj.coins} coins(s)</span>
                    </div>
                </div>
                <div className={"collapse" + (this.state.open ? ' in' : '')}>
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
                            <div className={"rowButton "+(this.state.rowObj.accepted?" selected":(this.state.rowObj.not_accepted?" notSelected":""))} onClick={this.handleAccept.bind(this)}><img className="thumbsBtn" src={acceptImg} alt="" /></div>
                            <div className={"rowButton "+(this.state.rowObj.not_accepted?" selected":(this.state.rowObj.accepted?" notSelected":""))} onClick={this.handleReject.bind(this)}><img className="thumbsBtn" src={rejectImg} alt="" /></div>
                        </div>
                    </div>
                </div> 
            </div> 
        )
    }
}
 

export default ExpandableRow;