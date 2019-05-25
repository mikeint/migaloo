import React from 'react';
import Close from '@material-ui/icons/Close';
import AuthFunctions from '../../AuthFunctions'; 
import {get, post} from '../../ApiCalls';  
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import FiberNew from '@material-ui/icons/FiberNew';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import { Link } from 'react-router-dom'

const styles = theme => ({
    root: { 
        borderRadius: 0,
    },
    drawer:{
        width: "80%",
        minWidth: "300px",
        position: "relative"
    },
    notificationTitle:{
        fontWeight: "bold"
    },
    
    notificationClose: {
        position: "absolute",
        right: "10px"
    },
    title: {
        width: "100%",
        height: "50px",
        backgroundColor: theme.palette.primary.main,
        textAlign: "center",
        color: "#fff",
        lineHeight: "50px",
        fontSize: "24px",
        fontWeight: "bold", 
        position: "relative"
    },
    notificationList: {
        padding: "10px",
        height: "75%",
        overflowY: "scroll"
    },
    notificationItem: {
        borderBottom: "1px solid #1a2b6d59",
        padding: "10px 15px",
        background: "#1a2b6d0a",
        textWeight: "bold",
        borderRadius: "10px",
        marginBottom: "10px",
        display: "flex"
    },
    notificationColumn1: {
        flex: "1 1"
    },
    notificationColumn2: {
        alignSelf: "flex-end",
        textAlign: "center"
    },
    notificationTimeRow: {
        fontSize: "10px",
        paddingTop: "5px",
        textTransform: "uppercase",
        color: theme.palette.primary.main
    },
    notificationRowTitle: {
        fontWeight: "bold", 
        lineHeight: "unset"
    },
    notificationRow: {
        lineHeight: "unset"
    },
    loadMoreContainer:{
        margin: 10,
        textAlign: "center"
    },
    loadMore:{
        width: "80%"
    }
})
class Notifications extends React.Component{ 

    queue = [];
    constructor(props) {
        super(props);
		this.state = {
            showOverlay: false,
            /* scrollY, */
            newNotificationCount: 0,
            notificationList: [],
            open: false,
            messageInfo: {message:''},
            search_after: null
        };
        this.Auth = new AuthFunctions();
    } 

