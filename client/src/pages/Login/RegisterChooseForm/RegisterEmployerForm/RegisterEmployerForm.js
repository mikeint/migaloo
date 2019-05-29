import React, { Component } from 'react';  
import axios from 'axios';
import AuthFunctions from '../../../../AuthFunctions';
import { Redirect } from 'react-router-dom';

class RegisterEmployerForm extends Component {
    constructor() {
        super();
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            companyName: '',
            errorList: '',
            registered: false
        };
        this.Auth = new AuthFunctions();
        this.onChange = this.onChange.bind(this);
        this.register = this.register.bind(this);
    }

  

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    register(e) {
        e.preventDefault();

        const newUser = {
			firstName: this.state.firstName,
			lastName: this.state.lastName,
			email: this.state.email,
			type: 3, // Employer
			phoneNumber: this.state.phoneNumber,
			companyName: this.state.companyName,
		}; 
        
        axios.post('/api/auth/register', newUser).then((res)=>{
            this.setState({registered: true})
        }).catch(errors => 
            this.showErrors(errors)
        );  
    }

    showErrors = (errors) => { 
        this.setState({ errorList: errors.response.data }); 
    }


    render() {
        const { firstName, lastName, email, phoneNumber, companyName } = this.state;

        if(this.Auth.loggedIn()){
            if (this.state.user)
                return <Redirect to='/employer' />
        }  
        
        return (
        
            <div className="container">
                {this.state.registered?
                <div>
                    You have been sent a verification email.<br />
                    Once you have validated your email address you will automatically be assigned an account manager and a link to post jobs.
                </div>
                :
                <React.Fragment>
                    <div className="formItem"> 
                        <input type="text" className={this.state.errorList.firstName ? "formControl error" : "formControl"} placeholder="First Name" name="firstName" value={firstName} onChange={this.onChange} required />
                    </div>
                    <div className="formItem"> 
                        <input type="text" className={this.state.errorList.lastName ? "formControl error" : "formControl"} placeholder="Last Name" name="lastName" value={lastName} onChange={this.onChange} required />
                    </div>
                    <div className="formItem"> 
                        <input type="email" className={this.state.errorList.email ? "formControl error" : "formControl"} placeholder="Email" name="email" value={email} onChange={this.onChange} required />
                    </div>
                    <div className="formItem"> 
                        <input type="text" className={this.state.errorList.phoneNumber ? "formControl error" : "formControl"} placeholder="Phone Number" name="phoneNumber" value={phoneNumber} onChange={this.onChange} required />
                    </div>
                    <div className="formItem"> 
                        <input type="text" className={this.state.errorList.companyName ? "formControl error" : "formControl"} placeholder="Company Name" name="companyName" value={companyName} onChange={this.onChange} required />
                    </div>
    
                    <input onClick={this.register} type="submit" value="Register" className="loginBtn" />
                </React.Fragment>}
            </div>
        );
    }
}

export default RegisterEmployerForm;
