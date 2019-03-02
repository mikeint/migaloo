import React, { Component } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import Landing from './layout/Landing/Landing';
import Login from './pages/Login/Login'; 

import { PrivateEmployerRoute, PrivateRecruiterRoute } from './PrivateRoute';
import RecruiterRouter from './pages/recruiter/RecruiterRouter';
import EmployerRouter from './pages/employer/EmployerRouter';

import './App.css';

class App extends Component { 
    render() {

        return ( 
            <BrowserRouter>
                <React.Fragment>
                    <PrivateRecruiterRoute strict path="/recruiter" component={RecruiterRouter} />
                    <PrivateRecruiterRoute exact path="/recruiter" redirect="/recruiter/jobList" />
                    <PrivateEmployerRoute strict path="/employer" component={EmployerRouter} />
                    <PrivateEmployerRoute exact path="/employer" redirect="/recruiter/postAJob" />
                    <Route exact path="/" component={Landing} />
                    <Route exact path='/login' render={ () => (<Login />) } />
                </React.Fragment>
            </BrowserRouter> 
        );
    }
}

export default App;

