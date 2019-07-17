import React from 'react';
import {post} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import {Button, TextField, LinearProgress} from '@material-ui/core';
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
    },
    white: {
        color: "white !important",
        borderColor: "white !important",
    }
});

class VerifyEmail extends React.Component{
    constructor(props) {
        super(props);
		this.state = {
            token: props.match.params.token,
            backToLogin: false,
            goToIt: false,
            email: '',
            verified: null
        };
    }

    componentDidMount = () => {
        post("/api/auth/verifyEmail", {token: this.state.token}).then(()=>{
            this.setState({ verified: true });
        })
    }
    sendRequest = () => {
        post("/api/auth/sendEmailVerification", {email: this.state.email}).then(()=>{});
    };
    handleSubmit = () => {
        if(this.state.verified === true)
            this.setState({goToIt: true});
        else
            this.setState({backToLogin: true});
    };

    render(){
        if(this.state.backToLogin)
            return <Redirect push to='/login'/>
        if(this.state.goToIt)
            return <Redirect push to={this.state.userType===1?'/recruiter':'/employer'}/>
        const { classes } = this.props; 
        return (
            <div className={classes.root}>
                <div className={"pageHeading "+classes.header}>Account Verification</div>
                {
                    this.state.verified === null ?
                    <React.Fragment>
                        <LinearProgress />
                        <div className={classes.formItem}>Checking the validity of your token.</div>
                    </React.Fragment>
                    :
                    (this.state.verified === true ?
                    <React.Fragment>
                        <div className={classes.formItem}>Your account has been verified!</div>
                        <br/>
                        {this.state.userType===1?
                            <div className={classes.formItem}>
                                <Button 
                                    color="primary"
                                    variant="contained"
                                    className={classes.button}
                                    onClick={this.handleSubmit}>Get Started</Button>
                            </div>
                        :
                            <div className={classes.formItem}>
                                Our Account Managers have recieved your request and will be with you shortly.<br/>
                                Please allow them 1 buisness day to contact you.
                            </div>
                        }
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <div className={classes.formItem}>The Account verification link has expired.</div>
                        <div className={classes.formItem}>Please resend the request and wait up to 10 minutes for the email to be recieved.</div>
                        <div className={classes.formItem}>If you do not recieve the email in this time resend the request</div>
                        <br/>
                        <TextField
                            variant="outlined"
                            className={classes.textField}
                            value={this.state.email}
                            InputLabelProps={{
                              classes: {
                                root: classes.white,
                              },
                            }}
                            InputProps={{
                                classes: {
                                  root: classes.white,
                                  notchedOutline: classes.white,
                                }
                            }}
                            onChange={(e)=>this.setState({email:e.target.value})}
                            label="Email" />
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
                    </React.Fragment>)
                }
            </div>
        );
    }
};

export default withStyles(styles)(VerifyEmail);
