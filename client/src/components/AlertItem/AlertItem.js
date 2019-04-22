import React from 'react';
import './AlertItem.css';    

class AlertItem extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {

        };
    }
    // candidate_id, post_id, posted_on, c.first_name, coins, alert_count, title
    // cp.candidate_id, post_id, migaloo_accepted, migaloo_responded_on, coins, alert_count, c.first_name, c.last_name
    render(){
        const alert = this.props.alert;
        var row1, row2, row3;
        if(alert.userType === 1){ // Recuiter
            row1 = `${alert.first_name} ${alert.last_name} has ${alert.migaloo_accepted?'':'not '} been accepted`;
            row3 = alert.responded;
        }else{ // Employer
            var title = alert.title;
            title = title.length > 30 ? title.substring(0, 27).replace(/(^[^A-Za-z0-9]+|[^A-Za-z0-9]+$)/g, '').trim()+'...': title; // Limit the title to 30 characters
            row1 = `${alert.first_name} has been posted to`;
            // row2 = `${title} for ${alert.coins} coin${alert.coins>1?'s':''}`;
            row2 = alert.created;
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
