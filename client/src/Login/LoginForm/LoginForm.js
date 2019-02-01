import React, { Component } from 'react';  
import axios from 'axios';
import AuthFunctions from '../../AuthFunctions';
import { Redirect } from 'react-router-dom';

import './LoginForm.css';

class LoginForm extends Component {
    constructor() {
        super();
		this.state = {
            user: '',
			email: '',
            password: '', 
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
                this.setState({
                    token: token
                })
            });
            
            this.Auth.setUser(res.data.user, () => {
                this.setState({ user: res.data.user })
            })
        })
    };

  render() {
    const { email, password } = this.state;
 
    if (this.state.user) {
        if(this.Auth.loggedIn())
            return <Redirect to='/Hub' user={this.Auth.getUser()}/>
    }
    
    return (
       
        <React.Fragment> 
			 {/* <form onSubmit={this.login}> */}
                <h1 className="">Sign In</h1>
                    <div className="formItem"> 
                        <input className="formControl" placeholder="email" name='email' type='text' onChange={this.handleChange} value={email} required />
                    </div>
                    <div className="formItem"> 
                        <input className="formControl" placeholder="password" name='password' type='password' onChange={this.handleChange} value={password} required />
                    </div>  
                    <input onClick={this.login} type="submit" value="Login" className="loginBtn" />
                {/* </form> */}
		</React.Fragment> 
    );
  }
}

export default LoginForm;
