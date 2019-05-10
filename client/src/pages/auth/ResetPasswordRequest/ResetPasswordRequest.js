import React from 'react';
import {get, getWithParams, post, cancel, getNewAuthToken} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Redirect } from 'react-router-dom';
import FormValidation from '../../../FormValidation';

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
        margin: "20px 0px",
        color: "white"
    },
    cssLabel: {
        color: "white !important",
    },
    notchedOutline: {
        borderColor: "white !important",
    }
});
const errorText = [
    {
        stateName: "email",
        errorText: "Please enter your email"
    },
    {
        stateName: "email",
        errorText: "Please enter a valid email",
        type: "regex",
        regex: [/@/, /^[^\s]+$/]
    }
]

class ResetPasswordRequest extends React.Component{
    constructor(props) {
        super(props);
		this.state = {
            backToLogin: false,
            email: '',
            errors: {},
            didSend: false
        };
        this.formValidation = new FormValidation(this, errorText);
    }

    sendRequest = () => {
        if(this.formValidation.isValid()){
            post("/api/auth/sendPasswordReset", {email:this.state.email}).then(()=>{
                this.setState({didSend: true})
            });
        }
    };
    handleSubmit = () => {
        this.setState({backToLogin: true});
    };
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() }, this.formValidation.shouldRevalidate)
    }

    render(){
        if(this.state.backToLogin)
            return <Redirect to='/login'/>
        const { classes } = this.props; 
        return (
            <div className={classes.root}>
                <div className={"pageHeading "+classes.header}>Reset Password</div>
                {
                    !this.state.didSend ? 
                    <React.Fragment>
                        <div className={classes.formItem}>Please enter your email</div>
                        <div>
                            <TextField
                                name="email"
                                label="Email"
                                className={classes.textField}
                                onBlur={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                InputLabelProps={{
                                  classes: {
                                    root: classes.cssLabel,
                                  },
                                }}
                                InputProps={{
                                    classes: {
                                      root: classes.cssLabel,
                                      notchedOutline: classes.notchedOutline,
                                    }
                                }}
                                {...this.formValidation.hasError("email")}
                            />
                        </div>
                        <div className={classes.formItem}>
                            <Button 
                                color="primary"
                                variant="contained"
                                className={classes.button}
                                onClick={this.sendRequest}>Send Request</Button>
                        </div>
                        <div className={classes.formItem}>
                            <Button 
                                color="primary"
                                variant="contained"
                                className={classes.button}
                                onClick={this.handleSubmit}>Back To Login</Button>
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

export default withStyles(styles)(ResetPasswordRequest);
