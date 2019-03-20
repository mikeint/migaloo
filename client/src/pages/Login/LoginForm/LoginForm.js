import React, { Component } from 'react';  
import AuthFunctions from '../../../AuthFunctions';
import { Redirect, NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  

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
        ApiCalls.post('/api/users/login', {
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
        }).catch(this.showErrors)
    };

    showErrors = (errors) => { 
            this.setState({ errorList: errors.response.data }); 
        };

  render() {
    const { user, email, password } = this.state;

    if (user) {
        if(this.Auth.loggedIn())
            sessionStorage.setItem("HROverlay", true);
        if(this.state.user.userType === 1)
            return <Redirect to='/recruiter'/>
        else
            return <Redirect to='/employer'/>
    }
    
    return (
       
        <React.Fragment>   
            <NavLink to='/'>
                <div className="mainLogoContainer">
                    <div className="logoCircleDiv div1"></div>
                    <div className="logoCircleDiv div2"></div>
                    <div className="logoCircleDiv div3"></div>
                    <div className="logoCircleDiv div4"></div>
                    <div className="logoText"></div>
                </div>
            </NavLink>

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
