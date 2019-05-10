import React from 'react';
import {get, getWithParams, post, cancel, getNewAuthToken} from '../../../ApiCalls';  
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

class VerifyEmail extends React.Component{
    constructor(props) {
        super(props);
        this.Auth = new AuthFunctions();
        const user = this.Auth.getUser()
		this.state = {
            token: props.match.params.token,
            backToLogin: false,
            goToIt: false,
            verifySuccess: false,
            email: user.email,
            userType: user.userType
        };
    }

    componentDidMount = () => {
        post("/api/auth/verifyEmail", {token: this.state.token}).then(()=>{
            this.setState({ verifySuccess: true });
        })
    }
    sendRequest = () => {
        post("/api/auth/sendEmailVerification", {}).then(()=>{});
    };
    handleSubmit = () => {
        if(this.state.verifySuccess)
            this.setState({goToIt: true});
        else
            this.setState({backToLogin: true});
    };

    render(){
        if(this.state.backToLogin)
            return <Redirect to='/login'/>
        if(this.state.goToIt)
            return <Redirect to={this.state.userType===1?'/recruiter':'/employer'}/>
        const { classes } = this.props; 
        return (
            <div className={classes.root}>
                <div className={"pageHeading "+classes.header}>Account Verification</div>
                {
                    this.state.verifySuccess ?
                    <React.Fragment>
                        <div className={classes.formItem}>You account has been verified!</div>
                        <br/>
                        <div className={classes.formItem}>
                            <Button 
                                color="primary"
                                variant="contained"
                                className={classes.button}
                                onClick={this.handleSubmit}>Get Started</Button>
                        </div>
                    </React.Fragment>
                    :
                    <React.Fragment>
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
                    </React.Fragment>
                }
            </div>
        );
    }
};

export default withStyles(styles)(VerifyEmail);
