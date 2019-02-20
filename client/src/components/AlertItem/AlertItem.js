import React from 'react';
import './AlertItem.css';    
import AuthFunctions from '../../AuthFunctions'; 

class AlertItem extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {

        };
    }
    // candidate_id, post_id, posted_on, c.first_name, coins, alert_count, title
    // cp.candidate_id, post_id, accepted, not_accepted, responded_on, coins, alert_count, c.first_name, c.last_name
    render(){
        const alert = this.props.alert;
        if(alert.userType === 1){ // Recuiter
            var row1 = `${alert.first_name} ${alert.last_name} has ${alert.accepted?'':'not '} been accepted`;
            var row2 = `Your ${alert.coins} coins have been ${alert.accepted?'returned':'lost'}`;
            var row3 = alert.responded;
        }else{ // Employer
            var title = alert.title;
            title = title.length > 20 ? title.substring(0, 17)+'...': title; // Limit the title to 20 characters
            var row1 = `${alert.first_name} has been posted to ${alert.title} for ${alert.coins}`;
            var row2 = '';
            var row3 = alert.created;
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
