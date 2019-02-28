import React, { Component } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import Landing from './layout/Landing/Landing';
import Login from './pages/Login/Login'; 

import ActiveJobs from './pages/employer/ActiveJobs/ActiveJobs';
import PostAJob from './pages/employer/PostAJob/PostAJob';
import EmployerProfile from './pages/employer/Profile/Profile';
import RecruiterProfile from './pages/recruiter/Profile/Profile'; 
import ChatPage from './pages/any/ChatPage/ChatPage';
import JobList from './pages/recruiter/JobList/JobList';
import CandidateList from './pages/recruiter/CandidateList/CandidateList';
import AddCandidate from './pages/recruiter/AddCandidate/AddCandidate';
import { PrivateRecruiterRoute, PrivateEmployerRoute } from './PrivateRoute';
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
                    <PrivateEmployerRoute exact path="/employer/postAJob" component={PostAJob} />
                    <PrivateEmployerRoute exact path="/employer/profile" component={EmployerProfile} />  
                    <PrivateEmployerRoute exact path="/employer/activeJobs" component={ActiveJobs} />
                    <PrivateEmployerRoute exact path="/employer" redirect="/employer/postAJob" />
                    <PrivateEmployerRoute exact path="/employer/chat" component={ChatPage} />
                    <PrivateRecruiterRoute exact path="/recruiter/profile" component={RecruiterProfile} />
                    <PrivateRecruiterRoute exact path="/recruiter/candidateList" component={CandidateList} />
                    <PrivateRecruiterRoute exact path="/recruiter/addCandidate" component={AddCandidate} />
                    <PrivateRecruiterRoute exact path="/recruiter/jobList/:candidateId" component={JobList} />
                    <PrivateRecruiterRoute exact path="/recruiter/jobList" component={JobList} />
                    <PrivateRecruiterRoute exact path="/recruiter" redirect="/recruiter/jobList" />
                    <PrivateRecruiterRoute exact path="/recruiter/chat" component={ChatPage} />

                    <Route exact path="/" component={Landing} />
                    <Route exact path='/login' render={ () => (<Login />) } />
 
                </React.Fragment>
            </BrowserRouter> 
        );
    }
}

export default App;

