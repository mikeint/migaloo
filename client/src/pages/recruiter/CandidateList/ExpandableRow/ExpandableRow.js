import React from 'react';
import './ExpandableRow.css'; 
 
  
class ExpandableRow extends React.Component{

    constructor() {
        super();
        // Initial state
        this.state = { open: false };
    }
    
    toggle() {
        this.setState({
            open: !this.state.open
        });
    }

    render(){ 

        const rowObj = this.props.obj;
        return (
            <div>
                <div className="row" onClick={this.toggle.bind(this)}>
                    <div>
                        {rowObj.first_name} {rowObj.last_name}
                        {rowObj.new_accepted_count > 0 ? <span className="acceptedCount" title={rowObj.new_accepted_count+" New Postings Accepted"}>{rowObj.new_accepted_count}</span> : ""}
                        {rowObj.new_not_accepted_count > 0 ? <span className="notAcceptedCount" title={rowObj.new_not_accepted_count+" New Postings Not Accepted"}>{rowObj.new_not_accepted_count}</span> : ""}
                    </div>
                </div>
                <div className={"collapse" + (this.state.open ? ' in' : '')}>
                    <div className="flex">
                        <div className="flexColumn">
                            <div>Email: {rowObj.email}</div>
                            <div>Created: {rowObj.created}</div>
                            <div>Posted to Job: {rowObj.posted_count} time(s)</div>
                            {rowObj.resume_id != null ? <a href="/api/resume/{rowObj.resume_id}">Resume</a> : ''}
                        </div>
                        <div className="flexColumn">
                            <div>Accepted by Postings: {rowObj.accepted_count} time(s)</div>
                            <div>Not Accepted by Postings: {rowObj.not_accepted_count} time(s)</div>
                            <div>Coins Spent on Candidate: {rowObj.coins_spent} coins(s)</div>
                        </div>
                    </div>
                </div> 
            </div> 
        )
    }
}
 

export default ExpandableRow;