import React from 'react';
import './TopBar.css';    
import bell from '../../files/images/bell.png';
import axios from 'axios';
import AuthFunctions from '../../AuthFunctions'; 
import Overlay from '../../components/Overlay/Overlay';
import BuildNotifications from './BuildNotifications/BuildNotifications';

class TopBar extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {
            showOverlay: false,
            overlayConfig: {direction: "app-menu_t-b", swipeLocation: "swipeBack_b"},
            alertCount: 0,
            alertList: [],
        };
        this.Auth = new AuthFunctions();
        this.handleAlert();
    }

    callOverlay = (postId) => {
        this.setState({ showOverlay : !this.state.showOverlay })
        this.setState({ postId : postId })
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

    

    render(){
        const html = <BuildNotifications alertList={this.state.alertList} />;


        console.log(this.state.alertList) 

        return (
            <React.Fragment>
                <div className="topBar">
                    <div className="topBarLogo">HR</div>
                    <div className='alert'>
                        <span className="alertNumber" onClick={() => this.callOverlay()}>{this.state.alertCount}</span>
                        <img src={bell} onClick={() => this.callOverlay()} alt=""/>
                    </div>
                </div> 

                {this.state.showOverlay && <Overlay
                                                html={html}  
                                                callOverlay={this.callOverlay} 
                                                config={this.state.overlayConfig}
                                            />}

            </React.Fragment>
        );
    }
};

export default TopBar;
