import React, { Component } from 'react';  
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions';
import { Redirect } from 'react-router-dom';

import './LoginForm.css';

class LoginForm extends Component {
    constructor() {
        super();
		this.state = {
            user: '',
			email: '',
            password: '',
            errorList: '',
		};
        this.Auth = new AuthFunctions();
    } 
 
     handleChange = (event) => {
        const target = event.target;
        const value = target.type==='checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    login = () => {
        axios.post('/api/users/login', {
            email: this.state.email,
            password: this.state.password
        })
        .then((res)=>{ 
            let token = res.data.token.replace(/Bearer/g, '').trim();

            this.Auth.setToken(token, ()=>{
                this.setState({ token: token })
            });
            this.Auth.setUser(res.data.user, () => {
                this.setState({ user: res.data.user })
            }) 
        }).catch(errors => 
            this.showErrors(errors)
            )
        };

        showErrors = (errors) => { 
            this.setState({ errorList: errors.response.data }); 
        };

  render() {
    const { email, password } = this.state;

    if (this.state.user) {
        if(this.Auth.loggedIn())
            sessionStorage.setItem("HROverlay", true);
            return <Redirect to='/activeJobs'/>
    }
    
    return (
       
        <React.Fragment>   
            <div className="loginHR"><div>HR</div></div>
            <div className="formItem"> 
                <input className={this.state.errorList.email ? "formControl error" : "formControl"} placeholder="Email" name='email' type='text' onChange={this.handleChange} value={email} required />
            </div>
            <div className="formItem"> 
                <input className={this.state.errorList.password ? "formControl error" : "formControl"} placeholder="Password" name='password' type='password' onChange={this.handleChange} value={password} required />
            </div>   
            <input onClick={this.login} type="submit" value="Login" className="loginBtn" />
            <div className="forgot-password"> 
                Forgot Password
            </div>   
		</React.Fragment> 
    );
  }
}

export default LoginForm;
