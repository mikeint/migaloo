import React, { Component } from 'react';  
import axios from 'axios';
import AddressInput from '../AddressInput/AddressInput';
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
        regex: [/@/, /\.[A-Za-z0-9]+$/]
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
        stateName: "address.placeId",
        errorText: "Please select an address for the company"
    }
]
class RegisterEmployerForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            companyName: '',
            errorList: '',
            address:{},
            registered: false,
            errors:{}
        };
        this.register = this.register.bind(this);
        this.formValidation = new FormValidation(this, errorText);
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }
    handleChangeKV = (map) => {
        this.setState(map, this.formValidation.shouldRevalidate)
    }

    handleAddressChange(address){
        this.setState({address:address}, this.formValidation.shouldRevalidate)
    }

    register(e) {
        if(this.formValidation.isValid()){
            const newUser = {
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                type: 3, // Employer
                phoneNumber: this.state.phoneNumber,
                companyName: this.state.companyName,
                address: this.state.address,
            }; 
            
            axios.post('/api/auth/register', newUser).then((res)=>{
                this.setState({registered: true})
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
        
        return (
        
            <div className="container">
                {this.state.registered?
                <div>
                    You have been sent a verification email.<br />
                    Once you have validated your email address you will automatically be assigned an account manager and a link to post jobs.
                </div>
                :
                <React.Fragment>
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
                        <AddressInput
                            onChange={this.handleAddressChange.bind(this)}
                            {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                        />
                    </div>
                    <Button onClick={this.register} variant="contained" color="primary" className={classes.button} >Register</Button>
                </React.Fragment>}
            </div>
        );
    }
}

export default withStyles(styles)(RegisterEmployerForm);  