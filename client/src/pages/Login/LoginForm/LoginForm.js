import React, { Component } from 'react';  
import AuthFunctions from '../../../AuthFunctions';
import { Redirect } from 'react-router-dom';
import Whale from '../../../components/Whale/Whale';
import ApiCalls from '../../../ApiCalls';   
import Button from '@material-ui/core/Button';

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
            if(res == null) return
            let token = res.data.token.replace(/Bearer/g, '').trim();

            this.Auth.setToken(token, ()=>{
                console.log("set token data ", token)
                this.setState({ token: token },
                    ()=>{
                        ApiCalls.getNewAuthToken();
                        this.Auth.setUser(res.data.user, () => {
                            console.log("setUser data ", res.data.user)
                            this.setState({ user: res.data.user })
                        })
                    })
            });
        }).catch(this.showErrors)
    };
    submit = (event) => {
        if(event.key === 'Enter'){
           this.login();
        }
    }

    showErrors = (errors) => { 
            this.setState({ errorList: errors.response.data }); 
        };

  render() {
    const { user, email, password } = this.state;

    if (user) {
        if(this.Auth.loggedIn())
            sessionStorage.setItem("migalooOverlay", true);
        if(this.state.user.userType === 1)
            return <Redirect to='/recruiter'/>
        else
            return <Redirect to='/employer'/>
    }
    
    return (
       
        <React.Fragment>

            <Whale />
            <div className="formItem"> 
                <input onKeyPress={(event) => this.submit(event)} className={this.state.errorList.email ? "formControl error" : "formControl"} placeholder="Email" name='email' type='text' onChange={this.handleChange} value={email} required />
            </div>
            <div className="formItem"> 
                <input onKeyPress={(event) => this.submit(event)} className={this.state.errorList.password ? "formControl error" : "formControl"} placeholder="Password" name='password' type='password' onChange={this.handleChange} value={password} required />
            </div>   
            <Button onClick={this.login} variant="contained" color="primary" className="loginBtn" >Login</Button>
            <div className="forgot-password"> 
                Forgot Password
            </div>   
		</React.Fragment> 
    );
  }
}

export default LoginForm;
