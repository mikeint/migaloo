import React from 'react';
import './Notifications.css';    
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import AuthFunctions from '../../AuthFunctions'; 
import {get} from '../../ApiCalls';  
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import BuildNotifications from './BuildNotifications/BuildNotifications';
import IconButton from '@material-ui/core/IconButton';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    drawer:{
        width: "80%",
        minWidth: "300px",
        position: "relative"
    }
})
class Notifications extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {
            showOverlay: false,
            /* scrollY, */
            alertCount: 0,
            alertList: [],
        };
        this.Auth = new AuthFunctions();
    } 

    componentDidMount() {
        this.handleAlert();
    } 

    openNotifications = (postId) => {
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
        
        var userType = this.Auth.getUser().userType;
        get(userType===1?'/api/recruiter/alerts':'/api/accountManager/alerts')
        .then((res) => {
            if(res && res.data.success) {
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
        const { classes } = this.props;
        return (
            <React.Fragment>
                <IconButton color="inherit" onClick={() => this.openNotifications()}>
                    <Badge badgeContent={this.state.alertCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <SwipeableDrawer
                    anchor="top"
                    className={classes.drawer}
                    open={this.state.showOverlay}
                    onClose={()=>this.setState({"showOverlay":false})}
                    onOpen={()=>this.setState({"showOverlay":true})}
                    >
                    <BuildNotifications close={()=>this.setState({"showOverlay":false})} alertList={this.state.alertList} />
                </SwipeableDrawer>

            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Notifications);
