import React, { Component } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import Landing from './layout/Landing/Landing';
import Login from './pages/Login/Login'; 
import Choose from './components/Choose/Choose'; 

import ActiveJobs from './pages/ActiveJobs/ActiveJobs';
import PostAJob from './pages/PostAJob/PostAJob';
import Profile from './pages/Profile/Profile';
import PrivateRoute from './PrivateRoute';
import AuthFunctions from './AuthFunctions'; 

import './App.css';
 
class App extends Component { 
    constructor() {
        super();
		this.state = {
            user: '',
			token: '',
		};
        this.Auth = new AuthFunctions();
	}

    componentDidMount = () => {
        this.setState({
            user: this.Auth.getUser() || "",
			token: this.Auth.getToken() || ""
        });
    }

    render() {

        return ( 
            <BrowserRouter>
                <React.Fragment>
                    <PrivateRoute exact path="/activeJobs" component={ActiveJobs} />
                    <PrivateRoute exact path="/postAJob" component={PostAJob} />
                    <PrivateRoute exact path="/profile" component={Profile} /> 
                    
                    <PrivateRoute exact path="/choose" component={Choose} />

                    <Route exact path="/" component={Landing} />
                    <Route exact path='/login' render={ () => (<Login />) } />
 
                </React.Fragment>
            </BrowserRouter> 
        );
    }
}

export default App;

