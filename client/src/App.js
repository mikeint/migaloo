import React, { Component } from "react";
import { Route, BrowserRouter, Switch } from "react-router-dom";
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
                    <Switch>
                        <PrivateRecruiterRoute exact path="/recruiter" redirect="/recruiter/jobList" /> { /* Reroute to the first recruiter page */ }
                        <PrivateRecruiterRoute strict path="/recruiter" component={RecruiterRouter} />
                    </Switch>
                    <Switch>
                        <PrivateEmployerRoute exact path="/employer" redirect="/employer/activeJobs" /> { /* Reroute to the first employer page */ }
                        <PrivateEmployerRoute strict path="/employer" component={EmployerRouter} />
                    </Switch>
                    <Route exact path="/" component={Landing} />
                    <Route exact path='/login' render={ () => (<Login />) } />
                </React.Fragment>
            </BrowserRouter> 
        );
    }
}

export default App;

