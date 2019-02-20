import React from 'react';
import './TopBar.css';    
import bell from '../../files/images/bell.svg';
import axios from 'axios';
import AuthFunctions from '../../AuthFunctions';
import AlertItem from '../AlertItem/AlertItem'; 

class TopBar extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {
            alertCount: 0,
            alertList: [],
            showAlerts: false
        };
        this.Auth = new AuthFunctions();
        this.handleAlert();
    }
    handleAlert = () => {
        
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        var userType = this.Auth.getUser().userType;
        axios.get(userType===1?'/api/recruiter/alerts':'/api/employer/alerts', config)
        .then((res) => {
            if(res.data.success) {
                var count = (res.data.alertList.length === 0 ? 0 : 
                    parseInt(res.data.alertList[0].alert_count, 10))
                count = count > 99 ? 99 : count;
                this.setState({
                    alertList: res.data.alertList.map(a=>{a.userType = userType; return a}),
                    alertCount: count
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    toggleAlerts = () => {
        this.setState({showAlerts:!this.state.showAlerts})
    }

    render(){  
        return (
            <React.Fragment>
                <div className="topBar">
                    <div className="topBarLogo">HR</div>
                    <div className='alert'>
                        <span className="alertNumber" onClick={this.toggleAlerts}>{this.state.alertCount}</span>
                        <img src={bell} onClick={this.toggleAlerts} alt="Alert"/>
                        <div className={this.state.showAlerts ? 'alertListContainer on' : 'alertListContainer'}>
                        <div className='alertList'>
                            {
                                this.state.alertList.map((item, i) => {
                                    return <AlertItem key={i} alert={item}/>
                                })
                            }
                        </div>
                        </div>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default TopBar;
