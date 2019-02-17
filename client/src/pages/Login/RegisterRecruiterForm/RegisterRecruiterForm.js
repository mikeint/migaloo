import React, { Component } from 'react';  
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions';
import { Redirect } from 'react-router-dom';

import './RegisterRecruiterForm.css';

class RegisterRecruiterForm extends Component {
  constructor() {
    super();
    this.state = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        password2: '', 
        errorList: ''
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
			type: 1, // Recruiter
			password: this.state.password,
			password2: this.state.password2
		}; 
        
        axios.post('/api/users/register', newUser).then((res)=>{
            axios.post('/api/users/login', {
                email: this.state.email,
                password: this.state.password
            }).then((res)=>{
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

  showErrors = (errors) => { 
	this.setState({ errorList: errors.response.data }); 
}

  render() {
    const { firstName, lastName, email, password, password2 } = this.state;

    if(this.Auth.loggedIn()){
        if (this.state.user)
            return <Redirect to='/activeJobs' />
    }  
	
    return (
       
        <div className="container">
			<h1>Sign Up</h1> 
			{/* <form onSubmit={this.register}> */}

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
					<input type="password" className={this.state.errorList.password ? "formControl error" : "formControl"} placeholder="Password" name="password" value={password} onChange={this.onChange} required />
				</div>
				<div className="formItem">
					<input type="password" className={this.state.errorList.password2 ? "formControl error" : "formControl"} placeholder="Confirm Password" name="password2" value={password2} onChange={this.onChange} required />
				</div> 
 
				<input onClick={this.register} type="submit" value="register" className="loginBtn" />
			{/* </form> */}
		</div> 
    );
  }
}

export default RegisterRecruiterForm;
