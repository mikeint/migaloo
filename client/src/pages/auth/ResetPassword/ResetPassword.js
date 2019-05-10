import React from 'react';
import {post, cancel} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Redirect } from 'react-router-dom';
import FormValidation from '../../../FormValidation';

const styles = theme => ({
    textField: {
      width: 400
    },
    white:{
        color:"white"
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
        margin: "20px 0px"
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
        stateName: "password",
        errorText: "Please enter a password",
        length: 8
    },
    {
        stateName: "password2",
        errorText: "Please repeat your password",
        length: 8
    },
    {
        stateName: "password",
        stateName2: "password2",
        errorText: "Passwords do not match",
        type: "password"
    },
    {
        stateName: "password",
        errorText: "Must have at least 1 upper and 1 lower case character",
        type: "regex",
        regex: [/[A-Z]/, /[a-z]/]
    }
]
class ResetPassword extends React.Component{
    constructor(props) {
        super(props);
        const nameParam = new Buffer(props.match.params.name, 'base64').toString('ascii')
		this.state = {
            token: props.match.params.token,
            name: nameParam,
            showPassword: false,
            password: '',
            password2: '',
            backToLogin: false,
            errors: {}
        };
        this.formValidation = new FormValidation(this, errorText);
    }

    componentWillUnmount = () => {
        cancel();
    }

    componentDidMount = () => {

    }
    handleChange = prop => event => {
        this.setState({ [prop]: event.target.value }, this.formValidation.shouldRevalidate);
    };
  
    handleClickShowPassword = () => {
        this.setState({ showPassword: !this.state.showPassword });
    };
    handleSubmit = () => {
        if(this.formValidation.isValid()){
            post("/api/auth/resetPassword", {password:this.state.password, token: this.state.token}).then(()=>{
                this.setState({ backToLogin: true });
            })
        }
    };

    render(){ 
        if(this.state.backToLogin)
            return <Redirect to='/login'/>
        const { classes } = this.props; 
        return (
            <div className={classes.root}>
                <div className={"pageHeading "+classes.header}>Reset Password</div>
                <div className={classes.formItem+" "+classes.white}>Reset password for {this.state.name}</div>
				<div className={classes.formItem}>
                    <TextField
                        className={classes.textField}
                        variant="outlined"
                        type={this.state.showPassword ? 'text' : 'password'}
                        label="Password"
                        value={this.state.password}
                        onChange={this.handleChange('password')}
                        InputLabelProps={{
                          classes: {
                            root: classes.cssLabel,
                          },
                        }}
                        InputProps={{
                            classes: {
                              root: classes.cssLabel,
                              notchedOutline: classes.notchedOutline,
                            },
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    className={classes.white}
                                    aria-label="Toggle password visibility"
                                    onClick={this.handleClickShowPassword}
                                >
                                {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}
                        {...this.formValidation.hasError("password")}
                    />
				</div>
				<div className={classes.formItem}>
                    <TextField
                        className={classes.textField}
                        variant="outlined"
                        type={this.state.showPassword ? 'text' : 'password'}
                        label="Repeat Password"
                        value={this.state.password2}
                        onChange={this.handleChange('password2')}
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
                        {...this.formValidation.hasError("password2")}
                    />
				</div> 
                <Button 
                    color="primary"
                    variant="contained"
                    className={classes.button}
                    onClick={this.handleSubmit}>Reset</Button>
            </div>
        );
    }
};

export default withStyles(styles)(ResetPassword);
