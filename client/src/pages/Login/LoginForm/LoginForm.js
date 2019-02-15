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
            
            var tmpErrList = [];
            var errArr = errors.response.data;
            for (var key in errArr) {
                if (errArr.hasOwnProperty(key)) {  
                    tmpErrList.push(errArr[key]);
                }
            } 
            this.setState({ errorList: tmpErrList }); 
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
			 {/* <form onSubmit={this.login}> */}
                <h1 className="">Sign In</h1>
                    <div className="formItem"> 
                        <input className="formControl" placeholder="Email" name='email' type='text' onChange={this.handleChange} value={email} required />
                    </div>
                    <div className="formItem"> 
                        <input className="formControl" placeholder="Password" name='password' type='password' onChange={this.handleChange} value={password} required />
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
                    <input onClick={this.login} type="submit" value="Login" className="loginBtn" />
                    <div className="forgot-password"> 
                        Forgot Password
                    </div>  
                {/* </form> */}
		</React.Fragment> 
    );
  }
}

export default LoginForm;
