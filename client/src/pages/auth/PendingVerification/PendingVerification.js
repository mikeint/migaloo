import React from 'react';
import {post} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AuthFunctions from '../../../AuthFunctions'; 
import { Redirect } from 'react-router-dom';

const styles = theme => ({
    textField: {
      width: 400,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
    },
    button: {
      width: "80%",
    },
    root:theme.movingBackground,
    formItem:{
        color:"white",
        fontSize: 18,
        margin: "20px 0px"
    }
});

class PendingVerification extends React.Component{
    constructor(props) {
        super(props);
        this.Auth = new AuthFunctions();
        const user = this.Auth.getUser()
		this.state = {
            backToLogin: false,
            email: user.email
        };
    }

    componentDidMount = () => {
        this.sendRequest();
    }
    sendRequest = () => {
        post("/api/auth/sendEmailVerification", {}).then(()=>{});
    };
    handleSubmit = () => {
        this.setState({backToLogin: true});
    };

    render(){
        if(this.state.backToLogin)
            return <Redirect to='/login'/>
        const { classes } = this.props; 
        return (
            <div className={classes.root}>
                <div className={"pageHeading "+classes.header}>Verification Pending</div>
                <div className={classes.formItem}>An email has been sent to {this.state.email}</div>
                <div className={classes.formItem}>Please wait up to 10 minutes for the email to be recieved.</div>
                <div className={classes.formItem}>If you do not recieve the email in this time resend the request</div>
				<br/>
                <div className={classes.formItem}>
                    <Button 
                        color="primary"
                        variant="contained"
                        className={classes.button}
                        onClick={this.sendRequest}>Resend Request</Button>
                </div>
                <div className={classes.formItem}>
                    <Button 
                        color="primary"
                        variant="contained"
                        className={classes.button}
                        onClick={this.handleSubmit}>Back To Login</Button>
                </div>
            </div>
        );
    }
};

export default withStyles(styles)(PendingVerification);
