import React from 'react'; 
import './BuildNotifications.css';     
import AlertItem from '../../AlertItem/AlertItem'; 
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
        backgroundColor: "#263c54",
        textAlign: "center",
        color: "#fff",
        lineHeight: "50px",
        fontSize: "24px",
        fontWeight: "bold", 
        position: "relative"
    },
    alertList: {
        padding: "10px",
        height: "75%",
        overflowY: "scroll"
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
                    <IconButton color="primary" className={classes.alertClose} onClick={this.state.close}>
                        <Close color="secondary" />
                    </IconButton>
                </div>
                <div className={classes.alertList}>
                    {this.props.alertList.map((item, i) => {
                        return <AlertItem key={i} alert={item}/>
                    })}
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(BuildNotifications);