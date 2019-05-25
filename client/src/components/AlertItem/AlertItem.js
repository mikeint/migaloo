import React from 'react';
import './AlertItem.css';    

class AlertItem extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {

        };
    }
    // candidateId, postId, postedOn, c.firstName, coins, alertCount, title
    // cp.candidateId, postId, migalooAccepted, migaloo_respondedOn, coins, alertCount, c.firstName, c.lastName
    render(){
        const alert = this.props.alert;
        var row1, row2, row3;
        if(alert.userType === 1){ // Recuiter
            row1 = `${alert.firstName} ${alert.lastName} has ${alert.migalooAccepted?'':'not '} been accepted`;
            row3 = alert.responded;
        }else{ // Employer
            var title = alert.title;
            title = title.length > 30 ? title.substring(0, 27).replace(/(^[^A-Za-z0-9]+|[^A-Za-z0-9]+$)/g, '').trim()+'...': title; // Limit the title to 30 characters
            row1 = `${alert.firstName} has been posted to`;
            row2 = `${title}`;
            row3 = alert.created;
        }
        return (
            <React.Fragment>
                <div className="alertItem">
                    <div className="alertRow">{row1}</div>
                    <div className="alertRow">{row2}</div>
                    <div className="alertTimeRow">{row3}</div>
                </div> 
            </React.Fragment>
        );
    }
};

export default AlertItem;
