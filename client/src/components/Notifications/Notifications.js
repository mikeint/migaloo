import React from 'react';
import './Notifications.css';    
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import bell from '../../files/images/bellW.png';
import axios from 'axios';
import AuthFunctions from '../../AuthFunctions'; 
import Overlay from '../Overlay/Overlay';
import BuildNotifications from './BuildNotifications/BuildNotifications';

class Notifications extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {
            showOverlay: false,
            overlayConfig: {direction: "t-b", swipeLocation: "b"}, 
            scrollY,
            alertCount: 0,
            alertList: [],
        };
        this.Auth = new AuthFunctions();
    } 

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        this.handleAlert();
    } 
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    } 
    handleScroll = (e) => {
        let scrollTop = event.srcElement.body.scrollTop,
            itemTranslate = Math.min(0, scrollTop/3 - 60);
    
        this.setState({
            scrollY: itemTranslate
        });
    }

    callOverlay = (postId) => {
        if (this.state.alertCount === 0) {
            Swal.fire({
                position: 'top-end',
                type: 'success',
                title: 'You are all caught up',
                showConfirmButton: false,
                timer: 1500
              })
        } else {
            this.setState({ showOverlay : !this.state.showOverlay })
            this.setState({ postId : postId })
        }
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
        return (
            <React.Fragment>
                <div className="Notifications"> 
                    <div className={scrollY > 5 ? 'alert opacAlert' : 'alert'}>
                        <span className="alertNumber" onClick={() => this.callOverlay()}>{this.state.alertCount}</span>
                        <img className="bellNotificationImg" src={bell} onClick={() => this.callOverlay()} alt=""/>
                    </div>
                </div> 

                {this.state.showOverlay && <Overlay
                                                html={<BuildNotifications alertList={this.state.alertList} />}  
                                                handleClose={this.callOverlay} 
                                                config={this.state.overlayConfig}
                                            />}

            </React.Fragment>
        );
    }
};

export default Notifications;
