import React from 'react'; 
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    alertClose: {
        position: "absolute",
        right: "10px"
    },
    alertTitle: {
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
    alertItem: {
        borderBottom: "1px solid #1a2b6d59",
        textAlign: "left",
        padding: "10px 15px",
        overflow: "hidden",
        background: "#1a2b6d0a",
        textWeight: "bold",
        borderRadius: "10px",
        marginBottom: "10px"
    },
    alertTimeRow: {
        fontSize: "10px",
        paddingTop: "5px",
        textTransform: "uppercase",
        color: theme.palette.primary.main
    },
    alertRowTitle: {
        fontWeight: "bold", 
        lineHeight: "unset"
    },
    alertRow: {
        lineHeight: "unset"
    }
})
class BuildNotifications extends React.Component{

    constructor(props) {
        super(props);
		this.state = { 
            close: props.close
        }; 
    }
   
    render(){
        const { classes } = this.props;
        return ( 
            <React.Fragment>
                <div className={classes.alertTitle} color="primary">
                    <span>Notifications</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={this.state.close}>
                        <Close />
                    </IconButton>
                </div>
                <div className={classes.notificationList}>
                    {
                        this.props.notificationList == null || this.props.notificationList.length === 0 ?
                            <div>No Notifications</div>
                        :
                        this.props.notificationList.map((item, i) => {
                            return <div key={i} className={classes.alertItem}>
                                <div className={classes.alertRowTitle}>{item.title}</div>
                                <div className={classes.alertRow}>{
                                    item.message.split("\r\n").reduce((acc, curr, i) => 
                                        (acc.length ? [...acc, <br key={i}/>, curr] : [curr]
                                    ), [])
                                }</div>
                                <div className={classes.alertTimeRow}>{item.created}</div>
                            </div> 
                        })
                    }
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(BuildNotifications);