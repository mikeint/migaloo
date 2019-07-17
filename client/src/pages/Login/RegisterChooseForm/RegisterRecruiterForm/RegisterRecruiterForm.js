import React, { Component } from 'react';  
import axios from 'axios';
import AuthFunctions from '../../../../AuthFunctions';
import { Redirect } from 'react-router-dom';
import { TextField, Button } from '@material-ui/core';
import FormValidation from '../../../../FormValidation';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    textField: {
        width: "100%",
        marginTop: 10
    },
    white: {
        color: "white !important",
        borderBottomColor: "white !important",
        '&:before': {
            color: "white",
            borderBottomColor: "white",
        },
        '&:after': {
            color: "white",
            borderBottomColor: "white",
        },
        '&:hover': {
            color: "white",
            borderBottomColor: "white",
        },
    },
    button:{
        width: "90%",
        margin: "20px"
    }
})
const errorText = [
    {
        stateName: "firstName",
        errorText: "Please enter your first name"
    },
    {
        stateName: "lastName",
        errorText: "Please enter your last name"
    },
    {
        stateName: "email",
        errorText: "Please enter your email"
    },
    {
        stateName: "email",
        errorText: "Please enter a valid email",
        type: "regex",
        regex: [/[@]/, /\.[A-Za-z0-9]+$/]
    },
    {
        stateName: "phoneNumber",
        errorText: "Please enter your phone number"
    },
    {
        stateName: "companyName",
        errorText: "Please enter your companies name"
    },
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
    // {
    //     stateName: "address.placeId",
    //     errorText: "Please select an address for the company"
    // }
]
class RegisterRecruiterForm extends Component {
    constructor() {
        super();
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            password2: '', 
            errorList: '',
            companyName: '',
            errors:{}
        };
        this.Auth = new AuthFunctions();
        this.register = this.register.bind(this);
        this.formValidation = new FormValidation(this, errorText);
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }
    handleChangeKV = (map) => {
        this.setState(map, this.formValidation.shouldRevalidate)
    }

    register(e) {
        if(this.formValidation.isValid()){
            const newUser = {
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                type: 1, // Recruiter
                password: this.state.password,
                password2: this.state.password2,
                companyName: this.state.companyName
            }; 
            
            axios.post('/api/auth/register', newUser).then((res)=>{
                axios.post('/api/auth/login', {
                    email: this.state.email,
                    password: this.state.password
                }).then((res)=>{
                    sessionStorage.setItem("migalooOverlay", true);
                    this.Auth.clearToken();
                    let token = res.data.token.replace(/Bearer/g, '').trim();

                    this.Auth.setToken(token, ()=>{
                        this.setState({
                            token: token
                        })
                    });
                    this.Auth.setUser(res.data.user, ()=> {
                        this.setState({
                            user: res.data.user
                        })
                    });
                })

            }).catch(errors => 
                this.showErrors(errors)
            );  
        }
    }

    showErrors = (errors) => { 
        this.setState({ errorList: errors.response.data }); 
    }

    render() {
        const { classes } = this.props;

        if(this.Auth.loggedIn()){
            if (this.state.user)
                return <Redirect push to='/recruiter' />
        }  
        
        return (
        
            <div className="container">
                {/* <form onSubmit={this.register}> */} 
                <div>
                    <TextField
                        name="firstName"
                        label="First Name"
                        onChange={this.handleChange}
                        className={classes.textField}
                        InputProps={{classes: {root: classes.white, focused: classes.white}}}
                        InputLabelProps={{ classes: {root:classes.white, focused: classes.white} }}
                        margin="normal"
                        {...this.formValidation.hasError("firstName")}
                    />
                </div>
                <div>
                    <TextField
                        name="lastName"
                        label="Last Name"
                        className={classes.textField}
                        InputProps={{classes: {root: classes.white}}}
                        InputLabelProps={{ classes: {root:classes.white} }}
                        onChange={this.handleChange}
                        margin="normal"
                        {...this.formValidation.hasError("lastName")}
                    />
                </div>
                <div>
                    <TextField
                        name="email"
                        label="Email"
                        className={classes.textField}
                        InputProps={{classes: {root: classes.white}}}
                        InputLabelProps={{ classes: {root:classes.white} }}
                        onChange={this.handleChange}
                        margin="normal"
                        {...this.formValidation.hasError("email")}
                    />
                </div>
                <div>
                    <TextField
                        name="phoneNumber"
                        label="Phone Number"
                        className={classes.textField}
                        InputProps={{classes: {root: classes.white}}}
                        InputLabelProps={{ classes: {root:classes.white} }}
                        onChange={this.handleChange}
                        margin="normal"
                        {...this.formValidation.hasError("phoneNumber")}
                    />
                </div>
                <div>
                    <TextField
                        name="companyName"
                        label="Company Name"
                        className={classes.textField}
                        InputProps={{classes: {root: classes.white}}}
                        InputLabelProps={{ classes: {root:classes.white} }}
                        onChange={this.handleChange}
                        margin="normal"
                        {...this.formValidation.hasError("companyName")}
                    />
                </div>
                <div>
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        className={classes.textField}
                        InputProps={{classes: {root: classes.white}}}
                        InputLabelProps={{ classes: {root:classes.white} }}
                        onChange={this.handleChange}
                        margin="normal"
                        {...this.formValidation.hasError("password")}
                    />
                </div>
                <div>
                    <TextField
                        name="password2"
                        label="Repeat Password"
                        type="password"
                        className={classes.textField}
                        InputProps={{classes: {root: classes.white}}}
                        InputLabelProps={{ classes: {root:classes.white} }}
                        onChange={this.handleChange}
                        margin="normal"
                        {...this.formValidation.hasError("password2")}
                    />
                </div>
                
                <Button onClick={this.register} variant="contained" color="primary" className={classes.button}>Register</Button>
                {/* </form> */}
            </div> 
        );
    }
}

export default withStyles(styles)(RegisterRecruiterForm);  