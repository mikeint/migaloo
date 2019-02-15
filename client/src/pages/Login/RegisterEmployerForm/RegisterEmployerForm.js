import React, { Component } from 'react';  
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions';
import { Redirect } from 'react-router-dom';

import './RegisterEmployerForm.css';

class RegisterEmployerForm extends Component {
  constructor() {
    super();
    this.state = {
			firstName: '',
			lastName: '',
      email: '',
      phoneNumber: '',
      companyName: '',
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
			type: 2, // Employer
			phoneNumber: this.state.phoneNumber,
			companyName: this.state.companyName,
			password: this.state.password,
			password2: this.state.password2
		}; 
	
	 axios.post('/api/users/register', newUser).then((res)=>{
		axios.post('/api/users/login', {
            email: res.data.email,
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

	})
		
	.catch(errors => 
		this.showErrors(errors)
	);  
  }

  showErrors = (errors) => {
 
	var tmpErrList = [];
	var errArr = errors.response.data;
	for (var key in errArr) {
		if (errArr.hasOwnProperty(key)) {  
			tmpErrList.push(errArr[key]);
		}
	} 
	this.setState({ errorList: tmpErrList });

}

  render() {
    const { firstName, lastName, email, phoneNumber, companyName, password, password2 } = this.state;

	if(this.Auth.loggedIn()){
        if (this.state.user)
            return <Redirect to='/choose' />
	} 
	
    return (
       
        <div className="container">
			<h1>Sign Up</h1> 
			{/* <form onSubmit={this.register}> */}

				<div className="formItem"> 
					<input type="text" className="formControl" placeholder="First Name" name="firstName" value={firstName} onChange={this.onChange} required />
				</div>
				<div className="formItem"> 
					<input type="text" className="formControl" placeholder="Last Name" name="lastName" value={lastName} onChange={this.onChange} required />
				</div>
				<div className="formItem"> 
					<input type="email" className="formControl" placeholder="Email" name="email" value={email} onChange={this.onChange} required />
				</div>
				<div className="formItem"> 
					<input type="text" className="formControl" placeholder="Phone Number" name="phoneNumber" value={phoneNumber} onChange={this.onChange} required />
				</div>
				<div className="formItem"> 
					<input type="text" className="formControl" placeholder="Company Name" name="companyName" value={companyName} onChange={this.onChange} required />
				</div>
				<div className="formItem">
					<input type="password" placeholder="Password" name="password" value={password} onChange={this.onChange} required />
				</div>
				<div className="formItem">
					<input type="password" placeholder="Confirm Password" name="password2" value={password2} onChange={this.onChange} required />
				</div>
				<div className="errorsList">
					{
						this.state.errorList ?
							<ul>
								{this.state.errorList.map((item, i) => {
									return (<li key={i} className="errorItem">{item}</li>);
								})}
							</ul>
						:
						"" 
					}
				</div>
 
				<input onClick={this.register} type="submit" value="register" className="loginBtn" />
			{/* </form> */}
		</div> 
    );
  }
}

export default RegisterEmployerForm;