    componentDidMount() {
        this.getLastId().then(()=>{
            this.getNotifications();
            var intervalId = setInterval(this.timer, 30*1000);
            // store intervalId in the state so it can be accessed later:
            this.setState({intervalId: intervalId});
        })
    } 
    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        if(this.state.intervalId != null)
            clearInterval(this.state.intervalId);
    }
    
    timer = () => {
        // setState method is used to update the state
        this.getNewNotifications();
    }
    openNotifications = () => {
        this.setState({ showOverlay : !this.state.showOverlay })
    }
    processQueue = () => {
        if (this.queue.length > 0) {
            this.setState({
                messageInfo: this.queue.shift(),
                open: true,
            });
        }
    };

    handleClosePopUp = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ open: false });
    };
    handleGotoPopUp = (item) => {
        this.setSeen([item.notification_id]);
        this.setState({ open: false });
    };
    handleGotoDrawer = (item) => {
        this.setSeen([item.notification_id]);
        this.setState({"showOverlay":false})
    };

    handleExited = () => {
        this.processQueue();
    };

    getLastId = () => {
        return new Promise((resolve, reject)=>{
            get("/api/notifications/lastId")
            .then((res) => {
                if(res && res.data.success) {
                    this.setState({
                        lastNotificationId: res.data.lastNotificationId
                    }, resolve)
                }else
                    resolve()
            })
            .catch(error => {
                console.log(error);
                reject(error)
            });
        })
    }
    getNotifications = () => {
        get(this.state.search_after == null ?'/api/notifications/list/5':`/api/notifications/list/5/${this.state.search_after}`)
        .then((res) => {
            if(res && res.data.success) {
                res.data.notificationList.forEach(d=>d.notification_id = parseInt(d.notification_id, 10));
                var count = parseInt(res.data.counts.new_notification_count, 10);
                const minId = res.data.notificationList.length === 0 ? 0 : res.data.notificationList.map(d=>d.notification_id).reduce((a,b)=>Math.min(a,b));
                var notificationList = this.state.notificationList?this.state.notificationList:[];
                notificationList = notificationList.concat(res.data.notificationList);
                this.setState({
                    search_after: minId,
                    notificationList: notificationList,
                    newNotificationCount: count,
                    totalCount: parseInt(res.data.counts.notification_count, 10)
                });
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    setSeen = (notificationIds) => {
        post('/api/notifications/setSeen', {notificationIds:notificationIds})
        .then((res) => {})
        .catch(error => {
            console.log(error);
        });
        const notificationList = this.state.notificationList;
        var minusCount = 0;
        notificationIds.forEach(id=>{
            const data = notificationList.find(d=>d.notification_id === id);
            if(data != null){
                data.has_seen = true;
                minusCount--;
            }
        })
        this.setState({
            notificationList: notificationList,
            newNotificationCount: this.state.newNotificationCount - minusCount
        });
    }


    getNewNotifications = () => {
        var lastNotificationId  = this.state.lastNotificationId;
        get(lastNotificationId == null?`/api/notifications/listNew`:`/api/notifications/listNew/${lastNotificationId}`)
        .then((res) => {
            if(res && res.data.success) {
                lastNotificationId = res.data.notificationList.reduce((t,a)=>Math.max(a.notification_id, t), lastNotificationId);
                const newNotificationCount = this.state.newNotificationCount + res.data.notificationList.length;
                const allNotifications = this.state.notificationList;
                res.data.notificationList.forEach(d=>allNotifications.unshift(d));
                
                this.setState({
                    notificationList: allNotifications,
                    newNotificationCount: newNotificationCount,
                    lastNotificationId: lastNotificationId,
                });
                res.data.notificationList.forEach(d=>this.queue.push(d));
                this.processQueue();
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
                <IconButton className={classes.root} color="inherit" onClick={() => this.openNotifications()}>
                    <Badge badgeContent={this.state.newNotificationCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <Drawer
                    anchor="top"
                    className={classes.drawer}
                    open={this.state.showOverlay}
                    onClose={()=>this.setState({"showOverlay":false})}
                >
                    <div className={classes.title} color="primary">
                        <span>Notifications</span>
                        <IconButton color="inherit" className={classes.notificationClose} onClick={()=>this.setState({"showOverlay":false})}>
                            <Close />
                        </IconButton>
                    </div>
                    <div className={classes.notificationList}>
                        {
                            this.state.notificationList == null || this.state.notificationList.length === 0 ?
                                <div>No Notifications</div>
                            :
                            this.state.notificationList.map((item, i) => {
                                return <div key={i} className={classes.notificationItem}>
                                    <div className={classes.notificationColumn1}>
                                        <div className={classes.notificationRowTitle}>{item.notification_id+" - "+item.title}</div>
                                        <div className={classes.notificationRow}>{
                                                item.message.split("\r\n").reduce((acc, curr, i) => 
                                                    (acc.length ? [...acc, <br key={i}/>, curr] : [curr]
                                                ), [])
                                            }
                                        </div>
                                        <div className={classes.notificationTimeRow}>{item.created}</div>
                                    </div>
                                    <div className={classes.notificationColumn2}>
                                        {!item.has_seen && <div>
                                            <FiberNew fontSize="large"/>
                                        </div>}
                                        {item.url != null && <div>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                to={item.url} component={Link}
                                                onClick={()=>this.handleGotoDrawer(item)}>Goto</Button>
                                        </div>}
                                    </div>
                                </div> 
                            })
                        }
                    </div>
                    <div className={classes.loadMoreContainer}>
                        {this.state.totalCount !== this.state.notificationList.length &&
                            <Button
                                className={classes.loadMore}
                                variant="outlined"
                                color="primary" 
                                onClick={()=>this.getNotifications()}>Load More</Button>
                        }
                    </div>
                </Drawer>

                <Snackbar
                    key={this.state.messageInfo.notification_id}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.open}
                    // autoHideDuration={6000}
                    onClose={this.handleClosePopUp}
                    onExited={this.handleExited}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id"><span className={classes.notificationTitle}>{this.state.messageInfo.title}</span><br/>{
                        this.state.messageInfo.message.split("\r\n").reduce((acc, curr, i) => 
                            (acc.length ? [...acc, <br key={i}/>, curr] : [curr]
                        ))}</span>}
                    action={
                        (this.state.messageInfo.url != null?[
                            <Button key="goto" color="secondary" size="small"
                            to={this.state.messageInfo.url}
                            onClick={()=>this.handleGotoPopUp(this.state.messageInfo)} component={Link}>
                                GOTO
                            </Button>]:[]
                        ).concat([
                            <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                className={classes.close}
                                onClick={this.handleClosePopUp}
                                >
                                <Close />
                            </IconButton>,
                        ])
                    }
                    />
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Notifications);
